<script setup lang="ts">
/**
 * ChartBox：ECharts 封装。
 * props.source 指向数据源 key，props.chart 为预设类型，
 * props.overrides 深合并进最终 option，实现"默认美 + 可精调"。
 */
import { onMounted, onBeforeUnmount, ref, watch, inject, computed } from 'vue'
import * as echarts from 'echarts'
import type { ComponentDecl } from '../engine/schema'
import { buildOption } from '../engine/chartPresets'
import { useSources } from '../engine/useSources'
import { themeStore } from '../themes/store'

const props = defineProps<{ decl: ComponentDecl }>()

const sourceKey = computed(() => String(props.decl.props?.source ?? ''))
const chartType = computed(() => String(props.decl.props?.chart ?? 'line'))
const overrides = computed(() => (props.decl.props?.overrides ?? undefined) as Record<string, unknown> | undefined)

const allSources = inject<ReturnType<typeof useSources>>('sw-sources')!
const el = ref<HTMLElement>()
let chart: echarts.ECharts | null = null
let ro: ResizeObserver | null = null

function render() {
  if (!chart) return
  const data = sourceKey.value ? allSources[sourceKey.value]?.data : undefined
  chart.setOption(buildOption(chartType.value, data, overrides.value), true)
}

onMounted(() => {
  chart = echarts.init(el.value!)
  render()
  ro = new ResizeObserver(() => chart?.resize())
  ro.observe(el.value!)
})
onBeforeUnmount(() => {
  ro?.disconnect()
  chart?.dispose()
  chart = null
})

watch(
  () => allSources[sourceKey.value]?.updatedAt,
  () => render(),
)
watch(
  () => [chartType.value, overrides.value, themeStore.current],
  () => render(),
  { deep: true },
)
</script>

<template>
  <div ref="el" class="sw-chart" />
</template>

<style scoped>
.sw-chart {
  width: 100%;
  height: 100%;
}
</style>
