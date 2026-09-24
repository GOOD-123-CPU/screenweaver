/**
 * 数据源管理：把 schema.sources 声明解析成响应式数据流。
 * 支持 static / http(轮询) / mock / websocket，组件通过 key 订阅。
 */
import { reactive, onBeforeUnmount } from 'vue'
import type { ScreenSchema, SourceDecl } from './schema'
import { runMock } from './mock'

export type DataSource = {
  data: unknown
  /** 最近一次刷新时间戳 */
  updatedAt: number
}

type Timer = ReturnType<typeof setInterval>

/** WebSocket 数据源连接选项 */
export interface WsHandle {
  close: () => void
}

/**
 * 按点分路径从对象中取值，如 extractPath(res, "data.list")。
 * 纯函数，供 http / websocket 数据源共用。
 */
export function extractPath(payload: unknown, path: string): unknown {
  if (!path) return payload
  let cur = payload
  for (const seg of path.split('.')) {
    if (cur && typeof cur === 'object' && seg in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[seg]
    } else {
      return undefined
    }
  }
  return cur
}

/**
 * 执行一次 HTTP 数据源请求。
 * - 非 2xx 状态视为失败，不把错误页/错误 JSON 写入数据源；
 * - 支持 AbortSignal，便于组件卸载时取消未完成请求；
 * - path 提取与 WebSocket 数据源保持一致。
 */
export async function fetchHttpPayload(
  src: Extract<SourceDecl, { type: 'http' }>,
  signal?: AbortSignal,
): Promise<unknown> {
  const res = await fetch(src.url, { headers: src.headers, signal })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText || 'request failed'}`)
  }

  let payload: unknown = await res.json()
  if (src.path) payload = extractPath(payload, src.path)
  return payload
}

export function useSources(schema: ScreenSchema) {
  const store = reactive<Record<string, DataSource>>({})
  const timers: Timer[] = []
  const httpControllers = new Map<string, AbortController>()

  function set(key: string, data: unknown) {
    store[key] = { data, updatedAt: Date.now() }
  }

  async function fetchOne(key: string, src: Extract<SourceDecl, { type: 'http' }>) {
    // 上一轮请求仍未完成时跳过本轮，避免慢接口造成轮询请求堆积。
    if (httpControllers.has(key)) return

    const controller = new AbortController()
    httpControllers.set(key, controller)

    try {
      const payload = await fetchHttpPayload(src, controller.signal)
      set(key, payload)
    } catch (e) {
      if (controller.signal.aborted) return
      console.warn(`[screenweaver] source "${key}" fetch failed`, e)
    } finally {
      if (httpControllers.get(key) === controller) {
        httpControllers.delete(key)
      }
    }
  }

  /** WebSocket 连接池，组件卸载时统一关闭 */
  const sockets: WsHandle[] = []

  function connectWs(key: string, src: Extract<SourceDecl, { type: 'ws' }>) {
    let ws: WebSocket | null = null
    let retry = 0
    let closed = false
    const maxDelay = 30_000

    const open = () => {
      if (closed) return
      try {
        ws = new WebSocket(src.url)
      } catch {
        scheduleReconnect()
        return
      }
      ws.onmessage = (ev) => {
        try {
          let payload: unknown = JSON.parse(ev.data as string)
          if (src.path) payload = extractPath(payload, src.path)
          set(key, payload)
        } catch {
          console.warn(`[screenweaver] ws source "${key}" received non-JSON message`)
        }
      }
      ws.onopen = () => {
        retry = 0
      }
      ws.onclose = () => scheduleReconnect()
      ws.onerror = () => ws?.close()
    }

    const scheduleReconnect = () => {
      if (closed) return
      const delay = Math.min(maxDelay, 1000 * 2 ** retry)
      retry += 1
      setTimeout(() => {
        if (!closed) open()
      }, delay)
    }

    open()
    sockets.push({
      close: () => {
        closed = true
        ws?.close()
      },
    })
  }

  function activate(key: string, src: SourceDecl) {
    switch (src.type) {
      case 'static':
        set(key, src.data)
        break
      case 'mock': {
        set(key, runMock(src.generator, src.params))
        const ms = src.interval ?? 5000
        if (ms > 0) {
          timers.push(setInterval(() => set(key, runMock(src.generator, src.params)), ms))
        }
        break
      }
      case 'http': {
        void fetchOne(key, src)
        const ms = src.interval ?? schema.refreshInterval ?? 5000
        if (ms > 0) {
          timers.push(setInterval(() => void fetchOne(key, src), ms))
        }
        break
      }
      case 'ws': {
        connectWs(key, src)
        break
      }
    }
  }

  for (const [key, src] of Object.entries(schema.sources)) {
    activate(key, src)
  }

  onBeforeUnmount(() => {
    timers.forEach(clearInterval)
    httpControllers.forEach((controller) => controller.abort())
    httpControllers.clear()
    sockets.forEach((s) => s.close())
  })

  return store
}
