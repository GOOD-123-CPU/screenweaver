/**
 * 内置模拟数据生成器。
 * 所有数据均为运行时随机产生的虚构演示数据，与任何真实主体无关。
 */

type Params = Record<string, unknown>
type Gen = (p: Params) => unknown

const rand = (min: number, max: number) => min + Math.random() * (max - min)
const randInt = (min: number, max: number) => Math.floor(rand(min, max + 1))

const pick = <T>(arr: readonly T[]) => arr[randInt(0, arr.length - 1)]

/** 生成时间序列（用于折线/柱状），带平缓随机走势 */
function trend({ points = 24, base = 100, variance = 40, labels }: Params) {
  const n = Math.max(2, Number(points))
  const xs: string[] = []
  const ys: number[] = []
  let v = Number(base)
  for (let i = 0; i < n; i++) {
    v = Math.max(0, v + rand(-Number(variance), Number(variance)) * 0.4)
    ys.push(Math.round(v))
    const h = Math.floor((i * 24) / n)
    xs.push(typeof labels === 'string' && labels === 'hours' ? `${String(h).padStart(2, '0')}:00` : `P${i + 1}`)
  }
  return { categories: xs, series: [{ name: '数值', values: ys }] }
}

/** 多分类占比（用于饼图/环形图） */
function share({ items = 5, names }: Params) {
  const pool = ['分类A', '分类B', '分类C', '分类D', '分类E', '分类F', '分类G']
  const n = Math.min(Number(items), 7)
  const list = Array.from({ length: n }, (_, i) => ({
    name: Array.isArray(names) && names[i] ? String(names[i]) : pool[i],
    value: randInt(20, 100),
  }))
  return { items: list }
}

/** 排行榜数据 */
function ranking({ rows = 8, unit = '件' }: Params) {
  const words = ['星河', '远航', '晨曦', '磐石', '云帆', '听涛', '观澜', '青竹', '白鹭', '北斗', '启明', '长风']
  const list = Array.from({ length: Math.max(3, Number(rows)) }, () => ({
    name: `${pick(words)}${pick(['一组', '二组', '中心', '站所', '车队', '车间'])}`,
    value: randInt(50, 999),
  }))
  list.sort((a, b) => b.value - a.value)
  return { rows: list, unit: String(unit) }
}

/** 数字翻牌器指标组 */
function metrics({ items = 4 }: Params) {
  const pool = [
    { label: '今日总量', unit: '条' },
    { label: '在线设备', unit: '台' },
    { label: '处理事项', unit: '件' },
    { label: '活跃用户', unit: '人' },
    { label: '运转车辆', unit: '辆' },
    { label: '告警事件', unit: '起' },
  ]
  return {
    items: Array.from({ length: Math.min(Number(items), 6) }, (_, i) => ({
      ...pool[i],
      value: randInt(100, 99999),
    })),
  }
}

/** 仪表盘簇数据 */
function gauges({ items = 4 }: Params) {
  const pool = ['CPU', '内存', '磁盘', '网络', '负载', '并发']
  return {
    items: Array.from({ length: Math.min(Number(items), 6) }, (_, i) => ({
      name: pool[i],
      value: randInt(5, 95),
    })),
  }
}

/** 状态矩阵数据（设备/点位在线离线） */
function statusGrid({ rows = 4, cols = 8, prefix = '节点' }: Params) {
  const states = ['online', 'busy', 'offline'] as const
  const list: { name: string; state: (typeof states)[number] }[] = []
  for (let r = 0; r < Number(rows); r++) {
    for (let c = 0; c < Number(cols); c++) {
      list.push({ name: `${prefix}-${r + 1}${String.fromCharCode(65 + c)}`, state: pick(states) })
    }
  }
  return { rows: Number(rows), cols: Number(cols), list }
}

