<script setup lang="ts">
import type { AppConfig, ReminderType } from '../../../../shared/types'

const props = defineProps<{ config: AppConfig }>()
const emit = defineEmits<{ update: [partial: Partial<AppConfig>] }>()

const reminderTypes: { key: ReminderType; label: string; desc: string }[] = [
  { key: 'popup', label: '桌面弹窗', desc: '屏幕中央弹出提醒卡片' },
  { key: 'fullscreen', label: '全屏模式', desc: '全屏护眼操引导' },
  { key: 'notification', label: '系统通知', desc: '轻量通知不打扰工作' },
  { key: 'sound', label: '声音提示', desc: '柔和提示音提醒' }
]

const soundTypes = [
  { key: 'waterdrop', label: '水滴' },
  { key: 'windbell', label: '风铃' },
  { key: 'piano', label: '钢琴' }
]

function updateTimer(key: string, value: number) { emit('update', { timer: { ...props.config.timer, [key]: value } }) }

function toggleReminderType(type: ReminderType) {
  const current = [...props.config.reminder.enabledTypes]
  const idx = current.indexOf(type)
  if (idx >= 0) current.splice(idx, 1)
  else current.push(type)
  emit('update', { reminder: { ...props.config.reminder, enabledTypes: current } })
}

function updateReminder(key: string, value: any) { emit('update', { reminder: { ...props.config.reminder, [key]: value } }) }

function updateAutoLaunch(enabled: boolean) { emit('update', { autoLaunch: enabled }) }

function formatMinutes(seconds: number): string { 
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (minutes > 0 && secs > 0) return `${minutes} 分 ${secs} 秒`
  if (minutes > 0) return `${minutes} 分钟`
  return `${secs} 秒`
}

async function previewPopup() { await window.eyerest.previewPopup() }
async function previewFullscreen() { await window.eyerest.previewFullscreen() }
async function previewNotification() { await window.eyerest.previewNotification() }
async function previewSound() { await window.eyerest.previewSound() }

async function previewSoundType(soundType: string) { 
  await window.eyerest.previewSoundType(soundType) 
}
</script>

<template>
  <div class="space-y-6">
    <section>
      <h3 class="text-sm font-semibold text-gray-700 mb-3">计时设置</h3>
      <div class="bg-white rounded-card p-4 space-y-4">
        <div>
          <div class="flex justify-between text-sm mb-2">
            <span class="text-gray-600">工作时长</span>
            <span class="text-primary-600 font-medium">{{ formatMinutes(config.timer.workDuration) }}</span>
          </div>
          <input type="range" min="300" max="3600" step="300" :value="config.timer.workDuration"
            class="w-full accent-primary-500"
            @input="updateTimer('workDuration', Number(($event.target as HTMLInputElement).value))" />
          <div class="flex justify-between text-xs text-gray-400 mt-1"><span>5分</span><span>60分</span></div>
        </div>
        <div>
          <div class="flex justify-between text-sm mb-2">
            <span class="text-gray-600">休息时长</span>
            <span class="text-primary-600 font-medium">{{ formatMinutes(config.timer.restDuration) }}</span>
          </div>
          <input type="range" min="10" max="900" step="10" :value="config.timer.restDuration"
            class="w-full accent-primary-500"
            @input="updateTimer('restDuration', Number(($event.target as HTMLInputElement).value))" />
          <div class="flex justify-between text-xs text-gray-400 mt-1"><span>10秒</span><span>15分</span></div>
        </div>
      </div>
    </section>

    <section>
      <h3 class="text-sm font-semibold text-gray-700 mb-3">提醒方式</h3>
      <div class="bg-white rounded-card p-4 space-y-3">
        <div v-for="rt in reminderTypes" :key="rt.key" class="flex items-center gap-3">
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" :checked="config.reminder.enabledTypes.includes(rt.key)" class="sr-only peer" @change="toggleReminderType(rt.key)" />
            <div class="w-9 h-5 bg-gray-200 rounded-full peer-checked:bg-primary-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
          </label>
          <div class="flex-1">
            <div class="text-sm text-gray-700">{{ rt.label }}</div>
            <div class="text-xs text-gray-400">{{ rt.desc }}</div>
          </div>
          <button class="text-xs text-primary-500 hover:text-primary-600 px-2 py-1 hover:bg-primary-50 rounded-btn transition-all"
            @click="rt.key === 'popup' ? previewPopup() : rt.key === 'fullscreen' ? previewFullscreen() : rt.key === 'notification' ? previewNotification() : previewSound()">
            预览
          </button>
        </div>
      </div>
    </section>

    <section>
      <h3 class="text-sm font-semibold text-gray-700 mb-3">声音与强制</h3>
      <div class="bg-white rounded-card p-4 space-y-4">
        <div>
          <div class="text-sm text-gray-600 mb-2">提示音</div>
          <div class="flex gap-2">
            <button v-for="st in soundTypes" :key="st.key"
              class="flex-1 py-2 text-sm rounded-btn transition-all relative"
              :class="config.reminder.soundType === st.key ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
              @click="() => { updateReminder('soundType', st.key); previewSoundType(st.key); }">
              {{ st.label }}
            </button>
          </div>
        </div>
        <div>
          <div class="flex justify-between text-sm mb-2">
            <span class="text-gray-600">提示音量</span>
            <span class="text-primary-600 font-medium">{{ Math.round(config.reminder.soundVolume * 100) }}%</span>
          </div>
          <input type="range" min="0" max="1" step="0.1" :value="config.reminder.soundVolume"
            class="w-full accent-primary-500"
            @input="updateReminder('soundVolume', Number(($event.target as HTMLInputElement).value))" />
        </div>
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-700">强制休息</div>
            <div class="text-xs text-gray-400">开启后休息期间无法关闭提醒</div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" :checked="config.reminder.forceRest" class="sr-only peer" @change="updateReminder('forceRest', !config.reminder.forceRest)" />
            <div class="w-9 h-5 bg-gray-200 rounded-full peer-checked:bg-primary-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
          </label>
        </div>
      </div>
    </section>

    <section>
      <h3 class="text-sm font-semibold text-gray-700 mb-3">启动设置</h3>
      <div class="bg-white rounded-card p-4">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-700">开机自动启动</div>
            <div class="text-xs text-gray-400">应用随系统启动自动运行</div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" :checked="config.autoLaunch" class="sr-only peer" 
              @change="updateAutoLaunch(($event.target as HTMLInputElement).checked)" />
            <div class="w-9 h-5 bg-gray-200 rounded-full peer-checked:bg-primary-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
          </label>
        </div>
      </div>
    </section>
  </div>
</template>
