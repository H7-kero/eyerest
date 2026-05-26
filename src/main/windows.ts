import { BrowserWindow } from 'electron'
import { join } from 'path'

let settingsWindow: BrowserWindow | null = null
let statisticsWindow: BrowserWindow | null = null

export function createSettingsWindow(): BrowserWindow {
  if (settingsWindow && !settingsWindow.isDestroyed()) { settingsWindow.show(); settingsWindow.focus(); return settingsWindow }
  settingsWindow = new BrowserWindow({
    width: 720, height: 560, resizable: false, frame: false, transparent: true, show: false,
    webPreferences: { preload: join(__dirname, '../preload/index.js'), sandbox: false, contextIsolation: true, nodeIntegration: false }
  })
  if (process.env.ELECTRON_RENDERER_URL) { settingsWindow.loadURL(`${process.env.ELECTRON_RENDERER_URL}/settings/index.html`) }
  else { settingsWindow.loadFile(join(__dirname, '../renderer/settings/index.html')) }
  settingsWindow.on('ready-to-show', () => { settingsWindow?.show(); settingsWindow?.center() })
  settingsWindow.on('closed', () => { settingsWindow = null })
  return settingsWindow
}

export function createStatisticsWindow(): BrowserWindow {
  if (statisticsWindow && !statisticsWindow.isDestroyed()) { statisticsWindow.show(); statisticsWindow.focus(); return statisticsWindow }
  statisticsWindow = new BrowserWindow({
    width: 600, height: 520, resizable: false, frame: false, transparent: true, show: false,
    webPreferences: { preload: join(__dirname, '../preload/index.js'), sandbox: false, contextIsolation: true, nodeIntegration: false }
  })
  if (process.env.ELECTRON_RENDERER_URL) { statisticsWindow.loadURL(`${process.env.ELECTRON_RENDERER_URL}/statistics/index.html`) }
  else { statisticsWindow.loadFile(join(__dirname, '../renderer/statistics/index.html')) }
  statisticsWindow.on('ready-to-show', () => { statisticsWindow?.show(); statisticsWindow?.center() })
  statisticsWindow.on('closed', () => { statisticsWindow = null })
  return statisticsWindow
}

export function closeSettingsWindow(): void { if (settingsWindow && !settingsWindow.isDestroyed()) { settingsWindow.close() } }
export function closeStatisticsWindow(): void { if (statisticsWindow && !settingsWindow.isDestroyed()) { statisticsWindow.close() } }
export function minimizeSettingsWindow(): void { if (settingsWindow && !settingsWindow.isDestroyed()) { settingsWindow.minimize() } }
export function hideSettingsWindow(): void { if (settingsWindow && !settingsWindow.isDestroyed()) { settingsWindow.hide() } }