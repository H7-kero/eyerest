import Store from 'electron-store'
import type { AppConfig, RestRecord, DailyStats } from '../shared/types'
import { DEFAULT_CONFIG, DATA_RETENTION_DAYS } from '../shared/constants'

interface StoreSchema { config: AppConfig; records: RestRecord[] }

export class AppStore {
  private store: Store<StoreSchema>

  constructor() {
    this.store = new Store<StoreSchema>({ defaults: { config: DEFAULT_CONFIG, records: [] } })
    this.cleanOldRecords()
  }

  getConfig(): AppConfig { return this.store.get('config', DEFAULT_CONFIG) as AppConfig }

  setConfig(partial: Partial<AppConfig>): AppConfig {
    const current = this.getConfig()
    const merged: AppConfig = mergeConfig(current, partial)
    this.store.set('config', merged)
    return merged
  }

  resetConfig(): AppConfig { this.store.set('config', DEFAULT_CONFIG); return DEFAULT_CONFIG }
  getRecords(): RestRecord[] { return this.store.get('records', []) }

  addRestRecord(record: RestRecord): void {
    const records = this.getRecords()
    const existingIndex = records.findIndex((r) => r.date === record.date)
    if (existingIndex >= 0) { records[existingIndex] = record } else { records.push(record) }
    this.store.set('records', records)
  }

  getTodayStats(): DailyStats {
    const today = formatDate(new Date())
    const records = this.getRecords()
    const todayRecord = records.find((r) => r.date === today)
    if (!todayRecord) {
      return { workMinutes: 0, restCount: 0, restMinutes: 0, completionRate: 0, skippedCount: 0, longestStreakMinutes: 0 }
    }
    const totalRestOpportunities = todayRecord.restCount + todayRecord.skippedCount
    const completionRate = totalRestOpportunities > 0 ? Math.round((todayRecord.restCount / totalRestOpportunities) * 100) : 0
    return {
      workMinutes: Math.round(todayRecord.workSeconds / 60),
      restCount: todayRecord.restCount,
      restMinutes: Math.round(todayRecord.restSeconds / 60),
      completionRate,
      skippedCount: todayRecord.skippedCount,
      longestStreakMinutes: Math.round(todayRecord.longestWorkStreak / 60)
    }
  }

  getWeeklyStats(): { days: { date: string; restCount: number; restMinutes: number; skippedCount: number }[] } {
    const records = this.getRecords()
    const days: { date: string; restCount: number; restMinutes: number; skippedCount: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const dateStr = formatDate(d)
      const record = records.find((r) => r.date === dateStr)
      days.push({ date: dateStr, restCount: record?.restCount ?? 0, restMinutes: record ? Math.round(record.restSeconds / 60) : 0, skippedCount: record?.skippedCount ?? 0 })
    }
    return { days }
  }

  getMonthlyStats(): { date: string; restCount: number; restMinutes: number }[] {
    const records = this.getRecords()
    const result: { date: string; restCount: number; restMinutes: number }[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const dateStr = formatDate(d)
      const record = records.find((r) => r.date === dateStr)
      result.push({ date: dateStr, restCount: record?.restCount ?? 0, restMinutes: record ? Math.round(record.restSeconds / 60) : 0 })
    }
    return result
  }

  onDidChange(callback: (config: AppConfig) => void): () => void {
    return this.store.onDidChange('config', (newValue) => { callback((newValue ?? DEFAULT_CONFIG) as AppConfig) })
  }

  private cleanOldRecords(): void {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - DATA_RETENTION_DAYS)
    const cutoffStr = formatDate(cutoff)
    const records = this.getRecords()
    const filtered = records.filter((r) => r.date >= cutoffStr)
    if (filtered.length !== records.length) { this.store.set('records', filtered) }
  }
}

function formatDate(date: Date): string {
  const y = date.getFullYear(); const m = String(date.getMonth() + 1).padStart(2, '0'); const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function mergeConfig(current: AppConfig, partial: Partial<AppConfig>): AppConfig {
  return {
    timer: { ...current.timer, ...partial.timer },
    reminder: { ...current.reminder, ...partial.reminder },
    exercises: partial.exercises ?? current.exercises,
    autoLaunch: partial.autoLaunch ?? current.autoLaunch
  }
}