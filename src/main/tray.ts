import { Tray, Menu, nativeImage } from 'electron'
import { join } from 'path'
import type { TimerState } from '../shared/types'

export class AppTray {
  private tray: Tray | null = null
  private state: TimerState = 'running'
  private remainingMinutes: number = 0
  private menuActions: { onPause: () => void; onResume: () => void; onRestNow: () => void; onSettings: () => void; onStatistics: () => void; onQuit: () => void }

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
    const stateLabels: Record<TimerState, string> = { running: '工作中', resting: '休息中', paused: '已暂停', idle: '空闲' }
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
      { label: this.state === 'paused' ? '恢复计时' : '暂停计时', click: () => { this.state === 'paused' ? this.menuActions.onResume() : this.menuActions.onPause() } },
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
    const iconName: Record<TimerState, string> = { running: 'icon-running', resting: 'icon-resting', paused: 'icon-paused', idle: 'icon-idle' }
    try { return nativeImage.createFromPath(join(__dirname, `../assets/${iconName[state]}.png`)) }
    catch { return nativeImage.createFromPath(join(__dirname, '../assets/icon.png')) }
  }
}