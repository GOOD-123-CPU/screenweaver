<script setup lang="ts">
/**
 * ScreenWeaver 渲染根组件：
 * 解析 schema -> 数据源池 -> 栅格布局 -> 逐格渲染注册组件。
 * v0.2：科技感 Header、装饰层（网格/扫描带/角落光晕）、面板交错入场。
 */
import { computed, provide } from 'vue'
import type { ScreenSchema } from './engine/schema'
import { useScreenScale } from './engine/useScale'
import { useSources } from './engine/useSources'
import { registry } from './engine/registry'
import { themeStore } from './themes/store'

const props = defineProps<{ schema: ScreenSchema }>()

const scale = useScreenScale(props.schema.width, props.schema.height)
const sources = useSources(props.schema)

provide('sw-sources', sources)
provide('sw-width', props.schema.width)

if (props.schema.theme) themeStore.set(props.schema.theme)

const header = computed(() => props.schema.header)
const rootStyle = computed(() => ({
  width: `${props.schema.width}px`,
  height: `${props.schema.height}px`,
  transform: `translate(${scale.offsetX}px, ${scale.offsetY}px) scale(${scale.scale})`,
  background: themeStore.current.pageBg,
}))

/** 组件 id -> 面板标题的映射，供布局空位提示与入场排序 */
const compById = computed(() => Object.fromEntries(props.schema.components.map((c) => [c.id, c])))
</script>

<template>
  <div class="sw-viewport">
    <div class="sw-screen" :style="rootStyle">
      <!-- 装饰层：网格 / 角落光晕 / 扫描光带 -->
      <div class="deco-grid" aria-hidden="true" />
      <div class="deco-glow glow-tl" aria-hidden="true" />
      <div class="deco-glow glow-br" aria-hidden="true" />
      <div class="deco-scan" aria-hidden="true" />

      <header v-if="header" class="sw-header">
        <div class="hdr-wing left" aria-hidden="true">
          <i class="wing-bar" /><i class="wing-bar" /><i class="wing-bar short" />
        </div>
        <div class="hdr-core">
          <h1>{{ header.title }}</h1>
          <p v-if="header.subtitle">{{ header.subtitle }}</p>
        </div>
        <div class="hdr-wing right" aria-hidden="true">
          <i class="wing-bar short" /><i class="wing-bar" /><i class="wing-bar" />
        </div>
        <TimeDisplay v-if="header.clock !== false" />
      </header>

      <div class="sw-grid">
        <div
          v-for="(cell, idx) in schema.layout"
          :key="cell.i"
          class="sw-cell"
          :style="{
            gridColumn: `${cell.x + 1} / span ${cell.w}`,
            gridRow: `${cell.y + 1} / span ${cell.h}`,
          }"
        >
          <template v-for="c in schema.components" :key="c.id">
            <div
              v-if="c.id === cell.i && registry.has(c.type)"
              class="cell-enter"
              :style="{ animationDelay: `${Math.min(idx * 70, 900)}ms` }"
            >
              <component :is="registry.get(c.type)" :decl="c" />
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sw-viewport {
  position: fixed;
  inset: 0;
  overflow: hidden;
  background: #020409;
}
.sw-screen {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: 0 0;
  display: flex;
  flex-direction: column;
  padding: 0 24px 24px;
}

/* ---------- 装饰层 ---------- */
.deco-grid,
.deco-glow,
.deco-scan {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.deco-grid {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.028) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.028) 1px, transparent 1px);
  background-size: 44px 44px;
  mask-image: radial-gradient(ellipse at 50% 40%, black 30%, transparent 78%);
}
.deco-glow {
  width: 46vw;
  height: 30vh;
  inset: auto;
  filter: blur(70px);
  opacity: 0.30;
}
.glow-tl { top: -12vh; left: -8vw; background: var(--sw-accent); }
.glow-br { bottom: -12vh; right: -8vw; background: var(--sw-accent); opacity: 0.18; }
.deco-scan {
  inset: auto 0;
  height: 180px;
  background: linear-gradient(180deg, transparent, color-mix(in srgb, var(--sw-accent) 7%, transparent), transparent);
  animation: scan-move 14s linear infinite;
}
@keyframes scan-move {
  0% { transform: translateY(-200px); }
  100% { transform: translateY(calc(100vh + 60px)); }
}

/* ---------- Header ---------- */
.sw-header {
  position: relative;
  flex: none;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: end;
  padding: 18px 0 14px;
  z-index: 2;
}
.hdr-core { text-align: center; }
.sw-header h1 {
  margin: 0;
  font-size: 34px;
  letter-spacing: 8px;
  font-weight: 700;
  color: var(--sw-text);
  background: linear-gradient(180deg, #ffffff 18%, var(--sw-title) 88%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 14px color-mix(in srgb, var(--sw-title) 45%, transparent));
}
.sw-header p {
  margin: 5px 0 0;
  font-size: 12px;
  letter-spacing: 3px;
  color: var(--sw-axis);
}
.hdr-wing {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding-bottom: 10px;
}
.hdr-wing.right { justify-content: flex-end; }
.wing-bar {
  width: 90px;
  height: 8px;
  background: linear-gradient(90deg, transparent, var(--sw-accent));
  clip-path: polygon(0 45%, 100% 0, 100% 100%, 0 100%);
  opacity: 0.75;
}
.hdr-wing.left .wing-bar:first-child { width: 56px; opacity: 0.4; }
.hdr-wing.right .wing-bar {
  background: linear-gradient(270deg, transparent, var(--sw-accent));
  clip-path: polygon(0 0, 100% 45%, 100% 100%, 0 100%);
}
.hdr-wing.right .wing-bar:last-child { width: 56px; opacity: 0.4; }
.wing-bar.short { width: 40px; opacity: 0.55; }

/* ---------- 栅格 ---------- */
.sw-grid {
  flex: 1;
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: repeat(12, 1fr);
  gap: 14px;
  min-height: 0;
  z-index: 1;
}
.sw-cell {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.sw-cell > * {
  flex: 1;
  min-height: 0;
}
.cell-enter {
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1;
  animation: cell-in 0.65s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes cell-in {
  from { opacity: 0; transform: translateY(26px) scale(0.985); filter: blur(3px); }
  to { opacity: 1; transform: none; filter: none; }
}
@media (prefers-reduced-motion: reduce) {
  .cell-enter, .deco-scan { animation: none; }
}
</style>
