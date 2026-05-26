<script setup lang="ts">
import { ref } from 'vue'
defineProps<{ duration: number }>()
</script>

<template>
  <div class="flex flex-col items-center gap-6">
    <div class="text-7xl">👐</div>
    <p class="text-lg text-center">双手掌心搓热<br/>轻轻覆盖双眼<br/>感受掌心温度</p>
  </div>
</template>
