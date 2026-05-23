<script setup lang="ts">
import { ref, onMounted } from 'vue'
import StatisticsView from '../settings/components/StatisticsView.vue'
import type { DailyStats, WeeklyStats } from '../../../shared/types'

const todayStats = ref<DailyStats | null>(null)
const weeklyStats = ref<WeeklyStats | null>(null)

onMounted(async () => {
  todayStats.value = await window.eyerest.getTodayStats()
  weeklyStats.value = await window.eyerest.getWeeklyStats()
})

function handleClose() { window.eyerest.closeStatistics() }
</script>

<template>
  <div class="h-screen bg-gray-50 flex flex-col rounded-xl overflow-hidden border border-gray-200 shadow-popup">
    <div class="drag-region flex items-center justify-between px-5 py-3 bg-white border-b">
      <h1 class="text-base font-semibold text-gray-800 no-drag">简休 EyeRest · 统计数据</h1>
      <button class="no-drag w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-all" @click="handleClose">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5">
          <line x1="1" y1="1" x2="13" y2="13" /><line x1="13" y1="1" x2="1" y2="13" />
        </svg>
      </button>
    </div>
    <div class="flex-1 overflow-auto p-5 no-drag">
      <StatisticsView v-if="todayStats && weeklyStats" :today-stats="todayStats" :weekly-stats="weeklyStats" />
    </div>
  </div>
</template>