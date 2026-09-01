<script setup lang="ts">
/**
 * ScrollTable：无缝滚动的数据表格。
 */
import { computed, inject, ref, watch } from 'vue'
import type { ComponentDecl } from '../engine/schema'
import { useSources } from '../engine/useSources'

const props = defineProps<{ decl: ComponentDecl }>()

const sourceKey = computed(() => String(props.decl.props?.source ?? ''))
const rowMs = computed(() => Number(props.decl.props?.rowDuration ?? 2200))
const allSources = inject<ReturnType<typeof useSources>>('sw-sources')!

interface TableData { header: string[]; rows: { cells: string[] }[] }
const data = ref<TableData>({ header: [], rows: [] })

watch(
  () => allSources[sourceKey.value]?.updatedAt,
  () => {
    const d = allSources[sourceKey.value]?.data as TableData | undefined
    if (d?.rows) data.value = d
  },
  { immediate: true },
)

const scrollHeight = computed(() => Math.max(1, data.value.rows.length * 34))
</script>

<template>
  <div class="sw-stable">
    <div class="head" :style="{ gridTemplateColumns: `repeat(${data.header.length}, 1fr)` }">
      <span v-for="h in data.header" :key="h">{{ h }}</span>
    </div>
    <div class="body">
      <div class="track" :style="{ animationDuration: `${scrollHeight * (rowMs / 34)}ms` }">
        <div
          v-for="(r, i) in [...data.rows, ...data.rows]"
          :key="i"
          class="row"
          :style="{ gridTemplateColumns: `repeat(${data.header.length}, 1fr)` }"
        >
          <span v-for="(c, j) in r.cells" :key="j" :class="{ dim: j === 0 }">{{ c }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sw-stable {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-size: 12px;
  min-height: 0;
}
.head,
.row {
  display: grid;
  gap: 4px;
  padding: 0 6px;
}
.head {
  flex: none;
  color: var(--sw-accent);
  background: rgba(255, 255, 255, 0.05);
  line-height: 28px;
  border-radius: 4px;
  font-weight: 600;
  letter-spacing: 1px;
}
.body {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}
.track {
  animation-name: sw-scroll-up;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}
@keyframes sw-scroll-up {
  from { transform: translateY(0); }
  to { transform: translateY(-50%); }
}
.row {
  line-height: 34px;
  color: var(--sw-text);
  border-bottom: 1px dashed var(--sw-panel-border);
}
.row span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dim { color: var(--sw-axis); font-variant-numeric: tabular-nums; }
.track:hover { animation-play-state: paused; }
</style>
