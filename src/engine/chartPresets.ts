/**
 * 图表预设：把配置里的简写 chart 类型翻译成完整 ECharts option。
 * 预设 + 覆盖（overrides）双层结构：预设给 80% 的默认美感，用户用 overrides 精调剩下 20%。
 * 深合并保证 overrides 能精确改到任意层级。
 */
import type { EChartsOption } from 'echarts'
import { useThemeStore } from '../themes/store'
import type { ThemeData } from '../themes/store'

type AnyObj = Record<string, unknown>

/** 深合并，数组直接替换 */
export function deepMerge<T extends AnyObj>(base: T, patch?: AnyObj): T {
  if (!patch) return base
  const out: AnyObj = { ...(base as AnyObj) }
  for (const [k, v] of Object.entries(patch)) {
    const bv = (base as AnyObj)[k]
    out[k] =
      v && typeof v === 'object' && !Array.isArray(v) && bv && typeof bv === 'object' && !Array.isArray(bv)
        ? deepMerge(bv as AnyObj, v as AnyObj)
        : v
  }
  return out as T
}

const AXIS = (t: ThemeData) => ({
  axisLine: { lineStyle: { color: t.axisLine } },
  axisLabel: { color: t.axisLabel, fontSize: 10 },
  splitLine: { lineStyle: { color: t.splitLine, type: 'dashed' as const } },
})

function base(t: ThemeData): EChartsOption {
  return {
    backgroundColor: 'transparent',
    color: t.palette,
    tooltip: { backgroundColor: t.tooltipBg, borderColor: t.axisLine, textStyle: { color: t.text, fontSize: 11 } },
    legend: { textStyle: { color: t.axisLabel, fontSize: 10 }, itemWidth: 12, itemHeight: 8 },
  }
}

