import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Capacitor } from '@capacitor/core'

import App from './App.vue'
import router from './router'
import { initDb } from './db'
import { initBackButton } from './composables/useBackButton'

async function bootstrap() {
  // На web SQLite работает через web-компонент jeep-sqlite (sql.js + IndexedDB).
  // На Android/iOS используется нативный плагин — этот шаг не нужен.
  if (Capacitor.getPlatform() === 'web') {
    const { defineCustomElements } = await import('jeep-sqlite/loader')
    defineCustomElements(window)
    if (!document.querySelector('jeep-sqlite')) {
      document.body.appendChild(document.createElement('jeep-sqlite'))
    }
  }

  await initDb()

  const app = createApp(App)
  app.use(createPinia())
  app.use(router)
  app.mount('#app')

  initBackButton(router)
}

bootstrap().catch((err) => {
  console.error('Не удалось инициализировать приложение/БД:', err)
})
