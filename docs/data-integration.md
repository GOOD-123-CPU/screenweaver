# 数据接入指南

从演示数据切换到真实数据，只改配置的 `sources` 部分，组件零改动。

## 三种接入方式对比

| 方式 | 适用场景 | 时效性 |
|---|---|---|
| `http` 轮询 | REST API、秒级~分钟级更新 | 轮询间隔 |
| `ws` 推送 | 行情、告警、设备遥测等高频场景 | 毫秒级 |
| `static` | 静态标注、阈值线、公告 | 手动更新 |

## HTTP 轮询

```jsonc
"sources": {
  "flow": {
    "type": "http",
    "url": "https://your.api/metrics/flow",
    "path": "data.list",
    "interval": 5000,
    "headers": { "Authorization": "Bearer <token>" }
  }
}
```

**响应取值路径（path）**：引擎用 `extractPath` 按点分路径逐层下钻。后端通常返回包裹结构：

```json
{ "code": 0, "data": { "list": [...] } }
```

配 `"path": "data.list"` 后组件直接拿到数组本体。

**约定数据格式**：组件消费的是引擎标准化结构（见 config-reference 的图表数据表）。建议在后端网关或一个薄适配层把原始数据整形为标准结构，而不是让组件去兼容各种原始格式。

### 认证与安全提示

- 不要把长期有效的 token 提交进仓库；配置文件中的 headers 仅适合内网/演示场景
- 生产环境建议经后端网关代理并做鉴权，大屏前端不直连业务库
- 跨域：API 需允许大屏域名的 CORS，或经同域反代

## WebSocket 推送

```jsonc
"sources": {
  "feed": { "type": "ws", "url": "wss://your.api/feed", "path": "data" }
}
```

- 消息必须是 JSON 文本帧
- 断线自动重连：指数退避（1s、2s、4s…封顶 30s），连接成功后计数归零
- 组件卸载时自动关闭连接，无泄漏

服务端推送示例：

```json
{ "data": { "categories": ["10:00", "10:05"], "series": [{ "name": "负荷", "values": [320, 341] }] } }
```

## 本地开发代理

开发时避免跨域，可在 `vite.config.ts` 加代理：

```ts
server: {
  port: 5188,
  proxy: {
    '/api': { target: 'http://your.api.local', changeOrigin: true }
  }
}
```

配置里写 `"url": "/api/metrics/flow"` 即可。

## 从 mock 平滑迁移

推荐流程：

1. 开发期全部用 `mock`，先调布局与视觉
2. 逐个数据源替换为 `http`/`ws`，每换一个刷新验证
3. 用 `npm run check:configs` 确认配置合法后再部署

mock 的产出结构与真实数据源完全一致，所以组件和 overrides 不需要任何改动。
