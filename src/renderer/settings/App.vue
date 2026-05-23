<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TimerSettings from './components/TimerSettings.vue'
import ExerciseSettings from './components/ExerciseSettings.vue'
import StatisticsView from './components/StatisticsView.vue'
import type { AppConfig, DailyStats, WeeklyStats } from '../../../shared/types'

const activeTab = ref<'timer' | 'exercise' | 'stats'>('timer')
const config = ref<AppConfig | null>(null)
const todayStats = ref<DailyStats | null>(null)
const weeklyStats = ref<WeeklyStats | null>(null)

onMounted(async () => {
  config.value = await window.eyerest.getConfig()
  todayStats.value = await window.eyerest.getTodayStats()
  weeklyStats.value = await window.eyerest.getWeeklyStats()
})

async function handleConfigUpdate(partial: Partial<AppConfig>) {
  config.value = await window.eyerest.setConfig(partial)
}

function handleClose() { window.eyerest.closeSettings() }
</script>

<template>
  <div class="h-screen bg-gray-50 flex flex-col rounded-xl overflow-hidden border border-gray-200 shadow-popup">
    <div class="drag-region flex items-center justify-between px-5 py-3 bg-white border-b">
      <h1 class="text-base font-semibold text-gray-800 no-drag">简休 EyeRest · 设置</h1>
      <button class="no-drag w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-all" @click="handleClose">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5">
          <line x1="1" y1="1" x2="13" y2="13" /><line x1="13" y1="1" x2="1" y2="13" />
        </svg>
      </button>
    </div>

    <div class="flex border-b bg-white">
      <button v-for="tab in (['timer', 'exercise', 'stats'] as const)" :key="tab"
        class="flex-1 py-3 text-sm font-medium transition-all border-b-2"
        :class="activeTab === tab ? 'text-primary-600 border-primary-500' : 'text-gray-400 border-transparent hover:text-gray-600'"
        @click="activeTab = tab">
        {{ tab === 'timer' ? '计时设置' : tab === 'exercise' ? '护眼操' : '统计数据' }}
      </button>
    </div>

    <div class="flex-1 overflow-auto p-5 no-drag">
      <TimerSettings v-if="activeTab === 'timer' && config" :config="config" @update="handleConfigUpdate" />
      <ExerciseSettings v-else-if="activeTab === 'exercise' && config" :config="config" @update="handleConfigUpdate" />
      <StatisticsView v-else-if="activeTab === 'stats' && todayStats && weeklyStats" :today-stats="todayStats" :weekly-stats="weeklyStats" />
    </div>
  </div>
</template>