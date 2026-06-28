import { useStorage } from '@vueuse/core'

const translatorUnlocked = useStorage('teso-translator-unlocked', false)

export function useAutoTranslator() {
  function unlock() {
    translatorUnlocked.value = true
  }
  return { translatorUnlocked, unlock }
}
