import { BrowserWindow, Notification, nativeImage, app } from 'electron'
import { join } from 'path'
import type { AppConfig } from '../shared/types'

export class ReminderDispatcher {
  private reminderWindow: BrowserWindow | null = null
  private preNotifyWindow: BrowserWindow | null = null
  private exerciseWindow: BrowserWindow | null = null
  private skipCount: number = 0

  getReminderWindow(): BrowserWindow | null { return this.reminderWindow }
  getPreNotifyWindow(): BrowserWindow | null { return this.preNotifyWindow }
  getExerciseWindow(): BrowserWindow | null { return this.exerciseWindow }

  dispatchTimeUp(config: AppConfig): void {
    const types = config.reminder.enabledTypes
    if (types.includes('popup')) this.showPopupReminder(config)
    if (types.includes('fullscreen')) this.showFullscreenReminder(config)
    if (types.includes('notification')) this.showNotification()
    if (types.includes('sound')) this.playSound(config)
  }

  showPreNotifyReminder(config: AppConfig): void {
    if (this.preNotifyWindow && !this.preNotifyWindow.isDestroyed()) {
      this.preNotifyWindow.show()
      this.preNotifyWindow.focus()
      return
    }
    this.preNotifyWindow = new BrowserWindow({
      width: 400, height: 320, resizable: false, frame: false, transparent: true,
      alwaysOnTop: true, skipTaskbar: true, show: false,
      webPreferences: { preload: join(__dirname, '../preload/index.js'), sandbox: false, contextIsolation: true, nodeIntegration: false }
    })
    this.preNotifyWindow.setVisibleOnAllWorkspaces(true)
    if (process.env.ELECTRON_RENDERER_URL) {
      this.preNotifyWindow.loadURL(`${process.env.ELECTRON_RENDERER_URL}/reminder/index.html?type=pre-notify`)
    } else {
      this.preNotifyWindow.loadFile(join(__dirname, '../renderer/reminder/index.html'), { query: { type: 'pre-notify' } })
    }
    this.preNotifyWindow.on('ready-to-show', () => { this.preNotifyWindow?.show(); this.preNotifyWindow?.center() })
    this.preNotifyWindow.on('closed', () => { this.preNotifyWindow = null })
  }

  showPopupReminder(config: AppConfig): void {
    if (this.reminderWindow && !this.reminderWindow.isDestroyed()) { this.reminderWindow.show(); this.reminderWindow.focus(); return }
    this.reminderWindow = new BrowserWindow({
      width: 400, height: 320, resizable: false, frame: false, transparent: true,
      alwaysOnTop: true, skipTaskbar: true, show: false,
      webPreferences: { preload: join(__dirname, '../preload/index.js'), sandbox: false, contextIsolation: true, nodeIntegration: false }
    })
    this.reminderWindow.setVisibleOnAllWorkspaces(true)
    if (process.env.ELECTRON_RENDERER_URL) {
      this.reminderWindow.loadURL(`${process.env.ELECTRON_RENDERER_URL}/reminder/index.html`)
    } else {
      this.reminderWindow.loadFile(join(__dirname, '../renderer/reminder/index.html'))
    }
    this.reminderWindow.on('ready-to-show', () => { this.reminderWindow?.show(); this.reminderWindow?.center() })
    this.reminderWindow.on('closed', () => { this.reminderWindow = null })
  }

  showFullscreenReminder(config: AppConfig): void {
    if (this.exerciseWindow && !this.exerciseWindow.isDestroyed()) { this.exerciseWindow.show(); this.exerciseWindow.focus(); return }
    this.exerciseWindow = new BrowserWindow({
      fullscreen: true, frame: false, resizable: false, alwaysOnTop: true, skipTaskbar: true, show: false,
      webPreferences: { preload: join(__dirname, '../preload/index.js'), sandbox: false, contextIsolation: true, nodeIntegration: false }
    })
    this.exerciseWindow.setVisibleOnAllWorkspaces(true)
    if (process.env.ELECTRON_RENDERER_URL) {
      this.exerciseWindow.loadURL(`${process.env.ELECTRON_RENDERER_URL}/eye-exercise/index.html`)
    } else {
      this.exerciseWindow.loadFile(join(__dirname, '../renderer/eye-exercise/index.html'))
    }
    this.exerciseWindow.on('ready-to-show', () => { this.exerciseWindow?.show() })
    this.exerciseWindow.on('closed', () => { this.exerciseWindow = null })
  }

  showNotification(): void {
    if (!Notification.isSupported()) return
    const notification = new Notification({ title: '简休 EyeRest', body: '该休息眼睛了 👀 看看远处的风景吧', silent: true })
    notification.on('click', () => { this.showPopupReminder({} as AppConfig) })
    notification.show()
  }

