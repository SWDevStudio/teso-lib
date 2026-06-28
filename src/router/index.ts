import { createRouter, createWebHistory, START_LOCATION, type RouteRecordRaw } from 'vue-router'
import type { IconName } from '@/components/ui/icons'
import HomePage from '@/pages/HomePage.vue'
import { sections } from '@/assets/data/navigation'
import { useRulesGateStore } from '@/stores/rulesGate'

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
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition ?? { top: 0 }
  },
})

router.beforeEach((to, from) => {
  if (to.name !== 'rules') return true
  const gate = useRulesGateStore()
  if (gate.seen) return true
  gate.request(to.fullPath)
  return from === START_LOCATION ? { name: 'home' } : false
})

export default router
