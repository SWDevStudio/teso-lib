<template>
  <Teleport to="body">
    <div
      class="modal"
      :class="{ 'modal-open': modelValue }"
      role="dialog"
      aria-modal="true"
      @keydown="onKeydown"
    >
      <div ref="box" tabindex="-1" class="modal-box max-h-[85vh] focus:outline-none">
        <header v-if="title || slots.header" class="mb-4 flex items-start justify-between gap-4">
          <h3 class="text-lg font-semibold">{{ title }}</h3>
          <UiButton variant="ghost" icon aria-label="Закрыть" @click="close">
            <UiIcon name="close" :size="22" />
          </UiButton>
        </header>
        <slot />
        <footer v-if="slots.actions" class="modal-action">
          <slot name="actions" />
        </footer>
      </div>
      <button type="button" class="modal-backdrop" aria-label="Закрыть" @click="close" />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { nextTick, ref, useSlots, watch } from 'vue'
import UiButton from './UiButton.vue'
import UiIcon from './UiIcon.vue'

const props = defineProps<{
  modelValue: boolean
  title?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const slots = useSlots()

const box = ref<HTMLElement | null>(null)
let previouslyFocused: HTMLElement | null = null

function close() {
  emit('update:modelValue', false)
}

function focusableElements(): HTMLElement[] {
  if (!box.value) return []
  const selector =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  return Array.from(box.value.querySelectorAll<HTMLElement>(selector)).filter(
    (element) => element.offsetParent !== null,
  )
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    close()
    return
  }
  if (event.key !== 'Tab') return
  const elements = focusableElements()
  const first = elements[0]
  const last = elements[elements.length - 1]
  if (!first || !last) {
    event.preventDefault()
    box.value?.focus()
    return
  }
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(
  () => props.modelValue,
  async (open) => {
    if (open) {
      previouslyFocused = document.activeElement as HTMLElement | null
      await nextTick()
      const elements = focusableElements()
      ;(elements[0] ?? box.value)?.focus()
    } else if (previouslyFocused) {
      previouslyFocused.focus()
      previouslyFocused = null
    }
  },
)
</script>
