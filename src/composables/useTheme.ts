import { useStorage } from '@vueuse/core'
import { watch } from 'vue'

export type ThemeName = 'elderscrolls' | 'parchment'

export const themeOptions: { value: ThemeName; label: string }[] = [
  { value: 'elderscrolls', label: 'Древний фолиант' },
  { value: 'parchment', label: 'Пергамент' },
]

const theme = useStorage<ThemeName>('teso-theme', 'parchment')

watch(
  theme,
  (value) => {
    document.documentElement.dataset.theme = value
  },
  { immediate: true },
)

export function useTheme() {
  return { theme, themeOptions }
}
