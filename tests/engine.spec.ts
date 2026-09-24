/**
 * 引擎纯函数单元测试：
 * deepMerge / extractPath / validateSchema / runMock / 注册表。
 */
import { describe, it, expect, vi } from 'vitest'
import { deepMerge } from '../src/engine/chartPresets'
import { extractPath, fetchHttpPayload } from '../src/engine/useSources'
import { validateSchema } from '../src/engine/validate'
import { runMock } from '../src/engine/mock'
import { registry, registerBuiltinComponents } from '../src/engine/registry'

// ---------- deepMerge ----------
describe('deepMerge', () => {
  it('浅层覆盖', () => {
    const out = deepMerge({ a: 1, b: 2 }, { b: 3 })
    expect(out).toEqual({ a: 1, b: 3 })
  })

  it('深层合并而非替换', () => {
    const out = deepMerge(
      { series: [{ areaStyle: { opacity: 0.2 } }] },
      { series: [{ areaStyle: { opacity: 0.5, color: 'red' } }] },
    )
    expect(out.series[0].areaStyle).toEqual({ opacity: 0.5, color: 'red' })
  })

  it('数组整体替换不合并', () => {
    const out = deepMerge({ list: [1, 2, 3] }, { list: [9] })
    expect(out.list).toEqual([9])
  })

  it('patch 为空时返回原对象', () => {
    const base = { a: 1 }
    expect(deepMerge(base, undefined)).toBe(base)
  })

  it('不修改入参', () => {
    const base = { a: { b: 1 } }
    deepMerge(base, { a: { b: 2 } })
    expect(base.a.b).toBe(1)
  })
})

// ---------- extractPath ----------
describe('extractPath', () => {
  const data = { data: { list: [1, 2, 3], meta: { count: 3 } } }

  it('单层路径', () => {
    expect(extractPath(data, 'data')).toBe(data.data)
  })

  it('多层路径', () => {
    expect(extractPath(data, 'data.meta.count')).toBe(3)
  })

  it('路径不存在返回 undefined', () => {
    expect(extractPath(data, 'data.missing.deep')).toBeUndefined()
  })

  it('空路径返回原值', () => {
    expect(extractPath(data, '')).toBe(data)
  })
})

// ---------- fetchHttpPayload ----------
describe('fetchHttpPayload', () => {
  it('检查 HTTP 状态并按 path 提取 payload', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ data: { list: [1, 2, 3] } }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const payload = await fetchHttpPayload({
      type: 'http',
      url: 'https://example.com/data',
      headers: { Authorization: 'Bearer test' },
      path: 'data.list',
    })

    expect(payload).toEqual([1, 2, 3])
    expect(fetchMock).toHaveBeenCalledOnce()
    expect(fetchMock.mock.calls[0][1].headers).toEqual({ Authorization: 'Bearer test' })
    vi.unstubAllGlobals()
  })

  it('请求超过 source timeout 时应主动中止', async () => {
    vi.useFakeTimers()
    const fetchMock = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
      return new Promise((_resolve, reject) => {
        const requestSignal = init?.signal as AbortSignal
        requestSignal.addEventListener(
          'abort',
          () => reject(new DOMException('Aborted', 'AbortError')),
          { once: true },
        )
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    const rejection = expect(fetchHttpPayload({
      type: 'http',
      url: 'https://example.com/slow',
      timeout: 50,
    })).rejects.toThrow('HTTP request timed out after 50ms')

    await vi.advanceTimersByTimeAsync(51)
    await rejection
    expect((fetchMock.mock.calls[0][1].signal as AbortSignal).aborted).toBe(true)

    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('非 2xx 响应应拒绝而不是写入错误 payload', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
      json: async () => ({ message: 'temporary failure' }),
    }))

    await expect(fetchHttpPayload({
      type: 'http',
      url: 'https://example.com/data',
    })).rejects.toThrow('HTTP 503')

    vi.unstubAllGlobals()
  })
})

