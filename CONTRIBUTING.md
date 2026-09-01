# 贡献指南

感谢关注 ScreenWeaver！提交贡献前请先阅读本指南。

## 行为准则

- 保持友善、尊重，聚焦技术讨论
- 示例配置与演示数据一律使用**虚构数据**，不提交涉及真实主体（真实人名、企业内部数据、可识别个人信息的任何内容）的代码或配置
- 不提交与本项目无关的推广链接、二维码、水印图片

## 开发流程

1. Fork 仓库并创建特性分支：
   ```bash
   git checkout -b feat/your-feature
   ```
2. 安装依赖并启动开发服务器：
   ```bash
   npm install && npm run dev
   ```
3. 完成开发后确保通过类型检查与构建：
   ```bash
   npm run build
   ```

## 提交规范

Commit message 采用 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/)：

```
feat: 新增地图组件
fix: 修复 ScrollTable 单行时长计算
docs: 补充数据源接入示例
```

## 新增内置组件

1. 组件放在 `src/components/`，命名采用大驼峰（如 `MapBox.vue`）
2. 在 `src/engine/registry.ts` 中注册
3. 附带一个演示配置 JSON 放入 `public/configs/`，保证效果可预览
4. 在 README「内置组件」表格中补一行说明

## 报告 Bug

Issue 请包含：复现步骤、期望行为、实际行为、浏览器与环境信息，尽量附最小复现配置 JSON。

## 许可证

提交即表示同意你的贡献以 [MIT](./LICENSE) 协议授权给本项目。
