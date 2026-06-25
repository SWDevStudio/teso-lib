import { ref } from 'vue'

export function useRuleToggle() {
  const openIds = ref(new Set<string>())

  function onToggle(id: string, event: Event) {
    if (!(event.target instanceof HTMLDetailsElement)) return
    const next = new Set(openIds.value)
    if (event.target.open) next.add(id)
    else next.delete(id)
    openIds.value = next
  }

  return { openIds, onToggle }
}
