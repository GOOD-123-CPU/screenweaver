# 组件 API 与自定义组件开发

## 内置组件契约

所有内置组件遵循统一契约：

```ts
defineProps<{ decl: ComponentDecl }>()
// decl = { id: string, type: string, props?: Record<string, unknown> }
```

组件内部通过 `inject('sw-sources')` 拿到数据源池，用 `props.decl.props.source` 作 key 订阅，并 watch `updatedAt` 触发刷新。**组件不直接发起请求**——这是数据流单向可控的关键。

## 数据订阅模板

写自定义组件时照抄这段骨架即可：

```vue
<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue'
import type { ComponentDecl } from '../engine/schema'
import { useSources } from '../engine/useSources'

const props = defineProps<{ decl: ComponentDecl }>()
const sourceKey = computed(() => String(props.decl.props?.source ?? ''))
const allSources = inject<ReturnType<typeof useSources>>('sw-sources')!

const data = ref<MyData | null>(null)
watch(
  () => allSources[sourceKey.value]?.updatedAt,
  () => {
    const d = allSources[sourceKey.value]?.data
    if (d) data.value = d as MyData
  },
  { immediate: true },
)
</script>
```

## 注册自定义组件

```ts
// src/main.ts
import { registerComponent } from './engine/registry'
import MyWidget from './components/MyWidget.vue'

registerComponent('MyWidget', MyWidget)
```

配置中使用：

```jsonc
{ "id": "w1", "type": "MyWidget", "props": { "source": "kpi" } }
```

> 引擎启动时会调用 `registerBuiltinComponents()`；业务组件建议在 main.ts 里集中注册，保持引擎与业务解耦。

## 样式约定

自定义组件请使用主题 CSS 变量而非硬编码色值，保证在三套主题下都协调：

| 变量 | 用途 |
|---|---|
| `--sw-text` | 主文字 |
| `--sw-axis` | 次级文字/轴标签 |
| `--sw-accent` | 强调色（描边、高亮、图标） |
| `--sw-numeral` | 数字强调色 |
| `--sw-panel` | 面板背景 |
| `--sw-panel-border` | 面板描边 |
| `--sw-title` | 标题装饰色 |

## 动效规范

- 数值动画：用引擎同款「指数趋近」或 CSS transition，避免多个 rAF 循环叠加
- 所有 animation/transition 需在 `@media (prefers-reduced-motion: reduce)` 下关闭
- 无限循环动画（呼吸灯、流光）注意 `will-change` 与图层提升，避免整屏重绘

## 无障碍基线

- 纯装饰元素加 `aria-hidden="true"`
- 交互元素保证键盘可达（内置组件目前无强制交互，自定义交互组件请遵循 WAI-ARIA）
- 明色主题 `daylight` 下请勿使用透明度低于 0.6 的深色文字

## ECharts 直接使用

自定义组件可以不经 ChartBox 直接使用 ECharts，但请遵守：

1. `echarts.init` 后在 `onBeforeUnmount` 中 `dispose()`
2. 用 `ResizeObserver` 监听容器尺寸调用 `resize()`
3. 调用 `buildOption(type, data, overrides)` 获取随主题联动的 option；或用 `themeStore.current.palette` 自己组织配色
