<script setup lang="ts">
import { ref, onMounted } from 'vue'
defineProps<{ duration: number }>()
const phase = ref<'temple' | 'eyebrow' | 'cheek'>('temple')

onMounted(() => {
  const phases = ['temple', 'eyebrow', 'cheek'] as const
  let i = 0
  setInterval(() => {
    i = (i + 1) % phases.length
    phase.value = phases[i]
  }, 6000)
})
</script>

<template>
  <div class="flex flex-col items-center gap-6">
    <div class="text-7xl">💆‍♂️</div>
    <p class="text-lg text-center">
      <template v-if="phase === 'temple'">轻柔按揉太阳穴</template>
      <template v-else-if="phase === 'eyebrow'">按揉眉骨周围</template>
      <template v-else>按揉眼眶下方</template>
    </p>
  </div>
</template>
