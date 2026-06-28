import { ref } from 'vue'

export interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
  hideCancel?: boolean
}

const isOpen = ref(false)
const options = ref<ConfirmOptions>({ message: '' })
let resolver: ((value: boolean) => void) | null = null

function respond(value: boolean) {
  isOpen.value = false
  resolver?.(value)
  resolver = null
}

export function useConfirm() {
  function confirm(opts: ConfirmOptions): Promise<boolean> {
    options.value = opts
    isOpen.value = true
    return new Promise((resolve) => {
      resolver = resolve
    })
  }
  return { confirm }
}

export function useConfirmHost() {
  return { isOpen, options, respond }
}
