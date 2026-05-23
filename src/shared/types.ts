export type TimerState = 'running' | 'paused' | 'resting' | 'idle'

export type ReminderType = 'popup' | 'fullscreen' | 'notification' | 'sound'

export type SoundType = 'waterdrop' | 'windbell' | 'piano'

export type EyeExerciseType = 'focusShift' | 'eyeRotation' | 'blink' | 'breathing'

export interface TimerConfig {
  workDuration: number
  restDuration: number
  shortBreakInterval: number
}

export interface ReminderConfig {
  enabledTypes: ReminderType[]
  forceRest: boolean
  soundType: SoundType
  soundVolume: number
}

export interface ExerciseItem {
  type: EyeExerciseType
  label: string
  duration: number
  enabled: boolean
}

export interface AppConfig {
  timer: TimerConfig
  reminder: ReminderConfig
  exercises: ExerciseItem[]
  autoLaunch: boolean
}

export interface RestRecord {
  date: string
  workSeconds: number
  restCount: number
  restSeconds: number
  skippedCount: number
  longestWorkStreak: number
}

export interface DailyStats {
  workMinutes: number
  restCount: number
  restMinutes: number
  completionRate: number
  skippedCount: number
  longestStreakMinutes: number
}

export interface WeeklyStats {
  days: {
    date: string
    restCount: number
    restMinutes: number
    skippedCount: number
  }[]
}

export interface EyePosition {
  x: number
  y: number
}

export interface TimerTick {
  state: TimerState
  remainingSeconds: number
  totalSeconds: number
}