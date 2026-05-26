import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '../shared/constants'
import type { AppConfig, TimerTick, DailyStats, WeeklyStats } from '../shared/types'

const api = {
  getTimerState: (): Promise<{ state: string; remainingSeconds: number; totalSeconds: number }> =>
    ipcRenderer.invoke(IPC_CHANNELS.TIMER_GET_STATE),

  pauseTimer: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.TIMER_PAUSE),

  resumeTimer: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.TIMER_RESUME),

  snoozeRest: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.REST_SNOOZE),

  skipRest: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.REST_SKIP),

  startRest: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.REST_START),

  completeRest: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.REST_COMPLETE),

  getConfig: (): Promise<AppConfig> =>
    ipcRenderer.invoke(IPC_CHANNELS.CONFIG_GET),

  setConfig: (partial: Partial<AppConfig>): Promise<AppConfig> =>
    ipcRenderer.invoke(IPC_CHANNELS.CONFIG_SET, partial),

  resetConfig: (): Promise<AppConfig> =>
    ipcRenderer.invoke(IPC_CHANNELS.CONFIG_RESET),

  getTodayStats: (): Promise<DailyStats> =>
    ipcRenderer.invoke(IPC_CHANNELS.STATS_GET_TODAY),

  getWeeklyStats: (): Promise<WeeklyStats> =>
    ipcRenderer.invoke(IPC_CHANNELS.STATS_GET_WEEKLY),

  getMonthlyStats: (): Promise<{ date: string; restCount: number; restMinutes: number }[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.STATS_GET_MONTHLY),

  openSettings: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.WINDOW_SETTINGS),

  closeSettings: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.WINDOW_SETTINGS_CLOSE),

  minimizeSettings: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.WINDOW_SETTINGS_MINIMIZE),

  openStatistics: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.WINDOW_STATISTICS),

  closeStatistics: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.WINDOW_STATISTICS_CLOSE),

  closeReminder: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.WINDOW_REMINDER_CLOSE),

  closeExercise: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.WINDOW_EXERCISE_CLOSE),

  closePreNotify: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.WINDOW_PRENOTIFY_CLOSE),

  previewPopup: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.REMINDER_PREVIEW_POPUP),

  previewPreNotify: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.REMINDER_PRENOTIFY_POPUP),

  previewFullscreen: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.REMINDER_PREVIEW_FULLSCREEN),

  previewNotification: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.REMINDER_PREVIEW_NOTIFICATION),

  previewSound: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.REMINDER_PREVIEW_SOUND),

  previewSoundType: (soundType: string): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.REMINDER_PREVIEW_SOUND_TYPE, soundType),

  onTimerTick: (callback: (tick: TimerTick) => void): () => void => {
    const handler = (_event: Electron.IpcRendererEvent, tick: TimerTick) => callback(tick)
    ipcRenderer.on(IPC_CHANNELS.TIMER_TICK, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.TIMER_TICK, handler)
  },

  onConfigChanged: (callback: (config: AppConfig) => void): () => void => {
    const handler = (_event: Electron.IpcRendererEvent, config: AppConfig) => callback(config)
    ipcRenderer.on(IPC_CHANNELS.CONFIG_CHANGED, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.CONFIG_CHANGED, handler)
  },

  onPreNotify: (callback: () => void): () => void => {
    const handler = (_event: Electron.IpcRendererEvent) => callback()
    ipcRenderer.on(IPC_CHANNELS.TIMER_PRE_NOTIFY, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.TIMER_PRE_NOTIFY, handler)
  }
}

contextBridge.exposeInMainWorld('eyerest', api)

export type EyerestApi = typeof api
