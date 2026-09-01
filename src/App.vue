<script setup lang="ts">
/**
 * App：大屏选择页 + 大屏渲染容器。
 * 通过 ?screen=<名称> 加载 /configs/<名称>.json。
 */
import { onMounted, ref, shallowRef } from 'vue'
import ScreenRenderer from './ScreenRenderer.vue'
import ThemeProvider from './themes/ThemeProvider.vue'
import { validateSchema } from './engine/validate'
import type { ScreenSchema } from './engine/schema'

const screens = [
  { id: 'city-ops', name: '城市运行监测', desc: '交通 · 环境 · 事件处置', theme: 'midnight' },
  { id: 'sales-board', name: '销售运营看板', desc: '业绩 · 渠道 · 排行', theme: 'ember' },
  { id: 'energy-iot', name: '能源物联网监测', desc: '站点 · 设备 · 负荷', theme: 'aurora' },
]

const current = shallowRef<ScreenSchema | null>(null)
const error = ref('')
const loading = ref(false)

async function open(id: string) {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch(`configs/${id}.json`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const raw: unknown = await res.json()
    const check = validateSchema(raw)
    if (!check.ok) {
      const first = check.issues
        .slice(0, 4)
        .map((i) => `${i.path || '(root)'}: ${i.message}`)
        .join('；')
      throw new Error(`配置校验失败（${check.issues.length} 处）—— ${first}`)
    }
    current.value = raw as ScreenSchema
    history.replaceState(null, '', `?screen=${id}`)
  } catch (e) {
    error.value = `加载失败：${(e as Error).message}`
  } finally {
    loading.value = false
  }
}

function back() {
  current.value = null
  history.replaceState(null, '', location.pathname)
}

onMounted(() => {
  const id = new URLSearchParams(location.search).get('screen')
  if (id) void open(id)
})
</script>

<template>
  <ThemeProvider v-if="current">
    <ScreenRenderer :schema="current" />
    <button class="back-btn" @click="back">← 返回选择</button>
  </ThemeProvider>

  <div v-else class="picker">
    <div class="picker-inner">
      <header>
        <h1>ScreenWeaver <span>织屏</span></h1>
        <p>配置驱动的大屏可视化引擎 · 用一份 JSON 描述一块大屏</p>
      </header>
      <p v-if="error" class="err">{{ error }}</p>
      <p v-if="loading" class="hint">正在加载…</p>
      <div class="cards">
        <button v-for="s in screens" :key="s.id" class="card" @click="open(s.id)">
          <span class="swatch" :data-theme="s.theme" />
          <b>{{ s.name }}</b>
          <i>{{ s.desc }}</i>
        </button>
      </div>
      <footer>
        用法：<code>?screen=配置文件名</code> · 也可以把你的 JSON 放进 <code>public/configs/</code>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.picker {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  background: radial-gradient(ellipse at 50% -10%, #0b1d3a 0%, #060b18 58%, #04060f 100%);
  color: #e8f1ff;
}
.picker-inner { text-align: center; padding: 24px; }
h1 { font-size: 40px; letter-spacing: 4px; margin: 0; font-weight: 700; }
h1 span {
  background: linear-gradient(120deg, #3f8cff, #25d5c8);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.picker-inner > header p { color: #8fa8cf; letter-spacing: 2px; margin: 8px 0 0; }
.cards { display: flex; gap: 18px; margin: 36px 0 24px; justify-content: center; flex-wrap: wrap; }
.card {
  width: 220px;
  padding: 22px 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  background: rgba(13, 27, 54, 0.72);
  border: 1px solid rgba(64, 128, 220, 0.28);
  border-radius: 10px;
  color: inherit;
  cursor: pointer;
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
}
.card:hover {
  transform: translateY(-4px);
  border-color: #3f8cff;
  box-shadow: 0 8px 30px rgba(63, 140, 255, 0.25);
}
.card b { font-size: 17px; letter-spacing: 2px; }
.card i { font-style: normal; font-size: 12px; color: #8fa8cf; }
.swatch { width: 44px; height: 44px; border-radius: 50%; margin-bottom: 6px; }
.swatch[data-theme='midnight'] { background: radial-gradient(circle at 35% 30%, #3f8cff, #0b1d3a 70%); }
.swatch[data-theme='aurora'] { background: radial-gradient(circle at 35% 30%, #1fd4a7, #05323b 70%); }
.swatch[data-theme='ember'] { background: radial-gradient(circle at 35% 30%, #ff8a4d, #3a1410 70%); }
.err { color: #ff7a6b; }
.hint { color: #8fa8cf; }
footer { font-size: 12px; color: #8fa8cf; }
footer code { background: rgba(255, 255, 255, 0.06); padding: 2px 6px; border-radius: 4px; }
.back-btn {
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 10;
  padding: 6px 14px;
  font-size: 12px;
  color: #8fa8cf;
  background: rgba(13, 27, 54, 0.8);
  border: 1px solid rgba(64, 128, 220, 0.35);
  border-radius: 6px;
  cursor: pointer;
}
.back-btn:hover { color: #e8f1ff; border-color: #3f8cff; }
</style>
