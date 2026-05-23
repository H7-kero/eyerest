export const IPC_CHANNELS = {
  TIMER_GET_STATE: 'timer:get-state',
  TIMER_STATE_CHANGED: 'timer:state-changed',
  TIMER_TICK: 'timer:tick',
  TIMER_START: 'timer:start',
  TIMER_PAUSE: 'timer:pause',
  TIMER_RESUME: 'timer:resume',
  TIMER_RESET: 'timer:reset',

  REST_START: 'rest:start',
  REST_COMPLETE: 'rest:complete',
  REST_SKIP: 'rest:skip',
  REST_SNOOZE: 'rest:snooze',

  CONFIG_GET: 'config:get',
  CONFIG_SET: 'config:set',
  CONFIG_RESET: 'config:reset',
  CONFIG_CHANGED: 'config:changed',

  STATS_GET_DAILY: 'stats:get-daily',
  STATS_GET_WEEKLY: 'stats:get-weekly',
  STATS_GET_MONTHLY: 'stats:get-monthly',
  STATS_GET_TODAY: 'stats:get-today',

  WINDOW_SETTINGS: 'window:settings',
  WINDOW_SETTINGS_CLOSE: 'window:settings-close',
  WINDOW_STATISTICS: 'window:statistics',
  WINDOW_STATISTICS_CLOSE: 'window:statistics-close',
  WINDOW_REMINDER_CLOSE: 'window:reminder-close',
  WINDOW_EXERCISE_CLOSE: 'window:exercise-close',

  REMINDER_PREVIEW_POPUP: 'reminder:preview-popup',
  REMINDER_PREVIEW_FULLSCREEN: 'reminder:preview-fullscreen',
  REMINDER_PREVIEW_NOTIFICATION: 'reminder:preview-notification',
  REMINDER_PREVIEW_SOUND: 'reminder:preview-sound',

  EXERCISE_PREVIEW: 'exercise:preview'
} as const

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS]