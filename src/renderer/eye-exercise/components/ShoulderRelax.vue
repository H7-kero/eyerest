<script setup lang="ts">
import { ref, onMounted } from 'vue'
defineProps<{ duration: number }>()
const phase = ref<'up' | 'down' | 'rotate'>('up')

onMounted(() => {
  const phases = ['up', 'down', 'rotate'] as const
  let i = 0
  setInterval(() => {
    i = (i + 1) % phases.length
    phase.value = phases[i]
  }, 6000)
})
</script>

<template>
  <div class="flex flex-col items-center gap-6">
    <div class="text-7xl" :class="{ 'scale-110': phase === 'up' }">💆</div>
    <p class="text-lg text-center">
      <template v-if="phase === 'up'">耸肩 保持5秒</template>
      <template v-else-if="phase === 'down'">慢慢放下</template>
      <template v-else>双肩前后转动</template>
    </p>
  </div>
</template>
