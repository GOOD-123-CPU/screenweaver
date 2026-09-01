# 示例大屏说明

本目录下的三份 JSON 均为**引擎能力演示**，配套数据由引擎内置的
mock 生成器在运行时随机产生，全部为**虚构演示数据**，不代表任何真实主体。

| 文件 | 主题 | 演示能力 |
|---|---|---|
| `city-ops.json` | 墨夜 midnight | 数字翻牌器、折线、柱状、滚动表格、环形图、排行榜 |
| `sales-board.json` | 烬火 ember | 指标组、柱状、饼图、雷达、仪表盘、排行 |
| `energy-iot.json` | 极光 aurora | 迷你仪表簇、负荷曲线、状态矩阵、分类占比 |

## 使用

1. 把 JSON 复制或新建到本项目 `public/configs/` 目录
2. 访问 `http://localhost:5188/?screen=文件名`（不含 `.json` 后缀）

## 接入真实数据

将配置中的 `"type": "mock"` 数据源替换为 `"type": "http"`，字段说明见
README「数据接入」一节。静态数据可直接用 `"type": "static"` 内联。
