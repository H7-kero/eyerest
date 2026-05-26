<script setup lang="ts">
import { ref, onMounted } from 'vue'

const reminderType = ref<'normal' | 'pre-notify'>('normal')
const countdown = ref(10)
let countdownTimer: number | null = null

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  if (params.get('type') === 'pre-notify') {
    reminderType.value = 'pre-notify'
    startCountdown()
  }
})

function startCountdown() {
  countdownTimer = window.setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      if (countdownTimer) clearInterval(countdownTimer)
      window.eyerest.startRest()
    }
  }, 1000)
}

const handleStartRest = () => {
  if (countdownTimer) clearInterval(countdownTimer)
  window.eyerest.startRest()
}

const handleSkip = () => {
  if (countdownTimer) clearInterval(countdownTimer)
  window.eyerest.skipRest()
}
</script>

<template>
  <div class="w-full h-full flex items-center justify-center">
    <div v-if="reminderType === 'pre-notify'" class="bg-white rounded-popup shadow-popup p-8 w-[380px] text-center">
      <div class="text-5xl mb-4">⏰</div>
      <h2 class="text-xl font-semibold text-gray-800 mb-2">即将进入休息</h2>
      <p class="text-sm text-gray-500 mb-4">休息时间将在 <span class="text-primary-500 font-bold text-lg">{{ countdown }}</span> 秒后开始</p>
      
      <div class="flex flex-col gap-3">
        <button class="w-full py-3 bg-primary-500 text-white rounded-btn font-medium hover:bg-primary-600 transition-all" @click="handleStartRest">
          立即开始休息
        </button>
        <button class="w-full py-2 text-gray-400 hover:text-gray-500 transition-all text-xs" @click="handleSkip">
          跳过本次休息
        </button>
      </div>
    </div>
    
    <div v-else class="bg-white rounded-popup shadow-popup p-8 w-[380px] text-center">
      <div class="text-5xl mb-4">👀</div>
      <h2 class="text-xl font-semibold text-gray-800 mb-2">该休息眼睛了</h2>
      <p class="text-sm text-gray-500 mb-6">让眼睛放松一下，看看远处吧</p>

      <div class="flex flex-col gap-3">
        <button class="w-full py-3 bg-primary-500 text-white rounded-btn font-medium hover:bg-primary-600 transition-all" @click="handleStartRest">
          开始休息
        </button>
        <button class="w-full py-2.5 bg-gray-100 text-gray-600 rounded-btn hover:bg-gray-200 transition-all text-sm">
          稍后提醒（5分钟）
        </button>
        <button class="w-full py-2 text-gray-400 hover:text-gray-500 transition-all text-xs">
          跳过本次
        </button>
      </div>
    </div>
  </div>
</template>