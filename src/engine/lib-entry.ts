/**
 * 引擎库统一出口：npm 包使用方从这里导入全部公开 API。
 */
export type {
  ScreenSchema,
  LayoutItem,
  ComponentDecl,
  SourceDecl,
  StaticSource,
  PollingSource,
  MockSource,
  WsSource,
} from './schema'
export { registry, registerComponent, registerBuiltinComponents } from './registry'
export { useScreenScale } from './useScale'
export { useSources, extractPath } from './useSources'
export type { DataSource } from './useSources'
export { runMock } from './mock'
export { buildOption, deepMerge } from './chartPresets'
export { validateSchema, asSchema } from './validate'
export type { ValidationIssue, ValidationResult } from './validate'
export { themes, themeStore, useThemeStore } from '../themes/store'
export type { ThemeData } from '../themes/store'
