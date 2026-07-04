import { useStorage } from '@vueuse/core'

const translatorUnlocked = useStorage('teso-translator-unlocked', false)

export function useAutoTranslator() {
  function toggle() {
    translatorUnlocked.value = !translatorUnlocked.value
  }
  return { translatorUnlocked, toggle }
}