// ---------- validateSchema ----------
describe('validateSchema', () => {
  const valid = {
    width: 1920,
    height: 1080,
    layout: [{ i: 'a', x: 0, y: 0, w: 4, h: 4 }],
    components: [{ id: 'a', type: 'ChartBox', props: {} }],
    sources: { s: { type: 'static', data: { v: 1 } } },
  }

  it('合法配置通过', () => {
    expect(validateSchema(valid).ok).toBe(true)
  })

  it('根节点非对象', () => {
    const r = validateSchema([1, 2])
    expect(r.ok).toBe(false)
    expect(r.issues[0].path).toBe('')
  })

  it('尺寸越界', () => {
    const r = validateSchema({ ...valid, width: 100 })
    expect(r.ok).toBe(false)
    expect(r.issues.some((i) => i.path === 'width')).toBe(true)
  })

  it('栅格溢出 x+w > 12', () => {
    const r = validateSchema({
      ...valid,
      layout: [{ i: 'a', x: 10, y: 0, w: 5, h: 2 }],
    })
    expect(r.issues.some((i) => i.path === 'layout[0].w' && i.message.includes('超出'))).toBe(true)
  })

  it('layout 引用不存在的组件 id', () => {
    const r = validateSchema({
      ...valid,
      components: [{ id: 'b', type: 'PanelBox' }],
    })
    expect(r.issues.some((i) => i.message.includes('"a" 在 components 中不存在'))).toBe(true)
  })

  it('组件 id 重复', () => {
    const r = validateSchema({
      ...valid,
      components: [
        { id: 'a', type: 'PanelBox' },
        { id: 'a', type: 'ChartBox' },
      ],
    })
    expect(r.issues.some((i) => i.message.includes('重复'))).toBe(true)
  })

  it('不支持的数据源类型', () => {
    const r = validateSchema({
      ...valid,
      sources: { s: { type: 'grpc' } },
    })
    expect(r.issues.some((i) => i.path === 'sources.s.type')).toBe(true)
  })

  it('http 数据源 URL 非法', () => {
    const r = validateSchema({
      ...valid,
      sources: { s: { type: 'http', url: 'ftp://x' } },
    })
    expect(r.issues.some((i) => i.path === 'sources.s.url')).toBe(true)
  })

  it('http timeout 必须在允许范围内', () => {
    const r = validateSchema({
      ...valid,
      sources: { s: { type: 'http', url: 'https://example.com/data', timeout: -1 } },
    })
    expect(r.ok).toBe(false)
    expect(r.issues.some((i) => i.path === 'sources.s.timeout')).toBe(true)
  })

  it('ws 数据源合法', () => {
    const r = validateSchema({
      ...valid,
      sources: { s: { type: 'ws', url: 'wss://example.com/feed' } },
    })
    expect(r.ok).toBe(true)
  })
})

// ---------- runMock ----------
describe('runMock', () => {
  it('trend 返回 categories 与 series 数值', () => {
    const d = runMock('trend', { points: 6 }) as { categories: string[]; series: { values: number[] }[] }
    expect(d.categories).toHaveLength(6)
    expect(d.series[0].values).toHaveLength(6)
    d.series[0].values.forEach((v) => expect(v).toBeGreaterThanOrEqual(0))
  })

  it('ranking 按值降序', () => {
    const d = runMock('ranking', { rows: 8 }) as { rows: { value: number }[] }
    const vals = d.rows.map((r) => r.value)
    expect([...vals].sort((a, b) => b - a)).toEqual(vals)
  })

  it('share 数量受 items 约束', () => {
    const d = runMock('share', { items: 3 }) as { items: unknown[] }
    expect(d.items).toHaveLength(3)
  })

  it('progress 保留配置中的 target', () => {
    const d = runMock('progress', { items: [{ name: 'A', target: 90 }] }) as {
      items: { name: string; target?: number }[]
    }
    expect(d.items[0].name).toBe('A')
    expect(d.items[0].target).toBe(90)
  })

  it('sankey 返回 links 且值有限', () => {
    const d = runMock('sankey') as { links: { value: number }[] }
    expect(d.links.length).toBeGreaterThan(0)
  })

  it('未知生成器返回 null', () => {
    expect(runMock('nope')).toBeNull()
  })
})

// ---------- registry ----------
describe('registry', () => {
  it('注册后可查询，未注册返回 false', () => {
    expect(registry.has('ChartBox')).toBe(false)
    registerBuiltinComponents()
    expect(registry.has('ChartBox')).toBe(true)
    expect(registry.has('PanelBox')).toBe(true)
    expect(registry.has('NotExists')).toBe(false)
  })
})
