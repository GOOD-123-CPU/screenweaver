<script setup lang="ts">
/** 全局主题 CSS 变量注入 */
import { computed } from 'vue'
import { themeStore } from './store'

const vars = computed(() => ({
  '--sw-text': themeStore.current.text,
  '--sw-axis': themeStore.current.axisLabel,
  '--sw-accent': themeStore.current.accent,
  '--sw-title': themeStore.current.titleColor,
  '--sw-numeral': themeStore.current.numeral,
  '--sw-panel': themeStore.current.panelBg,
  '--sw-panel-border': themeStore.current.panelBorder,
}))
</script>

<template>
  <div class="sw-theme" :style="vars">
    <slot />
  </div>
</template>

<style scoped>
.sw-theme {
  width: 100%;
  height: 100%;
}
</style>
