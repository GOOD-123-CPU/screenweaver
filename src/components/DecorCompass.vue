<script setup lang="ts">
/**
 * DecorCompass：纯装饰的旋转罗盘（无数据依赖），适合中空布局的中心点。
 */
withDefaults(defineProps<{ size?: number }>(), { size: 150 })
</script>

<template>
  <div class="sw-compass" :style="{ width: `${size}px`, height: `${size}px` }" aria-hidden="true">
    <svg viewBox="0 0 100 100">
      <g class="spin slow">
        <circle cx="50" cy="50" r="46" fill="none" stroke="var(--sw-panel-border)" stroke-width="1" stroke-dasharray="4 6" />
      </g>
      <g class="spin reverse">
        <circle cx="50" cy="50" r="38" fill="none" stroke="var(--sw-accent)" stroke-width="0.8" stroke-dasharray="30 18 8 18" opacity="0.75" />
      </g>
      <g class="spin slow">
        <path d="M50 14 L54 44 L50 40 L46 44 Z" fill="var(--sw-accent)" opacity="0.9" />
        <path d="M50 86 L54 56 L50 60 L46 56 Z" fill="var(--sw-accent)" opacity="0.4" />
      </g>
      <circle cx="50" cy="50" r="5" fill="none" stroke="var(--sw-accent)" stroke-width="1.2" />
      <circle cx="50" cy="50" r="2" fill="var(--sw-accent)" class="pulse" />
      <slot />
    </svg>
  </div>
</template>

<style scoped>
.sw-compass { margin: 0 auto; }
svg { width: 100%; height: 100%; overflow: visible; }
.spin { transform-origin: 50px 50px; animation: rot 24s linear infinite; }
.reverse { animation-direction: reverse; animation-duration: 15s; }
.slow { animation-duration: 32s; }
.pulse { animation: pulse 2.2s ease-in-out infinite; transform-origin: 50px 50px; }
@keyframes rot { to { transform: rotate(360deg); } }
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.6); }
}
@media (prefers-reduced-motion: reduce) {
  .spin, .pulse { animation: none; }
}
</style>
