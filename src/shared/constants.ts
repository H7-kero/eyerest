import type { AppConfig, ExerciseItem } from './types'

export const DEFAULT_WORK_DURATION = 25 * 60
export const DEFAULT_REST_DURATION = 5 * 60
export const DEFAULT_SHORT_BREAK_INTERVAL = 5 * 60

export const IDLE_TIMEOUT = 5 * 60 * 1000
export const MAX_SKIP_COUNT = 3
export const DATA_RETENTION_DAYS = 90

export const DEFAULT_CONFIG: AppConfig = {
  timer: {
    workDuration: DEFAULT_WORK_DURATION,
    restDuration: DEFAULT_REST_DURATION,
    shortBreakInterval: DEFAULT_SHORT_BREAK_INTERVAL
  },
  reminder: {
    enabledTypes: ['popup', 'sound'],
    forceRest: false,
    soundType: 'waterdrop',
    soundVolume: 0.7
  },
  exercises: getDefaultExercises(),
  autoLaunch: false
}

export function getDefaultExercises(): ExerciseItem[] {
  return [
    { type: 'focusShift', label: '远近焦距切换', duration: 30, enabled: true },
    { type: 'eyeRotation', label: '眼球转动', duration: 30, enabled: true },
    { type: 'blink', label: '眨眼练习', duration: 20, enabled: true },
    { type: 'breathing', label: '闭眼深呼吸', duration: 20, enabled: true }
  ]
}

export const EXERCISE_TRANSITION = 3

export const APP_NAME = '简休'
export const APP_NAME_EN = 'EyeRest'