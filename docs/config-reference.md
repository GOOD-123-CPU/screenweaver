# 配置参考（Schema Reference）

一份大屏 = 一个 JSON 文件。以下是全部可用字段的权威参考。

## 顶层字段

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `width` | number | ✅ | 设计稿宽度（320~8192），常用 1920 |
| `height` | number | ✅ | 设计稿高度（240~8192），常用 1080 |
| `theme` | string | — | `midnight` 墨夜 / `aurora` 极光 / `ember` 烬火 / `daylight` 晨光（明色） |
| `header` | object | — | `{ title, subtitle?, clock? }`，不传则不渲染标题栏 |
| `layout` | array | ✅ | 12×12 栅格占位声明 |
| `components` | array | ✅ | 组件声明，`id` 与 layout 的 `i` 对应 |
| `sources` | object | ✅ | 数据源池，key 供组件 `props.source` 引用 |
| `refreshInterval` | number | — | http 数据源轮询间隔兜底（ms），默认 5000 |

## layout 条目

```jsonc
{ "i": "chart1", "x": 0, "y": 2, "w": 5, "h": 5 }
```

| 字段 | 范围 | 说明 |
|---|---|---|
| `i` | — | 组件 id，唯一，必须存在于 components |
| `x` / `y` | 0~11 | 栅格起点（左上角为 0,0） |
| `w` / `h` | 1~12 | 占位宽高；`x+w ≤ 12`、`y+h ≤ 12` |

## 数据源（sources）

### static —— 静态内联

```jsonc
"news": { "type": "static", "data": { "items": ["要点一", "要点二"] } }
```

### mock —— 内置模拟器（12 种生成器）

```jsonc
"flow": { "type": "mock", "generator": "trend", "params": { "points": 24 }, "interval": 9000 }
```

| 生成器 | 产出结构 | 关键 params |
|---|---|---|
| `trend` | `{ categories, series }` | `points` `base` `variance` `labels:"hours"` |
| `dualTrend` | 双序列（mixed 用） | 同上 |
| `share` | `{ items:[{name,value}] }` | `items` `names[]` |
| `ranking` | `{ rows:[{name,value}], unit }` | `rows` `unit` |
| `metrics` | `{ items:[{label,unit,value}] }` | `items`（1~6） |
| `gauges` | `{ items:[{name,value}] }`（0~100） | `items` |
| `statusGrid` | `{ rows, cols, list:[{name,state}] }` | `rows` `cols` `prefix` |
| `table` | `{ header, rows:[{cells}] }` | `rows` |
| `funnel` | `{ items }` 递减序列 | `stages`（1~6） |
| `sunburst` | 两层树 | `groups`（1~5） |
| `sankey` | `{ links:[{source,target,value}] }` | — |
| `progress` | `{ items:[{name,value,target?}] }` | `items[]`（name/target 来自配置，value 随机） |

### http —— 轮询拉取

```jsonc
"kpi": {
  "type": "http",
  "url": "https://your.api/kpi",
  "path": "data.list",     // 可选：响应取值路径
  "interval": 5000,        // 0 = 只取一次
  "headers": { "Authorization": "Bearer ..." }
}
```

### ws —— 实时推送

```jsonc
"feed": { "type": "ws", "url": "wss://your.api/feed", "path": "data" }
```

断线自动重连（指数退避 1s→2s→4s…上限 30s），消息必须是 JSON。

## ChartBox 图表预设（chart）

| chart | 说明 | 数据结构 |
|---|---|---|
| `line` | 平滑面积折线 | `{ categories, series:[{name,values}] }` |
| `bar` | 圆角柱状 | 同上 |
| `mixed` | 柱+线双轴（series[0] 柱） | 同上 |
| `pie` | 环形占比 | `{ items:[{name,value}] }` |
| `gauge` | 仪表盘（多值自动均分） | `{ items:[{name,value}] }`（0~100） |
| `radar` | 雷达（indicator 自动 max=100） | `{ categories, series }` |
| `funnel` | 漏斗 | `{ items:[{name,value}] }` |
| `sunburst` | 旭日（两层） | `{ items:[{name,children:[{name,value}]}] }` |
| `sankey` | 桑基（节点从 links 自动推导） | `{ links:[{source,target,value}] }` |

### overrides 精调

`overrides` 与预设生成的 option 深合并（对象递归、数组替换），可改任意层级：

```jsonc
"props": {
  "chart": "line", "source": "flow",
  "overrides": {
    "legend": { "top": 2 },
    "series": [{ "areaStyle": { "opacity": 0.45 } }]
  }
}
```

## 组件 props 速查

| 组件 | 关键 props |
|---|---|
| `PanelBox` | `title` `corners`（默认 true） |
| `ChartBox` | `chart` `source` `overrides` |
| `DigitalFlop` | `source` `sparkline`（默认 true） |
| `ScrollTable` | `source` `rowDuration`（ms/行，默认 2200） |
| `RankList` | `source` |
| `GaugeCluster` | `source` |
| `StatusGrid` | `source` |
| `ProgressGroup` | `source`（数据需含 `target` 时显示目标线） |
| `MarqueeBar` | `source`（`{items:[string]}`） `speed`（px/s） |
| `DecorCompass` | `size`（px） |

## 校验

配置会被运行时校验（`validateSchema`），失败时选择页显示前 4 条错误及路径；CI 中可用 `npm run check:configs` 批量校验。错误信息精确到字段路径（如 `layout[3].w: x + w 超出 12 列栅格`）。
