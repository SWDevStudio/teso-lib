<template>
  <div class="drawer min-h-screen">
    <input id="nav-drawer" v-model="drawerOpen" type="checkbox" class="drawer-toggle" />

    <UiConfirm />

    <div class="drawer-content flex min-h-screen flex-col bg-base-200 text-base-content">
      <header
        class="navbar sticky top-0 z-30 border-b-2 border-primary/30 bg-base-100/95 px-4 shadow-sm backdrop-blur"
      >
        <div class="navbar-start gap-1">
          <label
            for="nav-drawer"
            class="btn btn-ghost btn-sm min-h-11 min-w-11 cursor-pointer px-2 md:hidden"
            aria-label="Открыть меню"
          >
            <svg
              class="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              aria-hidden="true"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </label>

          <RouterLink to="/" class="flex items-center gap-2 text-primary">
            <svg
              class="size-7 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              aria-hidden="true"
            >
              <path d="M12 2 22 12 12 22 2 12Z" />
              <path d="M12 6 18 12 12 18 6 12Z" />
            </svg>
            <span class="text-lg font-semibold tracking-wide">Tamriel Codex</span>
          </RouterLink>
        </div>

        <nav class="navbar-center hidden md:flex">
          <ul class="menu menu-horizontal gap-1">
            <li v-for="link in navLinks" :key="link.name">
              <RouterLink :to="{ name: link.name }">
                <UiIcon :name="link.icon" />
                {{ link.label }}
              </RouterLink>
            </li>
          </ul>
        </nav>

        <div class="navbar-end">
          <div class="dropdown dropdown-end">
            <div
              tabindex="0"
              role="button"
              class="btn btn-ghost btn-sm min-h-11 gap-2"
              aria-label="Выбор темы"
              aria-haspopup="menu"
              aria-controls="theme-menu"
            >
              <svg
                class="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="4" />
                <path
                  d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"
                />
              </svg>
              Тема
            </div>
            <ul
              id="theme-menu"
              tabindex="0"
              class="dropdown-content menu z-40 mt-2 w-52 gap-1 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg"
            >
              <li v-for="option in themeOptions" :key="option.value">
                <label class="flex cursor-pointer items-center gap-3">
                  <input
                    v-model="theme"
                    type="radio"
                    name="theme-dropdown"
                    class="radio radio-sm radio-primary"
                    :value="option.value"
                    @change="closeMenu"
                  />
                  <span>{{ option.label }}</span>
                </label>
              </li>
            </ul>
          </div>
        </div>
      </header>

      <main class="mx-auto w-full max-w-5xl grow overflow-x-clip px-4 py-8">
        <RouterView v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>

      <footer class="border-t border-base-300 px-4 py-6 text-center text-sm opacity-70">
        <p>Tamriel Codex · справочник по миру The Elder Scrolls</p>
      </footer>
    </div>

    <div class="drawer-side z-50">
      <label for="nav-drawer" aria-label="Закрыть меню" class="drawer-overlay" />
      <aside class="flex min-h-full w-72 flex-col gap-2 bg-base-100 p-4">
        <RouterLink
          to="/"
          class="mb-2 flex items-center gap-2 px-2 py-1 text-primary"
          @click="closeDrawer"
        >
          <svg
            class="size-7 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            aria-hidden="true"
          >
            <path d="M12 2 22 12 12 22 2 12Z" />
            <path d="M12 6 18 12 12 18 6 12Z" />
          </svg>
          <span class="text-lg font-semibold tracking-wide">Tamriel Codex</span>
        </RouterLink>

        <ul class="menu w-full gap-1 text-base">
          <li v-for="link in navLinks" :key="link.name">
            <RouterLink :to="{ name: link.name }" @click="closeDrawer">
              <UiIcon :name="link.icon" :size="20" class="text-primary" />
              {{ link.label }}
            </RouterLink>
          </li>
        </ul>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { navLinks } from '@/router'
import { useTheme } from '@/composables/useTheme'
import UiIcon from '@/components/ui/UiIcon.vue'
import UiConfirm from '@/components/UiConfirm.vue'

const drawerOpen = ref(false)
const { theme, themeOptions } = useTheme()

function closeDrawer() {
  drawerOpen.value = false
}

function closeMenu() {
  ;(document.activeElement as HTMLElement | null)?.blur()
}
</script>

<style scoped>
.menu a.router-link-exact-active {
  color: var(--color-primary);
  font-weight: 600;
}

.page-enter-active,
.page-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active {
    transition: none;
  }

  .page-enter-from,
  .page-leave-to {
    transform: none;
  }
}
</style>
