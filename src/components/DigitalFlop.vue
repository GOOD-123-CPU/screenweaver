<script setup lang="ts">
/**
 * DigitalFlop：数字翻牌器指标组，数值变化时滚动动画。
 * v0.2：单一 rAF 循环驱动全部数值动画（防叠加）、迷你趋势线（sparkline）。
 */
import { computed, inject, onBeforeUnmount, reactive, ref, watch } from 'vue'
import type { ComponentDecl } from '../engine/schema'
import { useSources } from '../engine/useSources'

const props = defineProps<{ decl: ComponentDecl }>()

const sourceKey = computed(() => String(props.decl.props?.source ?? ''))
const showSpark = computed(() => props.decl.props?.sparkline !== false)
const allSources = inject<ReturnType<typeof useSources>>('sw-sources')!

interface Metric { label: string; unit: string; value: number }
const items = ref<Metric[]>([])

watch(
  () => allSources[sourceKey.value]?.updatedAt,
  () => {
    const d = allSources[sourceKey.value]?.data as { items?: Metric[] } | undefined
    if (d?.items) items.value = d.items
  },
  { immediate: true },
)

/** 单一 rAF 循环：从旧值缓动到新值，重复 watch 只更新目标值 */
const displayed = reactive<Record<string, number>>({})
const targets = reactive<Record<string, number>>({})
let raf = 0

function tick() {
  let busy = false
  for (const k of Object.keys(targets)) {
    const from = displayed[k] ?? 0
    const diff = targets[k] - from
    if (Math.abs(diff) > 0.5) {
      displayed[k] = from + diff * 0.14 // 指数趋近，无叠加问题
      busy = true
    } else {
      displayed[k] = targets[k]
    }
  }
  raf = busy ? requestAnimationFrame(tick) : 0
}

watch(items, (list) => {
  list.forEach((it, i) => {
    targets[String(i)] = it.value
  })
  if (!raf) raf = requestAnimationFrame(tick)
})
onBeforeUnmount(() => {
  if (raf) cancelAnimationFrame(raf)
})

/** 迷你趋势线：以当前值为终点的伪随机历史 */
function sparkPath(i: number, val: number) {
  const pts = 8
  let v = val * 0.75
  const arr: number[] = []
  for (let j = 0; j < pts; j++) {
    v = Math.max(0, v + (Math.sin(i * 7 + j * 2.7) + 0.8) * val * 0.05)
    arr.push(v)
  }
  arr.push(val)
  const max = Math.max(...arr, 1)
  return arr
    .map((y, j) => `${(j / (arr.length - 1)) * 60},${22 - (y / max) * 20}`)
    .join(' ')
}
</script>

<template>
  <div class="sw-flops" :style="{ gridTemplateColumns: `repeat(${items.length || 1}, 1fr)` }">
    <div v-for="(it, i) in items" :key="i" class="flop">
      <svg v-if="showSpark" class="spark" viewBox="0 0 60 24" preserveAspectRatio="none">
        <polyline
          :points="sparkPath(i, targets[String(i)] ?? it.value)"
          fill="none" stroke="var(--sw-numeral)" stroke-width="1.4"
          stroke-linejoin="round" opacity="0.55"
        />
      </svg>
      <div class="num">
        <span class="val">{{ (displayed[String(i)] ?? 0).toLocaleString() }}</span>
        <span class="unit">{{ it.unit }}</span>
      </div>
      <div class="label">{{ it.label }}</div>
    </div>
  </div>
</template>

<style scoped>
.sw-flops {
  display: grid;
  gap: 8px;
  height: 100%;
  align-items: stretch;
}
.flop {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent);
  border: 1px solid var(--sw-panel-border);
  border-radius: 6px;
  min-width: 0;
  padding: 4px;
  overflow: hidden;
}
.spark {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 34%;
  pointer-events: none;
}
.num {
  display: flex;
  align-items: baseline;
  gap: 3px;
}
.val {
  font-size: clamp(18px, 2vw, 30px);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--sw-numeral);
  text-shadow: 0 0 12px color-mix(in srgb, var(--sw-numeral) 55%, transparent);
}
.unit {
  font-size: 11px;
  color: var(--sw-axis);
}
.label {
  margin-top: 3px;
  font-size: 12px;
  letter-spacing: 1px;
  color: var(--sw-axis);
  z-index: 1;
}
</style>
