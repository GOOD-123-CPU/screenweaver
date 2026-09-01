<script setup lang="ts">
/**
 * ProgressGroup：带目标线的进度对比组。
 * source -> { items: { name, value(0-100), target? }[] }
 */
import { computed, inject, ref, watch } from 'vue'
import type { ComponentDecl } from '../engine/schema'
import { useSources } from '../engine/useSources'

const props = defineProps<{ decl: ComponentDecl }>()

const sourceKey = computed(() => String(props.decl.props?.source ?? ''))
const allSources = inject<ReturnType<typeof useSources>>('sw-sources')!

interface PItem { name: string; value: number; target?: number }
const items = ref<PItem[]>([])
watch(
  () => allSources[sourceKey.value]?.updatedAt,
  () => {
    const d = allSources[sourceKey.value]?.data as { items?: PItem[] } | undefined
    if (d?.items) items.value = d.items
  },
  { immediate: true },
)

function level(v: number) {
  if (v >= 90) return 'ok'
  if (v >= 60) return 'mid'
  return 'low'
}
</script>

<template>
  <div class="sw-prog">
    <div v-for="it in items" :key="it.name" class="row">
      <div class="meta">
        <span class="name" :title="it.name">{{ it.name }}</span>
        <span class="pct" :class="level(it.value)">{{ it.value }}%</span>
      </div>
      <div class="rail">
        <div class="fill" :class="level(it.value)" :style="{ width: `${Math.min(100, it.value)}%` }" />
        <i v-if="it.target != null" class="target" :style="{ left: `${Math.min(100, it.target)}%` }" />
      </div>
      <span v-if="it.target != null" class="goal">目标 {{ it.target }}%</span>
    </div>
  </div>
</template>

<style scoped>
.sw-prog {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  height: 100%;
  min-height: 0;
  padding: 2px 0;
}
.row { display: flex; flex-direction: column; gap: 4px; }
.meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}
.name {
  color: var(--sw-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 70%;
}
.pct { font-variant-numeric: tabular-nums; color: var(--sw-axis); }
.pct.ok { color: #35d07f; }
.pct.mid { color: var(--sw-numeral); }
.pct.low { color: #ff7a6b; }
.rail {
  position: relative;
  height: 9px;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.06);
  overflow: visible;
}
.fill {
  height: 100%;
  border-radius: 5px;
  transition: width 0.9s cubic-bezier(0.22, 1, 0.36, 1);
  position: relative;
  overflow: hidden;
}
/* 高光流过效果 */
.fill::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, transparent 30%, rgba(255, 255, 255, 0.25) 50%, transparent 70%);
  animation: sheen 2.8s ease-in-out infinite;
}
@keyframes sheen {
  0% { transform: translateX(-100%); }
  60%, 100% { transform: translateX(120%); }
}
.fill.ok { background: linear-gradient(90deg, color-mix(in srgb, #35d07f 55%, transparent), #35d07f); }
.fill.mid { background: linear-gradient(90deg, color-mix(in srgb, var(--sw-accent) 45%, transparent), var(--sw-accent)); }
.fill.low { background: linear-gradient(90deg, color-mix(in srgb, #ff7a6b 50%, transparent), #ff7a6b); }
.target {
  position: absolute;
  top: -3px;
  bottom: -3px;
  width: 2px;
  background: rgba(255, 255, 255, 0.55);
  border-radius: 1px;
}
.target::after {
  content: '';
  position: absolute;
  inset: 0 0 auto;
  height: 4px;
  background: inherit;
}
.goal {
  align-self: flex-end;
  font-size: 10px;
  color: var(--sw-axis);
}
@media (prefers-reduced-motion: reduce) {
  .fill::after { animation: none; }
  .fill { transition: none; }
}
</style>
