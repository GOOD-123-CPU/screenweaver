<script setup lang="ts">
/**
 * GaugeCluster：多仪表盘排布容器（数据走 ChartBox 的 gauge 预设，
 * 本组件用于纯 CSS 的迷你环版本，适合小格子）。
 */
import { computed, inject, watch, ref } from 'vue'
import type { ComponentDecl } from '../engine/schema'
import { useSources } from '../engine/useSources'

const props = defineProps<{ decl: ComponentDecl }>()

const sourceKey = computed(() => String(props.decl.props?.source ?? ''))
const allSources = inject<ReturnType<typeof useSources>>('sw-sources')!

interface GaugeData { items: { name: string; value: number }[] }
const items = ref<GaugeData['items']>([])

watch(
  () => allSources[sourceKey.value]?.updatedAt,
  () => {
    const d = allSources[sourceKey.value]?.data as GaugeData | undefined
    if (d?.items) items.value = d.items
  },
  { immediate: true },
)

function dash(it: { value: number }) {
  const r = 40
  const c = 2 * Math.PI * r
  return `${(c * Math.min(100, Math.max(0, it.value))) / 100} ${c}`
}
</script>

<template>
  <div class="sw-gauges" :style="{ gridTemplateColumns: `repeat(${Math.ceil(items.length / 2) || 1}, 1fr)` }">
    <div v-for="it in items" :key="it.name" class="gauge">
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="7" />
        <circle
          cx="50" cy="50" r="40" fill="none"
          stroke="var(--sw-accent)" stroke-width="7" stroke-linecap="round"
          :stroke-dasharray="dash(it)" transform="rotate(-90 50 50)"
        />
      </svg>
      <div class="mid">
        <b>{{ it.value }}%</b>
        <span>{{ it.name }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sw-gauges {
  display: grid;
  gap: 6px;
  height: 100%;
  align-items: center;
  min-height: 0;
}
.gauge {
  position: relative;
  width: 100%;
  max-width: 110px;
  margin: 0 auto;
  aspect-ratio: 1;
}
svg { width: 100%; height: 100%; }
circle { transition: stroke-dasharray 0.9s cubic-bezier(0.22, 1, 0.36, 1); }
.mid {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  text-align: center;
}
.mid b { font-size: clamp(12px, 1.2vw, 18px); color: var(--sw-numeral); font-variant-numeric: tabular-nums; }
.mid span { font-size: 11px; color: var(--sw-axis); }
</style>
