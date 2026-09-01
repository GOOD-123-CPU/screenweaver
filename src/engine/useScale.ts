/**
 * 大屏等比缩放适配。
 * 设计稿尺寸固定，运行时按窗口宽高取较小缩放系数，居中显示，
 * 四周留黑边——这是大屏行业最通用的适配策略，纯原创实现。
 */
import { reactive, onMounted, onBeforeUnmount } from 'vue'

export function useScreenScale(designW: number, designH: number) {
  const state = reactive({ scale: 1, offsetX: 0, offsetY: 0 })

  function update() {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const scale = Math.min(vw / designW, vh / designH)
    state.scale = scale
    state.offsetX = (vw - designW * scale) / 2
    state.offsetY = (vh - designH * scale) / 2
  }

  onMounted(() => {
    update()
    window.addEventListener('resize', update)
  })
  onBeforeUnmount(() => window.removeEventListener('resize', update))

  return state
}
