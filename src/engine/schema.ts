/**
 * ScreenWeaver 大屏描述 Schema
 *
 * 一块大屏 = 一个 JSON 文件：栅格布局 + 组件列表 + 数据源 + 主题。
 * 所有字段均为引擎自有设计，示例数据均为虚构。
 */

/** 布局条目：组件在 12 列 x 12 行栅格上的占位 */
export interface LayoutItem {
  /** 组件唯一 id，与 components[].id 对应 */
  i: string
  x: number // 0-11
  y: number // 0-11
  w: number // 1-12
  h: number // 1-12
}

/** 组件声明 */
export interface ComponentDecl {
  id: string
  /** 注册表中的组件类型名 */
  type: string
  /** 传给组件的属性（各组件自定义） */
  props?: Record<string, unknown>
}

/** 静态 JSON 数据源 */
export interface StaticSource {
  type: 'static'
  data: unknown
}

/** 轮询 HTTP 数据源 */
export interface PollingSource {
  type: 'http'
  url: string
  /** 轮询间隔毫秒，默认 5000，0 表示只取一次 */
  interval?: number
  /** 可选的取值路径，如 "data.list" */
  path?: string
  headers?: Record<string, string>
}

/** 模拟数据源：由引擎内置随机生成器产生，用于演示 */
export interface MockSource {
  type: 'mock'
  /** mock 生成器名称，见 engine/mock.ts */
  generator: string
  /** 传给生成器的参数 */
  params?: Record<string, unknown>
  /** 模拟刷新间隔毫秒 */
  interval?: number
}

/** WebSocket 实时推送数据源（指数退避自动重连） */
export interface WsSource {
  type: 'ws'
  url: string
  /** 消息取值路径，如 "data.list" */
  path?: string
}

export type SourceDecl = StaticSource | PollingSource | MockSource | WsSource

export interface ScreenSchema {
  /** 大屏设计尺寸，渲染时等比缩放适配窗口 */
  width: number
  height: number
  /** 主题 id：midnight | aurora | ember */
  theme?: string
  /** 标题栏（不传则不渲染） */
  header?: {
    title: string
    subtitle?: string
    /** 是否显示日期时间，默认 true */
    clock?: boolean
  }
  /** 12x12 栅格布局 */
  layout: LayoutItem[]
  components: ComponentDecl[]
  /** 数据源池，key 供组件引用 */
  sources: Record<string, SourceDecl>
  /** 轮询数据源统一刷新间隔兜底（毫秒） */
  refreshInterval?: number
}
