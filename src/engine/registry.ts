/**
 * 组件注册表：内置组件 + 用户自定义组件统一入口。
 * 注册表模式让"配置里的 type 字符串"与"Vue 组件"解耦。
 */
import type { Component } from 'vue'
import PanelBox from '../components/PanelBox.vue'
import ChartBox from '../components/ChartBox.vue'
import DigitalFlop from '../components/DigitalFlop.vue'
import ScrollTable from '../components/ScrollTable.vue'
import TimeDisplay from '../components/TimeDisplay.vue'
import RankList from '../components/RankList.vue'
import GaugeCluster from '../components/GaugeCluster.vue'
import StatusGrid from '../components/StatusGrid.vue'
import MarqueeBar from '../components/MarqueeBar.vue'
import ProgressGroup from '../components/ProgressGroup.vue'
import DecorCompass from '../components/DecorCompass.vue'

export const registry = new Map<string, Component>()

export function registerComponent(type: string, comp: Component) {
  registry.set(type, comp)
}

/** 内置组件注册（导出以便按需裁剪） */
export function registerBuiltinComponents() {
  registerComponent('PanelBox', PanelBox)
  registerComponent('ChartBox', ChartBox)
  registerComponent('DigitalFlop', DigitalFlop)
  registerComponent('ScrollTable', ScrollTable)
  registerComponent('TimeDisplay', TimeDisplay)
  registerComponent('RankList', RankList)
  registerComponent('GaugeCluster', GaugeCluster)
  registerComponent('StatusGrid', StatusGrid)
  registerComponent('MarqueeBar', MarqueeBar)
  registerComponent('ProgressGroup', ProgressGroup)
  registerComponent('DecorCompass', DecorCompass)
}