  private getSoundFilePath(soundType: string): string {
    const assetsPath = app.isPackaged 
      ? join(process.resourcesPath, 'assets/sounds')
      : join(__dirname, '../../assets/sounds')
    const soundFiles = {
      waterdrop: 'waterdrop.wav',
      windbell: 'windbell.wav',
      piano: 'piano.wav'
    }
    return join(assetsPath, soundFiles[soundType as keyof typeof soundFiles] || 'waterdrop.wav')
  }

  playSound(config: AppConfig): void {
    this.playPreviewSound(config.reminder.soundType, config.reminder.soundVolume)
  }

  playPreviewSound(soundType: string, volume: number = 0.7): void {
    try {
      const soundFile = this.getSoundFilePath(soundType)
      const fs = require('fs')
      if (!fs.existsSync(soundFile)) {
        console.warn(`Audio file not found: ${soundFile}`)
        return
      }
      
      const { exec } = require('child_process')
      const os = require('os')
      
      if (os.platform() === 'darwin') {
        exec(`afplay "${soundFile}" -v ${volume}`, (error: any) => {
          if (error) {
            console.warn('Error playing sound with afplay, trying simpler method')
            this.playSimpleSound(soundType, volume)
          }
        })
      } else {
        this.playSimpleSound(soundType, volume)
      }
    } catch (error) {
      console.error('Error playing preview sound:', error)
      this.playSimpleSound(soundType, volume)
    }
  }

  private playSimpleSound(soundType: string, volume: number): void {
    try {
      const { exec } = require('child_process')
      const os = require('os')
      
      const soundFrequencies: Record<string, number[][]> = {
        waterdrop: [[800, 0.15], [1000, 0.2]],
        windbell: [[600, 0.3], [800, 0.3], [1000, 0.3], [1200, 0.5]],
        piano: [[523, 0.4], [659, 0.4], [784, 0.4]]
      }
      
      const tones = soundFrequencies[soundType] || soundFrequencies.waterdrop
      
      tones.forEach(([freq, duration], i) => {
        setTimeout(() => {
          if (os.platform() === 'darwin') {
            exec(`osascript -e 'beep'`)
          }
        }, i * 150)
      })
    } catch (error) {
      console.error('Error playing simple sound:', error)
    }
  }

  previewPreNotifyReminder(config: AppConfig): void {
    this.showPreNotifyReminder(config)
  }

  showExerciseWindow(config: AppConfig): void {
    if (this.exerciseWindow && !this.exerciseWindow.isDestroyed()) { this.exerciseWindow.show(); this.exerciseWindow.focus(); return }
    this.exerciseWindow = new BrowserWindow({
      fullscreen: true, frame: false, resizable: false, alwaysOnTop: true, skipTaskbar: true, show: false,
      webPreferences: { preload: join(__dirname, '../preload/index.js'), sandbox: false, contextIsolation: true, nodeIntegration: false }
    })
    this.exerciseWindow.setVisibleOnAllWorkspaces(true)
    if (process.env.ELECTRON_RENDERER_URL) {
      this.exerciseWindow.loadURL(`${process.env.ELECTRON_RENDERER_URL}/eye-exercise/index.html`)
    } else {
      this.exerciseWindow.loadFile(join(__dirname, '../renderer/eye-exercise/index.html'))
    }
    this.exerciseWindow.on('ready-to-show', () => { this.exerciseWindow?.show() })
    this.exerciseWindow.on('closed', () => { this.exerciseWindow = null })
  }

  handleSnooze(): void { this.skipCount++; this.closeReminderWindow() }
  handleSkip(): void { this.skipCount++; this.closeReminderWindow(); this.closePreNotifyWindow() }
  handleStartRest(): void { this.skipCount = 0; this.closeReminderWindow(); this.closePreNotifyWindow() }
  getSkipCount(): number { return this.skipCount }
  resetSkipCount(): void { this.skipCount = 0 }
  closeReminderWindow(): void { if (this.reminderWindow && !this.reminderWindow.isDestroyed()) { this.reminderWindow.close() } }
  closePreNotifyWindow(): void { if (this.preNotifyWindow && !this.preNotifyWindow.isDestroyed()) { this.preNotifyWindow.close() } }
  closeExerciseWindow(): void { if (this.exerciseWindow && !this.exerciseWindow.isDestroyed()) { this.exerciseWindow.close() } }
  destroyAll(): void { this.closeReminderWindow(); this.closePreNotifyWindow(); this.closeExerciseWindow() }
}
