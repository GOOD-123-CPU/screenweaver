<div align="center">

# ScreenWeaver 织屏

**配置驱动的大屏数据可视化引擎 —— 用一份 JSON 描述一块大屏。**

[![License: MIT](https://img.shields.io/badge/License-MIT-3f8cff.svg)](./LICENSE)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-42b883.svg)](https://vuejs.org/)
[![ECharts 5](https://img.shields.io/badge/ECharts-5.x-aa344d.svg)](https://echarts.apache.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646cff.svg)](https://vitejs.dev/)
[![CI](https://github.com/GOOD-123-CPU/screenweaver/actions/workflows/ci.yml/badge.svg)](https://github.com/GOOD-123-CPU/screenweaver/actions/workflows/ci.yml)
[![Tests](https://img.shields.io/badge/tests-vitest-6e9f18.svg)](tests/engine.spec.ts)

</div>

## 这是什么

ScreenWeaver 把大屏开发从「复制粘贴改 HTML」变成「写一份 JSON」：

- **声明式配置** —— 布局（12×12 栅格）、组件、数据源、主题，全部写在一个 JSON 文件里
- **Schema 校验** —— 零依赖运行时校验器，错误精确到字段路径；`npm run check:configs` 可挂 CI
- **等比缩放适配** —— 设计稿 1920×1080，任意分辨率/拼接屏自动等比居中，无滚动条
- **数据源解耦** —— `static` / `http`(轮询) / `ws`(实时推送，指数退避重连) / `mock`(12 种模拟器) 四种数据源，改数据不动组件
- **图表预设 + 精调** —— `line / bar / pie / gauge / radar / mixed / funnel / sunburst / sankey` 九种预设一行声明即得完整配色，`overrides` 字段可深合并覆盖任意 ECharts 配置
- **主题系统** —— 墨夜 / 极光 / 烬火三套暗色 + 晨光明色主题，CSS 变量 + ECharts 调色板联动切换
- **引擎可复用** —— 引擎层支持库模式构建（ESM/CJS），嵌入你自己的 Vue 应用
- **动效细节** —— 面板交错入场、扫描光带、网格底纹、数字滚动、进度流光，均尊重 `prefers-reduced-motion`
- **组件可扩展** —— 注册表模式，`registerComponent('MyWidget', MyWidget)` 即可插入自定义 Vue 组件
- **质量保障** —— Vitest 单测覆盖引擎纯函数、CI 全流程（校验→测试→构建→库构建）

> 示例包含运行时生成的模拟数值和静态演示文本，均为**虚构演示数据**，不代表真实业务指标。

## 数据科学项目中的用途

用于把分析结果组织为可交互的数据看板：配置定义展示结构，数据源提供指标与序列，组件负责渲染。可从 [城市运行示例配置](./public/configs/city-ops.json) 查看一份完整案例，再结合 [数据接入指南](./docs/data-integration.md) 替换为自己的分析输出。

仓库中的示例展示可视化与数据接入能力；统计建模、指标计算和数据质量校验需要在上游分析流程中完成。

## 快速开始

使用 Node.js 22，与仓库 CI 环境保持一致。首次运行：

```bash
git clone https://github.com/GOOD-123-CPU/screenweaver.git
cd screenweaver
npm ci
npm run dev
```

打开终端输出的地址，默认路径为 `http://localhost:5188/screenweaver/`。端口被占用时，以终端输出为准。

其他命令：

```bash
npm install
npm run dev            # 开发模式 http://localhost:5188
npm run build          # 生产构建（含 TS 类型检查）
npm run test           # Vitest 单元测试
npm run check:configs  # 批量校验示例配置
npm run build:lib      # 引擎库模式构建（ESM/CJS）
npm run preview        # 预览构建产物
```

打开首页选择示例大屏，或直接访问：

```
http://localhost:5188/screenweaver/?screen=city-ops      # 城市运行监测（墨夜主题）
http://localhost:5188/screenweaver/?screen=sales-board   # 销售运营看板（烬火主题）
http://localhost:5188/screenweaver/?screen=energy-iot    # 能源物联网监测（极光主题）
```

## 一份配置长什么样

```jsonc
{
  "width": 1920, "height": 1080,       // 设计稿尺寸，运行时等比缩放
  "theme": "midnight",                  // midnight | aurora | ember
  "header": { "title": "城市运行监测指挥中心", "clock": true },
  "layout": [                           // 12x12 栅格占位
    { "i": "chart1", "x": 0, "y": 2, "w": 5, "h": 5 }
  ],
  "components": [
    { "id": "chart1", "type": "ChartBox",
      "props": { "chart": "line", "source": "flow",
                 "overrides": { "series": [{ "areaStyle": { "opacity": 0.4 } }] } } }
  ],
  "sources": {
    "flow": { "type": "mock", "generator": "trend", "interval": 9000 }
  }
}
```

## 内置组件

| 组件 | 说明 |
|---|---|
| `PanelBox` | 带角标装饰与流光标题线的面板容器 |
| `ChartBox` | ECharts 封装（9 种预设 + overrides 精调） |
| `DigitalFlop` | 数字翻牌器指标组（滚动动画 + 迷你趋势线） |
| `ScrollTable` | 无缝滚动数据表格（悬停暂停） |
| `RankList` | 条形排行榜（前三名高亮） |
| `GaugeCluster` | 迷你环形仪表簇 |
| `StatusGrid` | 设备状态矩阵（在线呼吸灯/忙碌/离线） |
| `ProgressGroup` | 带目标线的进度对比组（三档配色 + 流光） |
| `MarqueeBar` | 横向无缝滚动公告跑马灯 |
| `DecorCompass` | 纯装饰旋转罗盘（中空布局中心点） |
| `TimeDisplay` | 标题栏日期时钟 |

## 数据接入

把 `mock` 换成 `http` 或 `ws` 即可接真实数据：

```jsonc
"sources": {
  "flow": {
    "type": "http",
    "url": "https://your.api/flow",
    "path": "data.list",        // 可选：响应取值路径
    "interval": 5000            // 轮询间隔 ms，0 = 只取一次
  },
  "feed": { "type": "ws", "url": "wss://your.api/feed" }   // 实时推送
}
```

详见 [数据接入指南](./docs/data-integration.md)（认证、跨域、本地代理、mock 平滑迁移）。

## 引擎库模式

引擎层与 UI 解耦，可构建为独立 npm 包嵌入你自己的 Vue 应用：

```bash
npm run build:lib   # 产出 dist-lib/engine.es.js + engine.cjs.js
```

```ts
import { validateSchema, useSources, buildOption } from 'screenweaver/engine'
```

## 文档

| 文档 | 内容 |
|---|---|
| [架构总览](./docs/architecture.md) | 三层分离设计、关键决策、数据流 |
| [配置参考](./docs/config-reference.md) | 全部字段的权威参考（Schema Reference） |
| [数据接入](./docs/data-integration.md) | http/ws/代理/认证/mock 迁移 |
| [组件 API](./docs/components.md) | 内置组件契约、自定义组件开发、样式与动效规范 |
| [性能与无障碍](./docs/performance.md) | 渲染优化、动画收敛、WCAG 基线 |

## 注册自定义组件

```ts
import { registerComponent } from './engine/registry'
import MyWidget from './MyWidget.vue'

registerComponent('MyWidget', MyWidget)
// 之后配置里写 { "type": "MyWidget" } 即可
```

## 目录结构

```
src/
├── engine/            # 引擎核心（与 UI 无关，可独立复用/库构建）
│   ├── schema.ts      #   配置类型定义
│   ├── registry.ts    #   组件注册表
│   ├── useScale.ts    #   等比缩放适配
│   ├── useSources.ts  #   数据源管理（static/http/ws/mock）+ extractPath
│   ├── mock.ts        #   内置模拟数据生成器（12 种）
│   ├── chartPresets.ts#   ECharts 图表预设与深合并
│   ├── validate.ts    #   Schema 运行时校验（零依赖）
│   └── lib-entry.ts   #   库模式统一出口
├── components/        # 11 个内置大屏组件
├── themes/            # 四套主题（三暗一明，CSS 变量 + ECharts 调色板）
├── ScreenRenderer.vue # 渲染根：schema -> 栅格 -> 组件（含装饰层与入场动画）
└── App.vue            # 大屏选择页（加载时运行时校验配置）
tests/                 # Vitest 单元测试
docs/                  # 架构 / 配置参考 / 数据接入 / 组件 API / 性能
scripts/               # 配置批量校验脚本（CI 可挂）
public/configs/        # 示例大屏 JSON（放你的 JSON 到这里即可被加载）
```

## 部署

项目内置两条 GitHub Actions 工作流：

- **CI**（`.github/workflows/ci.yml`）：push/PR 时自动配置校验 → 单元测试 → 类型检查构建 → 库构建
- **GitHub Pages**（`.github/workflows/pages.yml`）：push 到 main 自动部署在线预览

使用 Pages 部署需在仓库 Settings → Pages 中将 Source 设为 **GitHub Actions**。

## 路线图

- [ ] 地图组件（基于 GeoJSON，配色随主题）
- [ ] 拖拽式大屏编辑器（生成配置 JSON）
- [ ] 图表 screen-reader 数据表替代（无障碍增强）
- [ ] 组件 npm 包化，支持按需引入
- [ ] 大屏截图/PDF 导出

## 参与贡献

欢迎 Issue 与 PR！提交前请阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)。
新增内置组件请附演示配置；示例数据必须为虚构数据，不接受含真实主体数据的 PR。

## 许可证

[MIT](./LICENSE) © screenweaver contributors

依赖归属：[Vue 3](https://github.com/vuejs/core) (MIT) · [ECharts](https://github.com/apache/echarts) (Apache-2.0) · [Vite](https://github.com/vitejs/vite) (MIT)
