<script setup lang="ts">
import { ref, watch } from 'vue'
import type { AppConfig, ExerciseItem, EyeExerciseType } from '../../../../shared/types'

const props = defineProps<{ config: AppConfig }>()
const emit = defineEmits<{ update: [partial: Partial<AppConfig>] }>()

const localExercises = ref<ExerciseItem[]>(JSON.parse(JSON.stringify(props.config.exercises)))

watch(localExercises, (val) => { emit('update', { exercises: val }) }, { deep: true })
watch(() => props.config.exercises, (val) => { localExercises.value = JSON.parse(JSON.stringify(val)) })

function toggleExercise(type: EyeExerciseType) {
  const exercise = localExercises.value.find((e) => e.type === type)
  if (exercise) exercise.enabled = !exercise.enabled
}

function updateDuration(type: EyeExerciseType, duration: number) {
  const exercise = localExercises.value.find((e) => e.type === type)
  if (exercise) exercise.duration = duration
}

async function previewExercise() { await window.eyerest.previewFullscreen() }
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold text-gray-700">护眼操动作</h3>
      <button class="text-xs text-primary-500 hover:text-primary-600 px-3 py-1.5 hover:bg-primary-50 rounded-btn transition-all" @click="previewExercise">预览全部</button>
    </div>

    <div class="bg-white rounded-card divide-y">
      <div v-for="exercise in localExercises" :key="exercise.type" class="p-4 flex items-center gap-4">
        <label class="relative inline-flex items-center cursor-pointer shrink-0">
          <input type="checkbox" :checked="exercise.enabled" class="sr-only peer" @change="toggleExercise(exercise.type)" />
          <div class="w-9 h-5 bg-gray-200 rounded-full peer-checked:bg-primary-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
        </label>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between mb-1">
            <span class="text-sm" :class="exercise.enabled ? 'text-gray-700' : 'text-gray-300'">{{ exercise.label }}</span>
            <span class="text-xs text-primary-600 font-medium">{{ exercise.duration }} 秒</span>
          </div>
          <input type="range" min="10" max="60" step="5" :value="exercise.duration" :disabled="!exercise.enabled"
            class="w-full accent-primary-500" :class="{ 'opacity-30': !exercise.enabled }"
            @input="updateDuration(exercise.type, Number(($event.target as HTMLInputElement).value))" />
        </div>
      </div>
    </div>
  </div>
</template>