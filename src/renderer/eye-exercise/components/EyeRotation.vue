<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

defineProps<{ duration: number }>()
const angle = ref(0)
const direction = ref<'cw' | 'ccw'>('cw')
let frameHandle: number

onMounted(() => {
  const startTime = Date.now()
  const halfDuration = 15

  function animate() {
    const elapsed = (Date.now() - startTime) / 1000
    if (elapsed >= 30) return
    if (elapsed < halfDuration) { direction.value = 'cw'; angle.value = (elapsed / halfDuration) * 360 }
    else { direction.value = 'ccw'; angle.value = 360 - ((elapsed - halfDuration) / halfDuration) * 360 }
    frameHandle = requestAnimationFrame(animate)
  }
  frameHandle = requestAnimationFrame(animate)
})

onUnmounted(() => cancelAnimationFrame(frameHandle))
</script>

<template>
  <div class="relative w-80 h-80">
    <div class="absolute inset-0 rounded-full border-2 border-gray-700" />
    <div class="absolute w-6 h-6 bg-primary-500 rounded-full transition-none"
      :style="{ left: `${50 + 35 * Math.cos((angle - 90) * Math.PI / 180)}%`, top: `${50 + 35 * Math.sin((angle - 90) * Math.PI / 180)}%`, transform: 'translate(-50%, -50%)' }" />
    <p class="absolute bottom-0 left-1/2 -translate-x-1/2 text-sm text-gray-400 whitespace-nowrap">
      跟随圆点{{ direction === 'cw' ? '顺时针' : '逆时针' }}转动
    </p>
  </div>
</template>