/** 滚动表格数据 */
function table({ rows = 10 }: Params) {
  const cities = ['江州市', '临海市', '望川县', '云岭市', '平湖市', '青阳市']
  const events = ['数据同步', '设备巡检', '工单派发', '告警确认', '例行维护']
  return {
    header: ['时间', '地区', '事项', '状态'],
    rows: Array.from({ length: Math.max(5, Number(rows)) }, () => ({
      cells: [
        `${String(randInt(0, 23)).padStart(2, '0')}:${String(randInt(0, 59)).padStart(2, '0')}`,
        pick(cities),
        pick(events),
        pick(['正常', '处理中', '已完成']),
      ],
    })),
  }
}

/** 双序列走势（折柱混合用） */
function dualTrend({ points = 12, labels }: Params) {
  const n = Math.max(2, Number(points))
  const xs: string[] = []
  const a: number[] = []
  const b: number[] = []
  let va = Number(320)
  let vb = Number(60)
  for (let i = 0; i < n; i++) {
    va = Math.max(0, va + rand(-70, 70) * 0.5)
    vb = Math.max(0, vb + rand(-14, 14) * 0.5)
    a.push(Math.round(va))
    b.push(Math.round(vb))
    const h = Math.floor((i * 24) / n)
    xs.push(typeof labels === 'string' && labels === 'hours' ? `${String(h).padStart(2, '0')}:00` : `P${i + 1}`)
  }
  return { categories: xs, series: [{ name: '主指标', values: a }, { name: '辅助指标', values: b }] }
}

/** 漏斗数据 */
function funnel({ stages = 5 }: Params) {
  const pool = ['曝光', '触达', '留资', '成交', '复购', '推荐']
  const n = Math.min(Number(stages), 6)
  let v = randInt(800, 1200)
  return {
    items: Array.from({ length: n }, (_, i) => {
      const it = { name: pool[i], value: Math.round(v) }
      v = Math.round(v * rand(0.42, 0.72))
      return it
    }),
  }
}

/** 旭日图数据（两层） */
function sunburst({ groups = 4 }: Params) {
  const roots = ['源 A', '源 B', '源 C', '源 D', '源 E']
  const leaves = ['细分一', '细分二', '细分三']
  return {
    items: Array.from({ length: Math.min(Number(groups), 5) }, (_, i) => ({
      name: roots[i],
      children: leaves.map((l) => ({ name: l, value: randInt(15, 120) })),
    })),
  }
}

/** 桑基图数据（能量/流量流转） */
function sankey() {
  const nodes = ['来源 A', '来源 B', '来源 C', '环节一', '环节二', '去向 X', '去向 Y']
  const links = [
    { source: '来源 A', target: '环节一', value: randInt(60, 120) },
    { source: '来源 B', target: '环节一', value: randInt(40, 90) },
    { source: '来源 C', target: '环节二', value: randInt(50, 100) },
    { source: '环节一', target: '环节二', value: randInt(30, 80) },
    { source: '环节一', target: '去向 X', value: randInt(20, 60) },
    { source: '环节二', target: '去向 X', value: randInt(30, 70) },
    { source: '环节二', target: '去向 Y', value: randInt(40, 90) },
  ]
  return { links }
}

/** 进度对比组数据：items 可由配置传入名称与目标值，数值随机 */
function progress({ items }: Params) {
  const arr = Array.isArray(items) ? items : [{ name: '指标' }]
  return {
    items: arr.map((it) => ({
      name: String((it as Params).name ?? '指标'),
      value: randInt(35, 99),
      target: (it as Params).target != null ? Number((it as Params).target) : undefined,
    })),
  }
}

const generators: Record<string, Gen> = {
  trend,
  dualTrend,
  share,
  ranking,
  metrics,
  gauges,
  statusGrid,
  table,
  funnel,
  sunburst,
  sankey,
  progress,
}

export function runMock(generator: string, params?: Params): unknown {
  const gen = generators[generator]
  if (!gen) {
    console.warn(`[screenweaver] unknown mock generator: ${generator}`)
    return null
  }
  return gen(params ?? {})
}
