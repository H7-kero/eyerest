import { app, BrowserWindow, ipcMain, Notification, powerMonitor } from 'electron'
import { AppStore } from './store'
import { TimerEngine } from './timer'
import { ReminderDispatcher } from './dispatcher'
import { AppTray } from './tray'
import { createSettingsWindow, createStatisticsWindow, closeSettingsWindow, closeStatisticsWindow, minimizeSettingsWindow, hideSettingsWindow } from './windows'
import { setAutoLaunch } from './auto-launch'
import { IPC_CHANNELS } from '../shared/constants'
import type { AppConfig, RestRecord } from '../shared/types'

const gotSingleInstanceLock = app.requestSingleInstanceLock()

if (!gotSingleInstanceLock) {
  app.quit()
} else {
  let store: AppStore
  let timer: TimerEngine
  let dispatcher: ReminderDispatcher
  let tray: AppTray
  let todayRecord: RestRecord

  app.on('second-instance', () => { createSettingsWindow() })

  app.whenReady().then(() => {
    // 开发模式下显示 Dock 图标，方便调试
    if (process.platform === 'darwin' && process.env.NODE_ENV !== 'development') { 
      app.dock.hide() 
    }

    store = new AppStore()
    const config = store.getConfig()

    timer = new TimerEngine(config.timer.workDuration, config.timer.restDuration)
    dispatcher = new ReminderDispatcher()

    tray = new AppTray({
      onPause: () => timer.pause(),
      onResume: () => timer.resume(),
      onPauseRest: () => timer.pauseRest(),
      onResumeFromPauseRest: () => timer.resumeFromPauseRest(),
      onReset: () => timer.resetTimer(),
      onRestNow: () => { timer.pause(); dispatcher.dispatchTimeUp(store.getConfig()) },
      onSettings: () => createSettingsWindow(),
      onStatistics: () => createStatisticsWindow(),
      onQuit: () => { dispatcher.destroyAll(); closeSettingsWindow(); closeStatisticsWindow(); app.quit() }
    })

    tray.init()
    initTodayRecord()
    registerIpcHandlers()
    setupTimerListeners()
    timer.start()

    // 开发模式下自动打开设置窗口
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        createSettingsWindow()
      }, 500)
    }

    powerMonitor.on('unlock-screen', () => { if (timer.getState() === 'paused') timer.resume() })
  })

  app.on('window-all-closed', () => {
    // 在 macOS 上，不要退出应用，让应用在后台运行
  })

  app.on('activate', () => {
    // 在 macOS 上，点击 Dock 图标时，重新打开设置窗口
    createSettingsWindow()
  })

  app.on('before-quit', () => {
    timer?.destroy(); tray?.destroy(); dispatcher?.destroyAll()
    closeSettingsWindow(); closeStatisticsWindow()
  })

  function initTodayRecord(): void {
    const today = formatDate(new Date())
    todayRecord = { date: today, workSeconds: 0, restCount: 0, restSeconds: 0, skippedCount: 0, longestWorkStreak: 0 }
  }

  function registerIpcHandlers(): void {
    ipcMain.handle(IPC_CHANNELS.TIMER_GET_STATE, () => ({
      state: timer.getState(),
      remainingSeconds: timer.getRemainingSeconds(),
      totalSeconds: timer.getState() === 'resting' ? store.getConfig().timer.restDuration : store.getConfig().timer.workDuration
    }))

    ipcMain.handle(IPC_CHANNELS.TIMER_PAUSE, () => timer.pause())
    ipcMain.handle(IPC_CHANNELS.TIMER_RESUME, () => timer.resume())
    ipcMain.handle(IPC_CHANNELS.TIMER_RESET, () => timer.resetTimer())
    ipcMain.handle(IPC_CHANNELS.TIMER_PAUSE_REST, () => timer.pauseRest())
    ipcMain.handle(IPC_CHANNELS.TIMER_RESUME_FROM_PAUSE_REST, () => timer.resumeFromPauseRest())

    ipcMain.handle(IPC_CHANNELS.REST_SNOOZE, () => { dispatcher.handleSnooze(); timer.start() })
    ipcMain.handle(IPC_CHANNELS.REST_SKIP, () => { todayRecord.skippedCount++; dispatcher.handleSkip(); timer.start() })

    ipcMain.handle(IPC_CHANNELS.REST_START, () => {
      todayRecord.restCount++
      todayRecord.longestWorkStreak = Math.max(todayRecord.longestWorkStreak, timer.getCurrentStreak())
      dispatcher.handleStartRest()
      const config = store.getConfig()
      if (config.exercises.filter((e) => e.enabled).length > 0) { dispatcher.showExerciseWindow(config) }
      timer.startRest()
    })

    ipcMain.handle(IPC_CHANNELS.REST_COMPLETE, () => {
      todayRecord.restSeconds += store.getConfig().timer.restDuration
      saveTodayRecord(); dispatcher.closeExerciseWindow(); timer.endRest()
    })

    ipcMain.handle(IPC_CHANNELS.CONFIG_GET, () => store.getConfig())

    ipcMain.handle(IPC_CHANNELS.CONFIG_SET, (_event, partial: Partial<AppConfig>) => {
      const updated = store.setConfig(partial)
      timer.updateWorkDuration(updated.timer.workDuration)
      timer.updateRestDuration(updated.timer.restDuration)
      setAutoLaunch(updated.autoLaunch)
      BrowserWindow.getAllWindows().forEach((w) => w.webContents.send(IPC_CHANNELS.CONFIG_CHANGED, updated))
      tray.refreshMenu()
      return updated
    })

    ipcMain.handle(IPC_CHANNELS.CONFIG_RESET, () => {
      const config = store.resetConfig()
      timer.updateWorkDuration(config.timer.workDuration)
      timer.updateRestDuration(config.timer.restDuration)
      setAutoLaunch(false)
      return config
    })

    ipcMain.handle(IPC_CHANNELS.STATS_GET_TODAY, () => store.getTodayStats())
    ipcMain.handle(IPC_CHANNELS.STATS_GET_DAILY, () => store.getRecords())
    ipcMain.handle(IPC_CHANNELS.STATS_GET_WEEKLY, () => store.getWeeklyStats())
    ipcMain.handle(IPC_CHANNELS.STATS_GET_MONTHLY, () => store.getMonthlyStats())

    ipcMain.handle(IPC_CHANNELS.WINDOW_SETTINGS, () => createSettingsWindow())
    ipcMain.handle(IPC_CHANNELS.WINDOW_SETTINGS_CLOSE, () => closeSettingsWindow())
    ipcMain.handle(IPC_CHANNELS.WINDOW_SETTINGS_MINIMIZE, () => hideSettingsWindow())
    ipcMain.handle(IPC_CHANNELS.WINDOW_STATISTICS, () => createStatisticsWindow())
    ipcMain.handle(IPC_CHANNELS.WINDOW_STATISTICS_CLOSE, () => closeStatisticsWindow())
    ipcMain.handle(IPC_CHANNELS.WINDOW_REMINDER_CLOSE, () => dispatcher.closeReminderWindow())
    ipcMain.handle(IPC_CHANNELS.WINDOW_PRENOTIFY_CLOSE, () => dispatcher.closePreNotifyWindow())
    ipcMain.handle(IPC_CHANNELS.WINDOW_EXERCISE_CLOSE, () => dispatcher.closeExerciseWindow())

    ipcMain.handle(IPC_CHANNELS.REMINDER_PREVIEW_POPUP, () => dispatcher.showPopupReminder(store.getConfig()))
    ipcMain.handle(IPC_CHANNELS.REMINDER_PREVIEW_FULLSCREEN, () => dispatcher.showFullscreenReminder(store.getConfig()))
    ipcMain.handle(IPC_CHANNELS.REMINDER_PREVIEW_NOTIFICATION, () => dispatcher.showNotification())
    ipcMain.handle(IPC_CHANNELS.REMINDER_PREVIEW_SOUND, () => dispatcher.playSound(store.getConfig()))
    ipcMain.handle(IPC_CHANNELS.REMINDER_PREVIEW_SOUND_TYPE, (_event, soundType: string) => {
      dispatcher.playPreviewSound(soundType, store.getConfig().reminder.soundVolume)
    })
    ipcMain.handle(IPC_CHANNELS.REMINDER_PRENOTIFY_POPUP, () => dispatcher.previewPreNotifyReminder(store.getConfig()))
  }

  function setupTimerListeners(): void {
    timer.on('tick', (tick) => {
      tray.updateTooltip(Math.ceil(tick.remainingSeconds / 60))
      tray.updateState(tick.state)
      BrowserWindow.getAllWindows().forEach((w) => w.webContents.send(IPC_CHANNELS.TIMER_TICK, tick))
    })
    timer.on('state-change', (state) => { tray.updateState(state) })
    
    timer.on('pre-notify', () => {
      dispatcher.closePreNotifyWindow()
      dispatcher.showPreNotifyReminder(store.getConfig())
      BrowserWindow.getAllWindows().forEach((w) => w.webContents.send(IPC_CHANNELS.TIMER_PRE_NOTIFY))
    })
    
    timer.on('time-up', () => {
      dispatcher.closePreNotifyWindow()
      const config = store.getConfig()
      if (config.reminder.forceRest) dispatcher.showFullscreenReminder(config)
      else dispatcher.dispatchTimeUp(config)
    })
    timer.on('rest-end', () => {
      dispatcher.closeExerciseWindow()
      todayRecord.restSeconds += store.getConfig().timer.restDuration
      saveTodayRecord(); timer.endRest()
    })
  }

  function saveTodayRecord(): void {
    const today = formatDate(new Date())
    if (todayRecord.date !== today) { store.addRestRecord(todayRecord); initTodayRecord() }
    else { store.addRestRecord({ ...todayRecord }) }
  }

  function formatDate(date: Date): string {
    const y = date.getFullYear(); const m = String(date.getMonth() + 1).padStart(2, '0'); const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
}
