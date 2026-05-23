<script setup lang="ts">
import { ref, onMounted } from 'vue'

defineProps<{ duration: number }>()
const breathPhase = ref<'inhale' | 'hold' | 'exhale'>('inhale')
const cycleCount = ref(0)

onMounted(() => {
  const phases: ('inhale' | 'hold' | 'exhale')[] = ['inhale', 'hold', 'exhale']
  let i = 0
  setInterval(() => {
    i++; if (i >= phases.length) { i = 0; cycleCount.value++ }
    breathPhase.value = phases[i]
  }, 4000)
})
</script>

<template>
  <div class="flex flex-col items-center gap-6">
    <div class="w-32 h-32 rounded-full bg-primary-500/20 flex items-center justify-center transition-all duration-[4000ms]"
      :class="{ 'scale-100': breathPhase === 'inhale', 'scale-110': breathPhase === 'hold', 'scale-75': breathPhase === 'exhale' }">
      <span class="text-4xl">🫁</span>
    </div>
    <p class="text-lg">
      <template v-if="breathPhase === 'inhale'">吸气 4 秒</template>
      <template v-else-if="breathPhase === 'hold'">屏息 4 秒</template>
      <template v-else>呼气 4 秒</template>
    </p>
    <div class="flex gap-2">
      <span v-for="i in 5" :key="i" class="w-2 h-2 rounded-full" :class="cycleCount >= i ? 'bg-primary-500' : 'bg-gray-600'" />
    </div>
  </div>
</template>