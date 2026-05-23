<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import FocusShift from './components/FocusShift.vue'
import EyeRotation from './components/EyeRotation.vue'
import Blink from './components/Blink.vue'
import Breathing from './components/Breathing.vue'
import type { ExerciseItem } from '../../../shared/types'

const exercises = ref<ExerciseItem[]>([])
const currentIndex = ref(0)
const isTransitioning = ref(false)
const phase = ref<'preparing' | 'active' | 'transition' | 'done'>('preparing')
const countdown = ref(3)

const componentMap: Record<string, any> = { focusShift: FocusShift, eyeRotation: EyeRotation, blink: Blink, breathing: Breathing }

async function startSequence() {
  const config = await window.eyerest.getConfig()
  exercises.value = config.exercises.filter((e) => e.enabled)
  if (exercises.value.length === 0) { window.eyerest.completeRest(); return }
  phase.value = 'preparing'; countdown.value = 3
  const prepTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) { clearInterval(prepTimer); runExercise(0) }
  }, 1000)
}

function runExercise(index: number) {
  currentIndex.value = index; phase.value = 'active'
  const exercise = exercises.value[index]
  setTimeout(() => {
    if (index + 1 < exercises.value.length) {
      phase.value = 'transition'; isTransitioning.value = true
      setTimeout(() => { isTransitioning.value = false; runExercise(index + 1) }, 3000)
    } else {
      phase.value = 'done'
      setTimeout(() => window.eyerest.completeRest(), 1500)
    }
  }, exercise.duration * 1000)
}

onMounted(() => {
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') window.eyerest.completeRest() })
  startSequence()
})
</script>

<template>
  <div class="w-full h-full bg-gray-900 flex flex-col items-center justify-center text-white select-none">
    <div v-if="phase === 'preparing'" class="text-center">
      <div class="text-6xl font-light mb-4">{{ countdown }}</div>
      <p class="text-lg text-gray-400">准备开始护眼操...</p>
    </div>
    <div v-else-if="phase === 'active' && exercises[currentIndex]" class="flex flex-col items-center">
      <component :is="componentMap[exercises[currentIndex].type]" :duration="exercises[currentIndex].duration" />
      <div class="mt-8 text-center">
        <p class="text-lg font-medium">{{ exercises[currentIndex].label }}</p>
        <p class="text-sm text-gray-500 mt-1">按 ESC 结束</p>
      </div>
    </div>
    <div v-else-if="phase === 'transition'" class="text-center">
      <p class="text-2xl mb-2">下一个动作</p>
      <p v-if="currentIndex + 1 < exercises.length" class="text-lg text-gray-400">{{ exercises[currentIndex + 1]?.label }}</p>
    </div>
    <div v-else-if="phase === 'done'" class="text-center">
      <div class="text-5xl mb-4">🎉</div>
      <p class="text-xl">休息完成！</p>
      <p class="text-gray-400 mt-2">眼睛感觉好多了吧</p>
    </div>
  </div>
</template>