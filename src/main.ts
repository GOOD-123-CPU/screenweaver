/**
 * 应用入口：
 * - 注册内置组件
 * - 根据地址栏 ?screen=xxx 加载 public/configs 下的 JSON 大屏配置
 * - 无参数或加载失败时展示大屏选择页
 */
import { createApp } from 'vue'
import App from './App.vue'
import { registerBuiltinComponents } from './engine/registry'

registerBuiltinComponents()
createApp(App).mount('#app')
