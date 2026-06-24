import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import type { IconName } from '@/components/ui/icons'
import HomePage from '@/pages/HomePage.vue'
import { sections } from '@/assets/data/navigation'

export interface NavLink {
  name: string
  label: string
  icon: IconName
}

export const navLinks: NavLink[] = sections.map((section) => ({
  name: section.name,
  label: section.label,
  icon: section.icon,
}))

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
  },
  ...sections.map((section) => ({
    path: section.path,
    name: section.name,
    component: section.component,
  })),
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
