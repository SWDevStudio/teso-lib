<template>
  <Teleport to="body">
    <div
      class="modal"
      :class="{ 'modal-open': modelValue }"
      role="dialog"
      aria-modal="true"
      @keydown="onKeydown"
    >
      <div
        ref="box"
        tabindex="-1"
        class="modal-box flex h-dvh max-h-dvh w-full max-w-full flex-col overflow-hidden rounded-none p-0 focus:outline-none sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-box"
      >
        <header
          class="flex shrink-0 items-center justify-between gap-4 border-b border-base-300 bg-base-100 px-4 py-3"
        >
          <h3 class="truncate text-lg font-semibold">{{ title }}</h3>
          <UiButton variant="ghost" icon aria-label="Закрыть" @click="close">
            <UiIcon name="close" :size="22" />
          </UiButton>
        </header>

        <div class="grow overflow-y-auto px-4 py-4">
          <slot />
        </div>

        <footer
          v-if="slots.actions"
          class="flex shrink-0 justify-end gap-2 border-t border-base-300 bg-base-100 px-4 py-3"
        >
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
