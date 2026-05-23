import { BrowserWindow, Notification, nativeImage } from 'electron'
import { join } from 'path'
import type { AppConfig } from '../shared/types'

export class ReminderDispatcher {
  private reminderWindow: BrowserWindow | null = null
  private exerciseWindow: BrowserWindow | null = null
  private skipCount: number = 0

  getReminderWindow(): BrowserWindow | null { return this.reminderWindow }
  getExerciseWindow(): BrowserWindow | null { return this.exerciseWindow }

  dispatchTimeUp(config: AppConfig): void {
    const types = config.reminder.enabledTypes
    if (types.includes('popup')) this.showPopupReminder(config)
    if (types.includes('fullscreen')) this.showFullscreenReminder(config)
    if (types.includes('notification')) this.showNotification()
    if (types.includes('sound')) this.playSound(config)
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

  playSound(config: AppConfig): void {
    try {
      const soundFile = join(__dirname, `../assets/sounds/${config.reminder.soundType}.mp3`)
      const { AudioPlayer } = require('./audio-player')
      AudioPlayer.play(soundFile, config.reminder.soundVolume)
    } catch {}
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
  handleSkip(): void { this.skipCount++; this.closeReminderWindow() }
  handleStartRest(): void { this.skipCount = 0; this.closeReminderWindow() }
  getSkipCount(): number { return this.skipCount }
  resetSkipCount(): void { this.skipCount = 0 }
  closeReminderWindow(): void { if (this.reminderWindow && !this.reminderWindow.isDestroyed()) { this.reminderWindow.close() } }
  closeExerciseWindow(): void { if (this.exerciseWindow && !this.exerciseWindow.isDestroyed()) { this.exerciseWindow.close() } }
  destroyAll(): void { this.closeReminderWindow(); this.closeExerciseWindow() }
}