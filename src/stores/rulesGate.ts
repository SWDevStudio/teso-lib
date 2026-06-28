import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export const useRulesGateStore = defineStore('rulesGate', () => {
  const seen = useLocalStorage('teso:rules-gate-seen:v1', false)
  const open = ref(false)
  const pendingPath = ref('/rules')

  function request(path: string) {
    pendingPath.value = path
    open.value = true
  }

  function dismiss() {
    open.value = false
  }

  function accept() {
    seen.value = true
    open.value = false
  }

  return { seen, open, pendingPath, request, dismiss, accept }
})
