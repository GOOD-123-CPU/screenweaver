<script setup lang="ts">
/**
 * StatusGrid：设备/点位状态矩阵（在线 / 忙碌 / 离线）。
 */
import { computed, inject, watch, ref } from 'vue'
import type { ComponentDecl } from '../engine/schema'
import { useSources } from '../engine/useSources'

const props = defineProps<{ decl: ComponentDecl }>()

const sourceKey = computed(() => String(props.decl.props?.source ?? ''))
const allSources = inject<ReturnType<typeof useSources>>('sw-sources')!

interface GridData { rows: number; cols: number; list: { name: string; state: string }[] }
const data = ref<GridData>({ rows: 0, cols: 0, list: [] })

watch(
  () => allSources[sourceKey.value]?.updatedAt,
  () => {
    const d = allSources[sourceKey.value]?.data as GridData | undefined
    if (d?.list) data.value = d
  },
  { immediate: true },
)

const stateText: Record<string, string> = { online: '在线', busy: '忙碌', offline: '离线' }
</script>

<template>
  <div class="sw-sgrid">
    <div class="legend">
      <span><i class="dot online" />在线</span>
      <span><i class="dot busy" />忙碌</span>
      <span><i class="dot offline" />离线</span>
    </div>
    <div
      class="matrix"
      :style="{ gridTemplateColumns: `repeat(${data.cols || 8}, 1fr)`, gridTemplateRows: `repeat(${data.rows || 4}, 1fr)` }"
    >
      <div
        v-for="n in data.list"
        :key="n.name"
        class="node"
        :class="n.state"
        :title="`${n.name} · ${stateText[n.state] ?? n.state}`"
      >
        <i class="dot" />
        <span>{{ n.name }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sw-sgrid {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
  min-height: 0;
}
.legend {
  flex: none;
  display: flex;
  gap: 14px;
  font-size: 11px;
  color: var(--sw-axis);
}
.legend span { display: inline-flex; align-items: center; gap: 4px; }
.dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.dot.online { background: #35d07f; box-shadow: 0 0 6px #35d07f; }
.dot.busy { background: #f5c451; box-shadow: 0 0 6px #f5c451; }
.dot.offline { background: #5a6478; }
.matrix {
  flex: 1;
  display: grid;
  gap: 6px;
  min-height: 0;
}
.node {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 8px;
  font-size: 11px;
  color: var(--sw-axis);
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid var(--sw-panel-border);
  border-radius: 5px;
  min-width: 0;
  overflow: hidden;
}
.node span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.node.online { border-color: rgba(53, 208, 127, 0.45); }
.node.online .dot { background: #35d07f; box-shadow: 0 0 6px #35d07f; animation: breathe 2.4s ease-in-out infinite; }
.node.busy { border-color: rgba(245, 196, 81, 0.45); }
.node.busy .dot { background: #f5c451; box-shadow: 0 0 6px #f5c451; }
.node.offline { opacity: 0.55; }
.node.offline .dot { background: #5a6478; }
@keyframes breathe {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
}
</style>
