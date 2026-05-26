<script setup lang="ts">
import { ref } from 'vue'
defineProps<{ duration: number }>()
</script>

<template>
  <div class="flex flex-col items-center gap-6">
    <div class="text-7xl">😌</div>
    <p class="text-lg text-center">闭上眼睛<br/>保持放松状态<br/>让眼睛完全休息</p>
  </div>
</template>
