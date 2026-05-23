<script setup lang="ts">
import { ref, onMounted } from 'vue'

defineProps<{ duration: number }>()
const blinkPhase = ref<'fast' | 'closed'>('fast')
const fastCount = ref(0)

onMounted(() => {
  const fastInterval = setInterval(() => {
    fastCount.value++
    if (fastCount.value >= 10) { clearInterval(fastInterval); blinkPhase.value = 'closed' }
  }, 1000)
})
</script>

<template>
  <div class="flex flex-col items-center gap-6">
    <div class="text-7xl" :class="{ 'animate-pulse': blinkPhase === 'fast' }">{{ blinkPhase === 'fast' ? '😊' : '😌' }}</div>
    <p class="text-lg">{{ blinkPhase === 'fast' ? `快速眨眼 ${10 - fastCount} 次` : '闭眼休息 10 秒' }}</p>
    <div v-if="blinkPhase === 'closed'" class="text-sm text-gray-400">轻轻闭上眼睛，放松眼部肌肉</div>
  </div>
</template>