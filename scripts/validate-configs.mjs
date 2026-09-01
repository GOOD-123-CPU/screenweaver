#!/usr/bin/env node
/**
 * 批量校验 public/configs 下所有大屏 JSON。
 * 用法：npm run check:configs
 * 退出码：0 = 全部通过，1 = 存在非法配置（可直接挂进 CI）。
 * 校验逻辑与引擎运行时使用同一套规则（内联实现，脚本环境零依赖）。
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const dir = join(here, '..', 'public', 'configs')
const GRID = 12
let failed = 0

function isObj(v) {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function validate(data) {
  const issues = []
  if (!isObj(data)) return [{ path: '', message: '根节点必须是对象' }]

  for (const k of ['width', 'height']) {
    const v = data[k]
    if (typeof v !== 'number' || v < 320 || v > 8192) {
      issues.push({ path: k, message: `应为 320~8192 的数字，实际 ${JSON.stringify(v)}` })
    }
  }

  if (!Array.isArray(data.layout) || data.layout.length === 0) {
    issues.push({ path: 'layout', message: '必须是非空数组' })
  } else {
    const seen = new Set()
    data.layout.forEach((item, i) => {
      const p = `layout[${i}]`
      if (!isObj(item) || typeof item.i !== 'string' || !item.i) {
        issues.push({ path: `${p}.i`, message: '必须是非空字符串' })
        return
      }
      if (seen.has(item.i)) issues.push({ path: `${p}.i`, message: `id "${item.i}" 重复` })
      seen.add(item.i)
      for (const [k, min, max] of [['x', 0, 11], ['y', 0, 11], ['w', 1, 12], ['h', 1, 12]]) {
        const v = item[k]
        if (typeof v !== 'number' || v < min || v > max) {
          issues.push({ path: `${p}.${k}`, message: `应为 ${min}~${max}，实际 ${JSON.stringify(v)}` })
        }
      }
      if (typeof item.x === 'number' && typeof item.w === 'number' && item.x + item.w > GRID) {
        issues.push({ path: `${p}.w`, message: `x+w 超出栅格` })
      }
      if (typeof item.y === 'number' && typeof item.h === 'number' && item.y + item.h > GRID) {
        issues.push({ path: `${p}.h`, message: `y+h 超出栅格` })
      }
    })
  }

  if (!Array.isArray(data.components) || data.components.length === 0) {
    issues.push({ path: 'components', message: '必须是非空数组' })
  } else {
    const compIds = new Set()
    data.components.forEach((c, i) => {
      if (!isObj(c) || typeof c.id !== 'string' || !c.id || typeof c.type !== 'string' || !c.type) {
        issues.push({ path: `components[${i}]`, message: '必须有非空的 id 与 type' })
      } else {
        compIds.add(c.id)
      }
    })
    if (Array.isArray(data.layout)) {
      data.layout.forEach((item, i) => {
        if (isObj(item) && typeof item.i === 'string' && !compIds.has(item.i)) {
          issues.push({ path: `layout[${i}].i`, message: `引用的组件 "${item.i}" 不存在` })
        }
      })
    }
  }

  if (!isObj(data.sources)) {
    issues.push({ path: 'sources', message: '必须是对象' })
  } else {
    for (const [key, src] of Object.entries(data.sources)) {
      if (!isObj(src)) {
        issues.push({ path: `sources.${key}`, message: '必须是对象' })
        continue
      }
      if (src.type === 'static') {
        if (!('data' in src)) issues.push({ path: `sources.${key}.data`, message: '缺少 data' })
      } else if (src.type === 'http' || src.type === 'ws') {
        if (typeof src.url !== 'string' || !/^(wss?|https?):\/\//.test(src.url)) {
          issues.push({ path: `sources.${key}.url`, message: 'URL 非法' })
        }
      } else if (src.type === 'mock') {
        if (typeof src.generator !== 'string' || !src.generator) {
          issues.push({ path: `sources.${key}.generator`, message: '缺少 generator' })
        }
      } else {
        issues.push({ path: `sources.${key}.type`, message: `不支持：${JSON.stringify(src.type)}` })
      }
    }
  }
  return issues
}

const files = readdirSync(dir).filter((f) => f.endsWith('.json'))
for (const f of files) {
  const raw = readFileSync(join(dir, f), 'utf8')
  let data
  try {
    data = JSON.parse(raw)
  } catch (e) {
    console.error(`✗ ${f}  JSON 解析失败：${e.message}`)
    failed++
    continue
  }
  const issues = validate(data)
  if (issues.length === 0) {
    console.log(`✓ ${f}`)
  } else {
    failed++
    console.error(`✗ ${f}`)
    for (const i of issues) console.error(`    ${i.path || '(root)'}: ${i.message}`)
  }
}

if (files.length === 0) {
  console.log('（configs 目录为空）')
}
process.exit(failed > 0 ? 1 : 0)
