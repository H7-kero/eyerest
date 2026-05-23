import { app } from 'electron'

let autoLaunchEnabled: boolean = false

export function setAutoLaunch(enabled: boolean): void {
  autoLaunchEnabled = enabled
  app.setLoginItemSettings({
    openAtLogin: enabled,
    path: process.execPath
  })
}

export function isAutoLaunchEnabled(): boolean {
  return autoLaunchEnabled
}