<script setup lang="ts">
/**
 * MarqueeBar：横向无缝滚动公告/要点跑马灯。
 * props.source -> { items: string[] }
 */
import { computed, inject, ref, watch } from 'vue'
import type { ComponentDecl } from '../engine/schema'
import { useSources } from '../engine/useSources'

const props = defineProps<{ decl: ComponentDecl }>()

const sourceKey = computed(() => String(props.decl.props?.source ?? ''))
const speed = computed(() => Number(props.decl.props?.speed ?? 40)) // px/s
const allSources = inject<ReturnType<typeof useSources>>('sw-sources')!

const items = ref<string[]>([])
watch(
  () => allSources[sourceKey.value]?.updatedAt,
  () => {
    const d = allSources[sourceKey.value]?.data as { items?: string[] } | undefined
    if (d?.items?.length) items.value = d.items
  },
  { immediate: true },
)

/** 每条内容的估宽（字符数 * 16px + 间距），用于计算滚动时长 */
const trackWidth = computed(() => items.value.reduce((s, t) => s + t.length * 16 + 64, 0))
const duration = computed(() => Math.max(12, Math.round(trackWidth.value / Math.max(8, speed.value))))
</script>

<template>
  <div class="sw-marquee">
    <span class="badge">要点</span>
    <div class="window">
      <div class="track" :style="{ animationDuration: `${duration}s` }">
        <span v-for="(t, i) in [...items, ...items]" :key="i" class="item">
          <i class="dot" />{{ t }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sw-marquee {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 100%;
  min-height: 0;
}
.badge {
  flex: none;
  font-size: 11px;
  letter-spacing: 2px;
  color: var(--sw-text);
  background: color-mix(in srgb, var(--sw-accent) 26%, transparent);
  border: 1px solid var(--sw-accent);
  border-radius: 4px;
  padding: 3px 10px;
}
.window {
  flex: 1;
  overflow: hidden;
  min-width: 0;
  mask-image: linear-gradient(90deg, transparent, black 4%, black 96%, transparent);
}
.track {
  display: inline-flex;
  white-space: nowrap;
  animation-name: marquee;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  will-change: transform;
}
@keyframes marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.item {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-right: 64px;
  font-size: 13px;
  color: var(--sw-text);
}
.dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--sw-accent);
  box-shadow: 0 0 6px var(--sw-accent);
}
.track:hover { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) {
  .track { animation: none; }
}
</style>
