import { onScopeDispose, watch, type WatchSource } from 'vue'
import type { Router } from 'vue-router'
import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'

type BackHandler = () => void

const handlers: BackHandler[] = []

function pushBackHandler(handler: BackHandler) {
  handlers.push(handler)
  return () => {
    const index = handlers.lastIndexOf(handler)
    if (index !== -1) handlers.splice(index, 1)
  }
}

export function useBackHandler(isOpen: WatchSource<boolean>, dismiss: BackHandler) {
  let unregister: (() => void) | null = null

  watch(
    isOpen,
    (open) => {
      if (open && !unregister) {
        unregister = pushBackHandler(dismiss)
      } else if (!open && unregister) {
        unregister()
        unregister = null
      }
    },
    { immediate: true },
  )

  onScopeDispose(() => unregister?.())
}

export function initBackButton(router: Router) {
  if (!Capacitor.isNativePlatform()) return

  App.addListener('backButton', () => {
    const handler = handlers[handlers.length - 1]
    if (handler) {
      handler()
      return
    }

    if (window.history.state?.back != null) {
      router.back()
    } else {
      App.exitApp()
    }
  })
}
