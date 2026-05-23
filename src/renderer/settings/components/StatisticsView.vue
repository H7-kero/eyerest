<script setup lang="ts">
import type { DailyStats, WeeklyStats } from '../../../../shared/types'

defineProps<{ todayStats: DailyStats; weeklyStats: WeeklyStats }>()

function barHeight(restCount: number): string {
  return `${Math.min((restCount / 12) * 100, 100)}%`
}
</script>

<template>
  <div class="space-y-6">
    <section>
      <h3 class="text-sm font-semibold text-gray-700 mb-3">今日数据</h3>
      <div class="grid grid-cols-3 gap-3">
        <div class="bg-primary-50 rounded-card p-3 text-center">
          <div class="text-2xl font-bold text-primary-600">{{ todayStats.restCount }}</div>
          <div class="text-xs text-gray-500 mt-1">休息次数</div>
        </div>
        <div class="bg-primary-50 rounded-card p-3 text-center">
          <div class="text-2xl font-bold text-primary-600">{{ todayStats.workMinutes }}</div>
          <div class="text-xs text-gray-500 mt-1">工作分钟</div>
        </div>
        <div class="bg-primary-50 rounded-card p-3 text-center">
          <div class="text-2xl font-bold text-primary-600">{{ todayStats.completionRate }}%</div>
          <div class="text-xs text-gray-500 mt-1">完成率</div>
        </div>
      </div>
    </section>

    <section>
      <h3 class="text-sm font-semibold text-gray-700 mb-3">本周趋势</h3>
      <div class="bg-white rounded-card p-4">
        <div class="flex items-end gap-2 h-32">
          <div v-for="day in weeklyStats.days" :key="day.date" class="flex-1 flex flex-col items-center gap-1">
            <span class="text-xs text-primary-600 font-medium">{{ day.restCount }}</span>
            <div class="w-full bg-primary-400 rounded-t-sm transition-all" :style="{ height: barHeight(day.restCount) }" />
            <span class="text-xs text-gray-400 mt-1">{{ day.date.slice(5).replace('-', '/') }}</span>
          </div>
        </div>
      </div>
    </section>

    <section>
      <h3 class="text-sm font-semibold text-gray-700 mb-3">详细数据</h3>
      <div class="bg-white rounded-card p-4 space-y-3">
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">休息总时长</span>
          <span class="text-gray-700 font-medium">{{ todayStats.restMinutes }} 分钟</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">跳过次数</span>
          <span class="text-gray-700 font-medium">{{ todayStats.skippedCount }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">最长连续工作</span>
          <span class="text-gray-700 font-medium">{{ todayStats.longestStreakMinutes }} 分钟</span>
        </div>
      </div>
    </section>
  </div>
</template>