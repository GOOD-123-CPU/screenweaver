<script setup lang="ts">
/**
 * PanelBox：带角标装饰的面板容器，几乎所有大屏的视觉骨架。
 * v0.2：标题栏科技感装饰（左侧光柱 + 底部流光线）、悬停微抬升。
 */
defineProps<{
  title?: string
  /** 是否显示角标，默认 true */
  corners?: boolean
}>()
</script>

<template>
  <section class="sw-panel">
    <div v-if="title" class="sw-panel-title">
      <span class="tick" />
      <span class="txt">{{ title }}</span>
      <span class="ribbon"><i class="flow-dot" /></span>
    </div>
    <div class="sw-panel-body">
      <slot />
    </div>
    <i v-if="corners !== false" class="c c-tl" /><i v-if="corners !== false" class="c c-tr" />
    <i v-if="corners !== false" class="c c-bl" /><i v-if="corners !== false" class="c c-br" />
  </section>
</template>

<style scoped>
.sw-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  background:
    linear-gradient(160deg, rgba(255, 255, 255, 0.045), transparent 38%),
    var(--sw-panel);
  border: 1px solid var(--sw-panel-border);
  border-radius: 8px;
  padding: 10px 12px 12px;
  backdrop-filter: blur(4px);
  min-height: 0;
  transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s;
}
.sw-panel:hover {
  border-color: color-mix(in srgb, var(--sw-accent) 55%, var(--sw-panel-border));
  box-shadow: 0 6px 26px color-mix(in srgb, var(--sw-accent) 14%, transparent);
  transform: translateY(-2px);
}
.sw-panel-title {
  flex: none;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.tick {
  width: 4px;
  height: 15px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--sw-accent), color-mix(in srgb, var(--sw-accent) 35%, transparent));
  box-shadow: 0 0 8px var(--sw-accent);
}
.txt {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 2px;
  color: var(--sw-text);
}
.ribbon {
  position: relative;
  flex: 1;
  height: 2px;
  margin-left: 4px;
  background: linear-gradient(90deg, var(--sw-panel-border), transparent 85%);
  overflow: hidden;
}
.flow-dot {
  position: absolute;
  top: 0;
  left: -12%;
  width: 12%;
  height: 100%;
  background: linear-gradient(90deg, transparent, var(--sw-accent));
  animation: flow 3.2s linear infinite;
}
@keyframes flow {
  to { left: 105%; }
}
.sw-panel-body {
  flex: 1;
  min-height: 0;
  position: relative;
}
.c {
  position: absolute;
  width: 11px;
  height: 11px;
  border-color: var(--sw-accent);
  border-style: solid;
  border-width: 0;
  opacity: 0.95;
  filter: drop-shadow(0 0 3px var(--sw-accent));
}
.c-tl { top: -1px; left: -1px; border-top-width: 2px; border-left-width: 2px; border-top-left-radius: 8px; }
.c-tr { top: -1px; right: -1px; border-top-width: 2px; border-right-width: 2px; border-top-right-radius: 8px; }
.c-bl { bottom: -1px; left: -1px; border-bottom-width: 2px; border-left-width: 2px; border-bottom-left-radius: 8px; }
.c-br { bottom: -1px; right: -1px; border-bottom-width: 2px; border-right-width: 2px; border-bottom-right-radius: 8px; }
@media (prefers-reduced-motion: reduce) {
  .flow-dot { animation: none; }
  .sw-panel { transition: none; }
}
</style>
