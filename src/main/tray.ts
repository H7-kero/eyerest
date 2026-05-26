import { Tray, Menu, nativeImage } from 'electron'
import { join } from 'path'
import type { TimerState } from '../shared/types'

export class AppTray {
  private tray: Tray | null = null
  private state: TimerState = 'running'
  private remainingMinutes: number = 0
  private menuActions: { 
    onPause: () => void; 
    onResume: () => void; 
    onPauseRest: () => void; 
    onResumeFromPauseRest: () => void; 
    onReset: () => void; 
    onRestNow: () => void; 
    onSettings: () => void; 
    onStatistics: () => void; 
    onQuit: () => void 
  }

  constructor(actions: AppTray['menuActions']) { this.menuActions = actions }

  init(): void {
    const icon = this.getIconForState(this.state)
    this.tray = new Tray(icon)
    this.tray.setToolTip('简休 - 工作中')
    this.tray.on('click', () => { this.menuActions.onSettings() })
    this.updateMenu()
  }

  updateState(state: TimerState): void {
    this.state = state
    if (this.tray) { this.tray.setImage(this.getIconForState(state)) }
  }

  updateTooltip(minutes: number): void {
    this.remainingMinutes = minutes
    if (!this.tray) return
    const stateLabels: Record<TimerState, string> = { 
      running: '工作中', 
      resting: '休息中', 
      paused: '已暂停', 
      idle: '空闲',
      pending: '即将休息',
      pausedRest: '已暂停休息提醒'
    }
    let tip = `简休 - ${stateLabels[this.state]}`
    if (this.state === 'running') tip += `（${minutes}分钟后提醒休息）`
    else if (this.state === 'resting') tip += `（剩余${minutes}分钟）`
    this.tray.setToolTip(tip)
  }

  destroy(): void { if (this.tray) { this.tray.destroy(); this.tray = null } }
  refreshMenu(): void { this.updateMenu() }

  private updateMenu(): void {
    if (!this.tray) return
    const contextMenu = Menu.buildFromTemplate([
      { label: '重置计时', click: () => this.menuActions.onReset() },
      { type: 'separator' },
      { 
        label: this.state === 'paused' ? '恢复计时' : this.state === 'pausedRest' ? '恢复休息提醒' : '暂停休息提醒', 
        click: () => { 
          if (this.state === 'paused') this.menuActions.onResume()
          else if (this.state === 'pausedRest') this.menuActions.onResumeFromPauseRest()
          else this.menuActions.onPauseRest()
        } 
      },
      { label: '立即休息', click: () => this.menuActions.onRestNow() },
      { type: 'separator' },
      { label: '打开设置', click: () => this.menuActions.onSettings() },
      { label: '查看今日统计', click: () => this.menuActions.onStatistics() },
      { type: 'separator' },
      { label: '退出简休', click: () => this.menuActions.onQuit() }
    ])
    this.tray.setContextMenu(contextMenu)
  }

  private getIconForState(state: TimerState): Electron.NativeImage {
    const iconName: Record<TimerState, string> = { 
      running: 'icon-running', 
      resting: 'icon-resting', 
      paused: 'icon-paused', 
      idle: 'icon-idle',
      pending: 'icon-paused',
      pausedRest: 'icon-paused'
    }
    
    // 尝试找到正确的图标路径
    let iconPath: string | undefined
    const possiblePaths = [
      // 开发环境
      join(process.cwd(), 'assets', `${iconName[state]}.png`),
      join(__dirname, '../../assets', `${iconName[state]}.png`),
      // 生产环境
      join(__dirname, '../assets', `${iconName[state]}.png`),
    ]
    
    for (const path of possiblePaths) {
      if (nativeImage.createFromPath(path).getSize().height > 0) {
        iconPath = path
        break
      }
    }
    
    // 如果找不到指定状态的图标，尝试默认图标
    if (!iconPath) {
      const defaultPaths = [
        join(process.cwd(), 'assets', 'icon.png'),
        join(__dirname, '../../assets', 'icon.png'),
        join(__dirname, '../assets', 'icon.png'),
      ]
      for (const path of defaultPaths) {
        if (nativeImage.createFromPath(path).getSize().height > 0) {
          iconPath = path
          break
        }
      }
    }
    
    // 如果还是找不到，返回空图标
    if (iconPath) {
      return nativeImage.createFromPath(iconPath)
    }
    
    // 创建一个简单的默认图标
    const emptyIcon = nativeImage.createEmpty()
    return emptyIcon
  }
}