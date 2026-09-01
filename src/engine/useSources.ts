/**
 * 数据源管理：把 schema.sources 声明解析成响应式数据流。
 * 支持 static / http(轮询) / mock(内置模拟器) 三种，组件通过 key 订阅。
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

export function useSources(schema: ScreenSchema) {
  const store = reactive<Record<string, DataSource>>({})
  const timers: Timer[] = []

  function set(key: string, data: unknown) {
    store[key] = { data, updatedAt: Date.now() }
  }

  async function fetchOne(key: string, src: Extract<SourceDecl, { type: 'http' }>) {
    try {
      const res = await fetch(src.url, { headers: src.headers })
      let payload: unknown = await res.json()
      if (src.path) payload = extractPath(payload, src.path)
      set(key, payload)
    } catch (e) {
      console.warn(`[screenweaver] source "${key}" fetch failed`, e)
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
      } catch (e) {
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
          timers.push(setInterval(() => fetchOne(key, src), ms))
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
    sockets.forEach((s) => s.close())
  })

  return store
}
