<script setup lang="ts">
import { ref, onMounted } from 'vue'
defineProps<{ duration: number }>()
const phase = ref<'left' | 'right' | 'forward' | 'backward'>('left')

onMounted(() => {
  const phases = ['left', 'right', 'forward', 'backward'] as const
  let i = 0
  setInterval(() => {
    i = (i + 1) % phases.length
    phase.value = phases[i]
  }, 5000)
})
</script>

<template>
  <div class="flex flex-col items-center gap-6">
    <div class="text-7xl transition-transform" 
         :class="{ 
           '-rotate-12': phase === 'left', 
           'rotate-12': phase === 'right', 
           '-translate-y-2': phase === 'backward',
           'translate-y-2': phase === 'forward'
         }">
      🧘
    </div>
    <p class="text-lg text-center">
      <template v-if="phase === 'left'">缓慢向左拉伸</template>
      <template v-else-if="phase === 'right'">缓慢向右拉伸</template>
      <template v-else-if="phase === 'forward'">低头放松颈部</template>
      <template v-else>慢慢后仰</template>
    </p>
  </div>
</template>
