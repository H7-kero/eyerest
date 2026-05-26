import { EventEmitter } from 'events'
import type { TimerState, TimerTick } from '../shared/types'
import { IDLE_TIMEOUT, PRE_NOTIFY_SECONDS } from '../shared/constants'

export class TimerEngine extends EventEmitter<{
  tick: [tick: TimerTick]
  'state-change': [state: TimerState]
  'time-up': []
  'rest-end': []
  idle: []
  resume: []
  'pre-notify': []
}> {
  private state: TimerState = 'idle'
  private workDuration: number
  private restDuration: number
  private remainingSeconds: number
  private totalSeconds: number
  private targetTimestamp: number
  private timerHandle: ReturnType<typeof setInterval> | null = null
  private lastTickTimestamp: number = 0
  private workStreakStart: number = 0
  private currentStreak: number = 0

  constructor(workDuration: number, restDuration: number) {
    super()
    this.workDuration = workDuration
    this.restDuration = restDuration
    this.remainingSeconds = workDuration
    this.totalSeconds = workDuration
    this.targetTimestamp = 0
  }

  getState(): TimerState { return this.state }
  getRemainingSeconds(): number { return this.remainingSeconds }
  getCurrentStreak(): number { return this.currentStreak }

  start(): void {
    if (this.state === 'running') return
    this.state = 'running'
    this.remainingSeconds = this.workDuration
    this.totalSeconds = this.workDuration
    this.targetTimestamp = Date.now() + this.remainingSeconds * 1000
    this.lastTickTimestamp = Date.now()
    this.startTimer()
    this.emit('state-change', this.state)
    this.emitTick()
  }

  pause(): void {
    if (this.state !== 'running') return
    this.state = 'paused'
    this.stopTimer()
    this.emit('state-change', this.state)
  }

  resume(): void {
    if (this.state !== 'paused') return
    this.state = 'running'
    this.targetTimestamp = Date.now() + this.remainingSeconds * 1000
    this.lastTickTimestamp = Date.now()
    this.startTimer()
    this.emit('state-change', this.state)
    this.emit('resume')
    this.emitTick()
  }

  pauseRest(): void {
    if (this.state !== 'running') return
    this.state = 'pausedRest'
    this.stopTimer()
    this.emit('state-change', this.state)
  }

  resumeFromPauseRest(): void {
    if (this.state !== 'pausedRest') return
    this.state = 'running'
    this.targetTimestamp = Date.now() + this.remainingSeconds * 1000
    this.lastTickTimestamp = Date.now()
    this.startTimer()
    this.emit('state-change', this.state)
    this.emit('resume')
    this.emitTick()
  }

  resetTimer(): void {
    this.stopTimer()
    this.state = 'running'
    this.remainingSeconds = this.workDuration
    this.totalSeconds = this.workDuration
    this.targetTimestamp = Date.now() + this.remainingSeconds * 1000
    this.lastTickTimestamp = Date.now()
    this.workStreakStart = Date.now()
    this.currentStreak = 0
    this.startTimer()
    this.emit('state-change', this.state)
    this.emitTick()
  }

  startRest(): void {
    this.state = 'resting'
    this.remainingSeconds = this.restDuration
    this.totalSeconds = this.restDuration
    this.targetTimestamp = Date.now() + this.remainingSeconds * 1000
    this.lastTickTimestamp = Date.now()
    this.startTimer()
    this.emit('state-change', this.state)
    this.emitTick()
  }

  endRest(): void {
    this.stopTimer()
    this.currentStreak = 0
    this.workStreakStart = 0
    this.start()
  }

  updateWorkDuration(duration: number): void {
    this.workDuration = duration
    if (this.state === 'running') {
      this.targetTimestamp = Date.now() + this.remainingSeconds * 1000
    }
  }

  updateRestDuration(duration: number): void {
    this.restDuration = duration
    if (this.state === 'resting') {
      this.targetTimestamp = Date.now() + this.remainingSeconds * 1000
    }
  }

  destroy(): void { this.stopTimer(); this.removeAllListeners() }

  private startTimer(): void {
    if (this.timerHandle) return
    this.timerHandle = setInterval(() => this.onIntervalTick(), 1000)
  }

  private stopTimer(): void {
    if (this.timerHandle) { clearInterval(this.timerHandle); this.timerHandle = null }
  }

  private onIntervalTick(): void {
    const now = Date.now()
    const elapsed = now - this.lastTickTimestamp
    if (elapsed > 3000) { this.recalibrate(now) }
    this.lastTickTimestamp = now
    if (this.state !== 'running' && this.state !== 'resting') return
    this.remainingSeconds = Math.max(0, Math.round((this.targetTimestamp - now) / 1000))
    
    // 提前通知逻辑
    if (this.state === 'running' && this.remainingSeconds === PRE_NOTIFY_SECONDS) {
      this.emit('pre-notify')
    }
    
    this.emitTick()
    if (this.remainingSeconds <= 0) {
      this.stopTimer()
      if (this.state === 'running') {
        this.currentStreak = Math.round((now - this.workStreakStart) / 1000)
        this.emit('time-up')
      } else { this.emit('rest-end') }
    }
  }

  private recalibrate(now: number): void {
    const gapSeconds = Math.round((now - this.lastTickTimestamp) / 1000)
    this.remainingSeconds = Math.max(0, this.remainingSeconds - gapSeconds)
    this.targetTimestamp = now + this.remainingSeconds * 1000
  }

  private emitTick(): void {
    this.emit('tick', { state: this.state, remainingSeconds: this.remainingSeconds, totalSeconds: this.totalSeconds })
  }
}