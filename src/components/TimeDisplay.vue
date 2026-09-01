<script setup lang="ts">
/**
 * TimeDisplay：标题栏右侧的日期时钟。
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'

const now = ref(new Date())
let timer: ReturnType<typeof setInterval>

onMounted(() => {
  timer = setInterval(() => (now.value = new Date()), 1000)
})
onBeforeUnmount(() => clearInterval(timer))

const week = ['日', '一', '二', '三', '四', '五', '六']
const pad = (n: number) => String(n).padStart(2, '0')
</script>

<template>
  <div class="sw-clock">
    <span class="date">
      {{ now.getFullYear() }}-{{ pad(now.getMonth() + 1) }}-{{ pad(now.getDate()) }}
      星期{{ week[now.getDay()] }}
    </span>
    <span class="time">
      {{ pad(now.getHours()) }}:{{ pad(now.getMinutes()) }}:{{ pad(now.getSeconds()) }}
    </span>
  </div>
</template>

<style scoped>
.sw-clock {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: baseline;
  gap: 10px;
  color: var(--sw-axis);
  font-size: 12px;
}
.time {
  font-size: 18px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--sw-text);
  letter-spacing: 1px;
}
</style>
