<script setup lang="ts">
import { ref, onMounted } from 'vue'

defineProps<{ duration: number }>()
const phase = ref<'far' | 'near'>('far')
const cycle = ref(1)

onMounted(() => {
  const interval = setInterval(() => {
    if (phase.value === 'far') { phase.value = 'near' }
    else { phase.value = 'far'; cycle.value++ }
    if (cycle.value > 3) clearInterval(interval)
  }, 5000)
})
</script>

<template>
  <div class="flex flex-col items-center gap-8">
    <div class="text-8xl transition-all duration-1000" :class="phase === 'far' ? 'scale-50 opacity-40' : 'scale-100 opacity-100'">🎯</div>
    <p class="text-lg">{{ phase === 'far' ? '看远处 5 秒' : '看近处 5 秒' }}</p>
    <div class="flex gap-2">
      <span v-for="i in 3" :key="i" class="w-2 h-2 rounded-full" :class="cycle >= i ? 'bg-primary-500' : 'bg-gray-600'" />
    </div>
  </div>
</template>