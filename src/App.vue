<template>
  <div class="min-h-screen bg-base-200 text-base-content">
    <!-- Header / navbar -->
    <header
      class="navbar sticky top-0 z-30 border-b-2 border-primary/30 bg-base-100/95 backdrop-blur px-4 shadow-sm"
    >
      <div class="navbar-start gap-1">
        <!-- Мобильное меню -->
        <div class="dropdown md:hidden">
          <div
            tabindex="0"
            role="button"
            class="btn btn-ghost btn-sm px-2"
            aria-label="Меню"
            aria-haspopup="menu"
            aria-controls="mobile-menu"
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
          </div>
          <ul
            id="mobile-menu"
            tabindex="0"
            class="dropdown-content menu z-40 mt-2 w-52 gap-1 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg"
          >
            <li v-for="link in navLinks" :key="link.name">
              <RouterLink :to="{ name: link.name }" @click="closeMenu">{{ link.label }}</RouterLink>
            </li>
          </ul>
        </div>

        <RouterLink to="/" class="flex items-center gap-2 text-primary">
          <!-- gilded diamond emblem -->
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
            <RouterLink :to="{ name: link.name }">{{ link.label }}</RouterLink>
          </li>
        </ul>
      </nav>

      <div class="navbar-end">
        <!-- Theme switcher — pure CSS via daisyUI theme-controller -->
        <div class="dropdown dropdown-end">
          <div
            tabindex="0"
            role="button"
            class="btn btn-ghost btn-sm gap-2"
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
            <li>
              <label class="flex cursor-pointer items-center gap-3" @click="closeMenu">
                <input
                  type="radio"
                  name="theme-dropdown"
                  class="theme-controller radio radio-sm radio-primary"
                  value="elderscrolls"
                />
                <span>Древний фолиант</span>
              </label>
            </li>
            <li>
              <label class="flex cursor-pointer items-center gap-3" @click="closeMenu">
                <input
                  type="radio"
                  name="theme-dropdown"
                  class="theme-controller radio radio-sm radio-primary"
                  value="parchment"
                  checked
                />
                <span>Пергамент</span>
              </label>
            </li>
          </ul>
        </div>
      </div>
    </header>

    <!-- Page content -->
    <main class="mx-auto w-full max-w-5xl px-4 py-8">
      <RouterView />
    </main>

    <footer class="border-t border-base-300 px-4 py-6 text-center text-sm opacity-70">
      <p>Tamriel Codex · справочник по миру The Elder Scrolls</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { navLinks } from '@/router'

/**
 * daisyUI-дропданы открываются по `:focus-within`. После SPA-перехода
 * ссылка остаётся в фокусе и меню не закрывается — снимаем фокус вручную.
 */
function closeMenu() {
  ;(document.activeElement as HTMLElement | null)?.blur()
}
</script>

<style scoped>
/* highlight the active route in the menu */
nav a.router-link-exact-active,
.dropdown-content a.router-link-exact-active {
  color: var(--color-primary);
  font-weight: 600;
}
</style>
