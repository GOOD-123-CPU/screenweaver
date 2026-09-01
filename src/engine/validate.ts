/**
 * Schema 运行时校验器：零依赖，错误信息精确到字段路径。
 * 用途：开发期 console 提示、CI 中 scripts/validate-configs.mjs 批量校验、
 * 第三方集成时对动态 JSON 做门禁。
 */
import type { ScreenSchema } from './schema'

export interface ValidationIssue {
  /** 字段路径，如 layout[3].w */
  path: string
  message: string
}

export interface ValidationResult {
  ok: boolean
  issues: ValidationIssue[]
}

const GRID = 12

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function checkRange(
  issues: ValidationIssue[],
  path: string,
  v: unknown,
  min: number,
  max: number,
): v is number {
  if (typeof v !== 'number' || !Number.isFinite(v) || v < min || v > max) {
    issues.push({ path, message: `应为 ${min}~${max} 的数字，实际 ${JSON.stringify(v)}` })
    return false
  }
  return true
}

/**
 * 校验一份大屏配置。
 * @param data 任意 JSON（如 fetch 得到的 unknown）
 */
export function validateSchema(data: unknown): ValidationResult {
  const issues: ValidationIssue[] = []
  const root = data

  if (!isObj(root)) {
    return { ok: false, issues: [{ path: '', message: '配置根节点必须是对象' }] }
  }

  // ---- 尺寸 ----
  checkRange(issues, 'width', root.width, 320, 8192)
  checkRange(issues, 'height', root.height, 240, 8192)

  // ---- 主题（可选）----
  if (root.theme != null && typeof root.theme !== 'string') {
    issues.push({ path: 'theme', message: '必须是字符串' })
  }

  // ---- header（可选）----
  if (root.header != null) {
    if (!isObj(root.header)) {
      issues.push({ path: 'header', message: '必须是对象' })
    } else if (typeof root.header.title !== 'string' || !root.header.title) {
      issues.push({ path: 'header.title', message: '必须是非空字符串' })
    }
  }

  // ---- layout ----
  if (!Array.isArray(root.layout) || root.layout.length === 0) {
    issues.push({ path: 'layout', message: '必须是非空数组' })
  } else {
    const seen = new Set<string>()
    root.layout.forEach((item, i) => {
      const p = `layout[${i}]`
      if (!isObj(item)) {
        issues.push({ path: p, message: '必须是对象' })
        return
      }
      if (typeof item.i !== 'string' || !item.i) {
        issues.push({ path: `${p}.i`, message: '必须是非空字符串（组件 id）' })
        return
      }
      if (seen.has(item.i)) {
        issues.push({ path: `${p}.i`, message: `组件 id "${item.i}" 在 layout 中重复` })
      }
      seen.add(item.i)
      checkRange(issues, `${p}.x`, item.x, 0, GRID - 1)
      checkRange(issues, `${p}.y`, item.y, 0, GRID - 1)
      checkRange(issues, `${p}.w`, item.w, 1, GRID)
      checkRange(issues, `${p}.h`, item.h, 1, GRID)
      if (typeof item.x === 'number' && typeof item.w === 'number' && item.x + item.w > GRID) {
        issues.push({ path: `${p}.w`, message: `x + w 超出 12 列栅格（${item.x}+${item.w}）` })
      }
      if (typeof item.y === 'number' && typeof item.h === 'number' && item.y + item.h > GRID) {
        issues.push({ path: `${p}.h`, message: `y + h 超出 12 行栅格（${item.y}+${item.h}）` })
      }
    })
  }

  // ---- components ----
  if (!Array.isArray(root.components) || root.components.length === 0) {
    issues.push({ path: 'components', message: '必须是非空数组' })
  } else {
    const seen = new Set<string>()
    root.components.forEach((c, i) => {
      const p = `components[${i}]`
      if (!isObj(c)) {
        issues.push({ path: p, message: '必须是对象' })
        return
      }
      if (typeof c.id !== 'string' || !c.id) {
        issues.push({ path: `${p}.id`, message: '必须是非空字符串' })
      } else if (seen.has(c.id)) {
        issues.push({ path: `${p}.id`, message: `组件 id "${c.id}" 重复` })
      } else {
        seen.add(c.id)
      }
      if (typeof c.type !== 'string' || !c.type) {
        issues.push({ path: `${p}.type`, message: '必须是非空字符串（注册表组件名）' })
      }
    })
  }

  // layout 引用完整性
  if (Array.isArray(root.layout) && Array.isArray(root.components)) {
    const compIds = new Set(
      root.components.filter(isObj).map((c) => c.id).filter((v): v is string => typeof v === 'string'),
    )
    root.layout.forEach((item, i) => {
      if (isObj(item) && typeof item.i === 'string' && !compIds.has(item.i)) {
        issues.push({
          path: `layout[${i}].i`,
          message: `引用的组件 id "${item.i}" 在 components 中不存在`,
        })
      }
    })
  }

  // ---- sources ----
  if (!isObj(root.sources)) {
    issues.push({ path: 'sources', message: '必须是对象（key -> 数据源）' })
  } else {
    for (const [key, src] of Object.entries(root.sources)) {
      const p = `sources.${key}`
      if (!isObj(src)) {
        issues.push({ path: p, message: '必须是对象' })
        continue
      }
      const type = src.type
      if (type === 'static') {
        if (!('data' in src)) issues.push({ path: `${p}.data`, message: 'static 数据源必须包含 data 字段' })
      } else if (type === 'http' || type === 'ws') {
        if (typeof src.url !== 'string' || !/^wss?:\/\/|^https?:\/\//.test(src.url)) {
          issues.push({ path: `${p}.url`, message: `${type} 数据源必须是合法的 ${type === 'ws' ? 'ws(s)' : 'http(s)'} URL` })
        }
        if (type === 'http' && src.interval != null) {
          checkRange(issues, `${p}.interval`, src.interval, 0, 86_400_000)
        }
      } else if (type === 'mock') {
        if (typeof src.generator !== 'string' || !src.generator) {
          issues.push({ path: `${p}.generator`, message: 'mock 数据源必须指定 generator 名称' })
        }
      } else {
        issues.push({ path: `${p}.type`, message: `不支持的数据源类型：${JSON.stringify(type)}` })
      }
    }
  }

  return { ok: issues.length === 0, issues }
}

/** 类型收窄：校验通过后把 unknown 断言为 ScreenSchema */
export function asSchema(data: unknown): ScreenSchema | null {
  return validateSchema(data).ok ? (data as ScreenSchema) : null
}
