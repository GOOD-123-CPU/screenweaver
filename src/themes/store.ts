/**
 * 主题存储：三套原创配色（暗色系），组件通过本模块读取当前主题变量。
 * midnight 墨夜（深蓝黑） / aurora 极光（蓝绿） / ember 烬火（暗红橙）。
 */
import { reactive } from 'vue'

export interface ThemeData {
  id: string
  name: string
  /** 页面背景 */
  pageBg: string
  /** 面板背景 */
  panelBg: string
  /** 面板描边 */
  panelBorder: string
  /** 主文字 */
  text: string
  /** 次级文字（轴标签等） */
  axisLabel: string
  /** 轴线颜色 */
  axisLine: string
  /** 分割线颜色 */
  splitLine: string
  /** tooltip 背景 */
  tooltipBg: string
  /** 主强调色 */
  accent: string
  /** ECharts 调色板 */
  palette: string[]
  /** 面板标题装饰色 */
  titleColor: string
  /** 数字翻牌强调色 */
  numeral: string
}

export const themes: Record<string, ThemeData> = {
  midnight: {
    id: 'midnight',
    name: '墨夜',
    pageBg: 'radial-gradient(ellipse at 50% 0%, #0b1d3a 0%, #060b18 58%, #04060f 100%)',
    panelBg: 'rgba(13, 27, 54, 0.72)',
    panelBorder: 'rgba(64, 128, 220, 0.28)',
    text: '#e8f1ff',
    axisLabel: '#8fa8cf',
    axisLine: 'rgba(110, 150, 210, 0.5)',
    splitLine: 'rgba(90, 130, 190, 0.22)',
    tooltipBg: 'rgba(10, 22, 44, 0.92)',
    accent: '#3f8cff',
    palette: ['#3f8cff', '#25d5c8', '#f5c451', '#ff7a6b', '#9a7bff', '#5ad8a6'],
    titleColor: '#7fb8ff',
    numeral: '#4da2ff',
  },
  aurora: {
    id: 'aurora',
    name: '极光',
    pageBg: 'radial-gradient(ellipse at 50% -10%, #05323b 0%, #041b22 55%, #020f14 100%)',
    panelBg: 'rgba(6, 42, 50, 0.72)',
    panelBorder: 'rgba(45, 190, 170, 0.30)',
    text: '#e6fff8',
    axisLabel: '#8fc9c0',
    axisLine: 'rgba(70, 200, 180, 0.5)',
    splitLine: 'rgba(60, 180, 160, 0.22)',
    tooltipBg: 'rgba(4, 34, 40, 0.92)',
    accent: '#1fd4a7',
    palette: ['#1fd4a7', '#38b6ff', '#c8e86a', '#ff9f6b', '#6be0ff', '#f06eaa'],
    titleColor: '#4fe3c1',
    numeral: '#2fe0b4',
  },
  ember: {
    id: 'ember',
    name: '烬火',
    pageBg: 'radial-gradient(ellipse at 50% -8%, #3a1410 0%, #1c0a08 55%, #100504 100%)',
    panelBg: 'rgba(56, 20, 15, 0.72)',
    panelBorder: 'rgba(230, 120, 70, 0.30)',
    text: '#fff1e8',
    axisLabel: '#d0a08c',
    axisLine: 'rgba(240, 150, 100, 0.5)',
    splitLine: 'rgba(220, 130, 90, 0.22)',
    tooltipBg: 'rgba(46, 16, 12, 0.92)',
    accent: '#ff8a4d',
    palette: ['#ff8a4d', '#ffc94d', '#ff5d6c', '#b98cff', '#5dc4ff', '#7fe07f'],
    titleColor: '#ffb37a',
    numeral: '#ff9a5c',
  },
  daylight: {
    id: 'daylight',
    name: '晨光',
    pageBg: 'linear-gradient(180deg, #f3f6fb 0%, #e8edf5 100%)',
    panelBg: 'rgba(255, 255, 255, 0.88)',
    panelBorder: 'rgba(70, 110, 170, 0.22)',
    text: '#1c2b45',
    axisLabel: '#5d7398',
    axisLine: 'rgba(90, 120, 165, 0.45)',
    splitLine: 'rgba(90, 120, 165, 0.18)',
    tooltipBg: 'rgba(255, 255, 255, 0.96)',
    accent: '#2563eb',
    palette: ['#2563eb', '#0d9488', '#d97706', '#dc2626', '#7c3aed', '#059669'],
    titleColor: '#1d4ed8',
    numeral: '#1e5fd0',
  },
}

export const themeStore = reactive({
  current: themes.midnight,
  set(id: string) {
    this.current = themes[id] ?? themes.midnight
  },
})

export function useThemeStore() {
  return themeStore.current
}
