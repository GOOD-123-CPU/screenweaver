# 更新日志

本项目的所有重要变更都记录在此文件中。
格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [1.0.0] - 2026-09-01

### 新增

- **WebSocket 数据源**：实时推送接入，断线指数退避自动重连（1s→30s 封顶），组件卸载自动关闭连接
- **Schema 运行时校验器**：零依赖，错误信息精确到字段路径（如 `layout[3].w: x + w 超出 12 列栅格`）；应用加载配置时自动校验并给出可读错误
- **配置批量校验脚本**：`npm run check:configs`，可挂 CI 作为门禁
- **明色主题 daylight 晨光**：WCAG AA 对比度，适配会议室/演示场景
- **引擎库模式构建**：`npm run build:lib` 产出 ESM/CJS + 类型出口，引擎可嵌入任意 Vue 应用
- **Vitest 单元测试**：25 个用例覆盖 deepMerge / extractPath / validateSchema / 全部 mock 生成器 / 注册表
- **CI 升级**：校验 → 测试 → 构建 → 库构建全流程门禁
- **docs/ 文档体系**：架构总览、配置参考、数据接入、组件 API、性能与无障碍五篇

### 修复

- `extractPath` 空路径返回原值而非 undefined（单测发现的边界缺陷）

### 变更

- 版本号升级至 1.0.0，面向生产使用

## [0.2.0] - 2026-09-01

### 新增

- 图表预设 5→9 种：mixed（折柱双轴）、funnel、sunburst、sankey（links 自动推导节点）
- mock 生成器 7→12 种：dualTrend、funnel、sunburst、sankey、progress
- 3 个内置组件：MarqueeBar 跑马灯、ProgressGroup 进度对比组、DecorCompass 装饰罗盘（总计 11 个）
- 科技感视觉：装饰层（网格/扫描光带/光晕）、wing-bar Header、面板交错入场与悬停抬升、标题流光线
- DigitalFlop 迷你趋势线
- Vite manualChunks 拆包、CI 与 GitHub Pages 工作流

### 修复

- DigitalFlop rAF 动画叠加导致的数值跳变（重构为单循环指数趋近）

## [0.1.0] - 2026-09-01

### 新增

- 大屏声明式 Schema：布局（12×12 栅格）、组件、数据源、主题一体化 JSON 描述
- 渲染引擎：等比缩放适配、组件注册表、数据源管理（static / http 轮询 / mock 模拟器）
- 8 个内置组件：PanelBox、ChartBox、DigitalFlop、ScrollTable、RankList、GaugeCluster、StatusGrid、TimeDisplay
- ECharts 图表预设 5 种（line / bar / pie / gauge / radar）+ overrides 深合并精调
- 三套原创暗色主题：墨夜 midnight、极光 aurora、烬火 ember
- 三套示例大屏：城市运行监测、销售运营看板、能源物联网监测（全部虚构演示数据）
- 大屏选择页与 `?screen=` 直达参数

[1.0.0]: https://github.com/YOUR_NAME/screenweaver/releases/tag/v1.0.0
[0.2.0]: https://github.com/YOUR_NAME/screenweaver/releases/tag/v0.2.0
[0.1.0]: https://github.com/YOUR_NAME/screenweaver/releases/tag/v0.1.0
