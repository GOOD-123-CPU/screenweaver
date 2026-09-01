<script setup lang="ts">
/**
 * RankList：条形排行榜，自动按值降序。
 */
import { computed, inject, watch, ref } from 'vue'
import type { ComponentDecl } from '../engine/schema'
import { useSources } from '../engine/useSources'

const props = defineProps<{ decl: ComponentDecl }>()

const sourceKey = computed(() => String(props.decl.props?.source ?? ''))
const allSources = inject<ReturnType<typeof useSources>>('sw-sources')!

interface RankData { rows: { name: string; value: number }[]; unit: string }
const data = ref<RankData>({ rows: [], unit: '' })

watch(
  () => allSources[sourceKey.value]?.updatedAt,
  () => {
    const d = allSources[sourceKey.value]?.data as RankData | undefined
    if (d?.rows) data.value = d
  },
  { immediate: true },
)

const max = computed(() => Math.max(1, ...data.value.rows.map((r) => r.value)))
</script>

<template>
  <div class="sw-rank">
    <div v-for="(r, i) in data.rows" :key="r.name" class="rank-row">
      <span class="idx" :class="`top-${Math.min(i, 2) + 1}`">{{ i + 1 }}</span>
      <span class="name" :title="r.name">{{ r.name }}</span>
      <div class="bar-wrap">
        <div class="bar" :style="{ width: `${(r.value / max) * 100}%` }" />
      </div>
      <span class="val">{{ r.value.toLocaleString() }}<i>{{ data.unit }}</i></span>
    </div>
  </div>
</template>

<style scoped>
.sw-rank {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  height: 100%;
  min-height: 0;
  padding: 2px 0;
}
.rank-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 0;
}
.idx {
  flex: none;
  width: 18px;
  height: 18px;
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 700;
  border-radius: 4px;
  color: var(--sw-axis);
  background: rgba(255, 255, 255, 0.06);
}
.idx.top-1 { color: #0b1222; background: var(--sw-accent); box-shadow: 0 0 8px var(--sw-accent); }
.idx.top-2 { color: #0b1222; background: color-mix(in srgb, var(--sw-accent) 62%, white); }
.idx.top-3 { color: #0b1222; background: color-mix(in srgb, var(--sw-accent) 38%, white); }
.name {
  flex: none;
  width: 30%;
  font-size: 12px;
  color: var(--sw-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.bar-wrap {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 4px;
  overflow: hidden;
}
.bar {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, color-mix(in srgb, var(--sw-accent) 55%, transparent), var(--sw-accent));
  box-shadow: 0 0 8px color-mix(in srgb, var(--sw-accent) 60%, transparent);
  transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}
.val {
  flex: none;
  width: 74px;
  text-align: right;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--sw-numeral);
}
.val i { font-style: normal; font-size: 10px; color: var(--sw-axis); margin-left: 2px; }
</style>
