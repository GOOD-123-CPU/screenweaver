# 性能与无障碍

## 性能

### 构建产物

生产构建按 `manualChunks` 拆分：`echarts`（gzip ≈ 343KB）与 `vue` 独立分块，业务代码改动不影响这两个大块的浏览器缓存。

### 渲染层

- **单一刷新信号**：所有组件 watch 数据源的 `updatedAt` 时间戳，数据没变不会触发 setOption/重排
- **图表实例复用**：ChartBox 在挂载时 init、卸载时 dispose，重渲染走 `setOption(option, true)` 而不是重建实例
- **ResizeObserver** 而非 window resize：面板尺寸变化才触发图表 resize，粒度更细
- **动画收敛**：数字翻牌器用单一 rAF 循环驱动全部数值（指数趋近），无论多少个指标同时变化都只有一个循环
- **装饰层零交互**：网格/光晕/扫描带均为 `pointer-events: none` 的纯视觉层，不影响事件命中

### 大屏场景建议

- 单屏组件建议 ≤ 20 个；ECharts 实例过多时优先合并为混合图（`mixed` 预设）
- 轮询间隔不建议低于 2s；高频场景改用 ws 推送，避免请求风暴
- 拼接屏/多实例部署时，用 `?screen=` 参数让每块屏只加载自己的配置

### prefers-reduced-motion

所有 CSS 动画（入场、流光、扫描带、呼吸灯）均在 `@media (prefers-reduced-motion: reduce)` 下停用。自定义组件请遵循同样约定（见 components.md）。

## 无障碍

当前版本的无障碍基线：

- 纯装饰元素标注 `aria-hidden="true"`
- 主题对比度：三套暗色主题正文对比度 ≥ 4.5:1；明色主题 daylight 遵循 WCAG AA
- 图表文字（轴标签、legend）字号 ≥ 10px 且颜色取自主题 `axisLabel`
- 键盘：首页大屏选择卡片为原生 `<button>`，天然可聚焦

规划中的增强（欢迎 PR）：图表数据表格替代文本（screen-reader fallback）、焦点管理、大屏操作遥控器键位映射。

## 浏览器支持

| 浏览器 | 版本 |
|---|---|
| Chrome / Edge | ≥ 90 |
| Firefox | ≥ 90 |
| Safari | ≥ 14 |

使用了 `color-mix()`、`mask-image`、CSS Grid 等特性；大屏场景基本为 Chrome 内核盒子供屏，兼容性风险低。