export function buildOption(type: string, data: unknown, overrides: AnyObj | undefined): EChartsOption {
  const t = useThemeStore()
  let opt: EChartsOption

  switch (type) {
    case 'line': {
      const d = (data ?? {}) as { categories?: string[]; series?: { name: string; values: number[] }[] }
      opt = deepMerge(base(t), {
        xAxis: { type: 'category', boundaryGap: false, data: d.categories ?? [], ...AXIS(t) },
        yAxis: { type: 'value', ...AXIS(t) },
        series: (d.series ?? []).map((s, i) => ({
          name: s.name,
          type: 'line' as const,
          data: s.values,
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 2 },
          areaStyle: { opacity: i === 0 ? 0.25 : 0.12 },
        })),
      })
      break
    }
    case 'bar': {
      const d = (data ?? {}) as { categories?: string[]; series?: { name: string; values: number[] }[] }
      opt = deepMerge(base(t), {
        xAxis: { type: 'category', data: d.categories ?? [], ...AXIS(t) },
        yAxis: { type: 'value', ...AXIS(t) },
        series: (d.series ?? []).map((s) => ({
          name: s.name,
          type: 'bar' as const,
          data: s.values,
          barMaxWidth: 14,
          itemStyle: { borderRadius: [4, 4, 0, 0] },
        })),
      })
      break
    }
    case 'pie': {
      const d = (data ?? {}) as { items?: { name: string; value: number }[] }
      opt = deepMerge(base(t), {
        series: [
          {
            type: 'pie' as const,
            radius: ['45%', '70%'],
            center: ['50%', '52%'],
            itemStyle: { borderRadius: 4, borderColor: t.panelBg, borderWidth: 2 },
            label: { color: t.axisLabel, fontSize: 10 },
            data: d.items ?? [],
          },
        ],
      })
      break
    }
    case 'gauge': {
      const d = (data ?? {}) as { items?: { name: string; value: number }[] }
      const items = d.items ?? []
      opt = deepMerge(base(t), {
        series: items.map((it) => ({
          type: 'gauge' as const,
          center: items.length === 1 ? ['50%', '55%'] : undefined,
          radius: items.length === 1 ? '80%' : undefined,
          startAngle: 220,
          endAngle: -40,
          min: 0,
          max: 100,
          progress: { show: true, width: 8 },
          axisLine: { lineStyle: { width: 8, color: [[1, t.splitLine]] } },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          pointer: { show: false },
          anchor: { show: false },
          title: { color: t.axisLabel, fontSize: 10, offsetCenter: [0, '62%'] },
          detail: { valueAnimation: true, fontSize: 16, color: t.text, offsetCenter: [0, '30%'], formatter: '{value}%' },
          data: [{ name: it.name, value: it.value }],
        })),
      })
      break
    }
    case 'radar': {
      const d = (data ?? {}) as { categories?: string[]; series?: { name: string; values: number[] }[] }
      opt = deepMerge(base(t), {
        radar: {
          indicator: (d.categories ?? []).map((n) => ({ name: n, max: 100 })),
          axisName: { color: t.axisLabel, fontSize: 10 },
          splitLine: { lineStyle: { color: t.splitLine } },
          splitArea: { show: false },
          axisLine: { lineStyle: { color: t.splitLine } },
        },
        series: [
          {
            type: 'radar' as const,
            areaStyle: { opacity: 0.2 },
            data: (d.series ?? []).map((s) => ({ name: s.name, value: s.values })),
          },
        ],
      })
      break
    }
    case 'funnel': {
      const d = (data ?? {}) as { items?: { name: string; value: number }[] }
      opt = deepMerge(base(t), {
        series: [
          {
            type: 'funnel' as const,
            left: '8%',
            width: '84%',
            top: 10,
            bottom: 6,
            minSize: '22%',
            gap: 3,
            label: { color: t.text, fontSize: 11, formatter: '{b}  {c}' },
            itemStyle: { borderColor: t.panelBg, borderWidth: 2 },
            data: d.items ?? [],
          },
        ],
      })
      break
    }
    case 'mixed': {
      // 折柱混合：series[0] 柱、series[1..] 线，数据结构与 line/bar 相同
      const d = (data ?? {}) as { categories?: string[]; series?: { name: string; values: number[] }[] }
      opt = deepMerge(base(t), {
        xAxis: { type: 'category', data: d.categories ?? [], ...AXIS(t) },
        yAxis: [
          { type: 'value', ...AXIS(t) },
          { type: 'value', ...AXIS(t), splitLine: { show: false } },
        ],
        series: (d.series ?? []).map((s, i) =>
          i === 0
            ? { name: s.name, type: 'bar' as const, data: s.values, barMaxWidth: 16, itemStyle: { borderRadius: [4, 4, 0, 0] } }
            : { name: s.name, type: 'line' as const, yAxisIndex: 1, data: s.values, smooth: true, showSymbol: false, lineStyle: { width: 2 } },
        ),
      })
      break
    }
    case 'sunburst': {
      const d = (data ?? {}) as { items?: { name: string; value?: number; children?: { name: string; value: number }[] }[] }
      opt = deepMerge(base(t), {
        series: [
          {
            type: 'sunburst' as const,
            radius: ['16%', '82%'],
            center: ['50%', '52%'],
            itemStyle: { borderColor: t.panelBg, borderWidth: 2, borderRadius: 3 },
            label: { color: t.text, fontSize: 10, rotate: 'radial' as const },
            data: d.items ?? [],
          },
        ],
      })
      break
    }
    case 'sankey': {
      const d = (data ?? {}) as { links?: { source: string; target: string; value: number }[] }
      // 从 links 自动推导节点
      const nodeSet = new Set<string>()
      for (const l of d.links ?? []) {
        nodeSet.add(l.source)
        nodeSet.add(l.target)
      }
      opt = deepMerge(base(t), {
        series: [
          {
            type: 'sankey' as const,
            left: 12,
            right: 18,
            top: 8,
            bottom: 8,
            emphasis: { focus: 'adjacency' as const },
            nodeAlign: 'justify' as const,
            lineStyle: { color: 'gradient' as const, opacity: 0.28, curveness: 0.5 },
            label: { color: t.axisLabel, fontSize: 10 },
            itemStyle: { borderColor: t.panelBg, borderWidth: 1 },
            data: [...nodeSet].map((n) => ({ name: n })),
            links: d.links ?? [],
          },
        ],
      })
      break
    }
    default:
      // type 未识别时交给 overrides 兜底（用户也可直接传完整 ECharts option）
      opt = deepMerge(base(t), (overrides ?? {}) as EChartsOption)
  }

  return deepMerge(opt, overrides)
}
