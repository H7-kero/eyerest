<script setup lang="ts">
const handleStartRest = () => window.eyerest.startRest()
const handleSnooze = () => window.eyerest.snoozeRest()
const handleSkip = () => window.eyerest.skipRest()
</script>

<template>
  <div class="w-full h-full flex items-center justify-center">
    <div class="bg-white rounded-popup shadow-popup p-8 w-[380px] text-center">
      <div class="text-5xl mb-4">👀</div>
      <h2 class="text-xl font-semibold text-gray-800 mb-2">该休息眼睛了</h2>
      <p class="text-sm text-gray-500 mb-6">让眼睛放松一下，看看远处吧</p>

      <div class="flex flex-col gap-3">
        <button class="w-full py-3 bg-primary-500 text-white rounded-btn font-medium hover:bg-primary-600 transition-all" @click="handleStartRest">
          开始休息
        </button>
        <button class="w-full py-2.5 bg-gray-100 text-gray-600 rounded-btn hover:bg-gray-200 transition-all text-sm" @click="handleSnooze">
          稍后提醒（5分钟）
        </button>
        <button class="w-full py-2 text-gray-400 hover:text-gray-500 transition-all text-xs" @click="handleSkip">
          跳过本次
        </button>
      </div>
    </div>
  </div>
</template>