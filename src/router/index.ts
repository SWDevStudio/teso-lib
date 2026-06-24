import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import type { IconName } from '@/components/ui/icons'
import HomePage from '@/pages/HomePage.vue'

export interface NavLink {
  name: string
  label: string
  icon: IconName
}

export const navLinks: NavLink[] = [
  { name: 'creation', label: 'Сотворение мира', icon: 'creation' },
  { name: 'pantheon', label: 'Пантеон', icon: 'pantheon' },
  { name: 'characters', label: 'Персонажи', icon: 'characters' },
  { name: 'notes', label: 'Заметки', icon: 'notes' },
  { name: 'quentas', label: 'Квенты', icon: 'quenta' },
  { name: 'houses', label: 'Рода и Дома', icon: 'houses' },
  { name: 'guide', label: 'Путеводитель', icon: 'guide' },
]

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
  },
  {
    path: '/creation',
    name: 'creation',
    component: () => import('@/pages/WorldCreationPage.vue'),
  },
  {
    path: '/pantheon',
    name: 'pantheon',
    component: () => import('@/pages/PantheonPage.vue'),
  },
  {
    path: '/houses',
    name: 'houses',
    component: () => import('@/pages/HousesPage.vue'),
  },
  {
    path: '/guide',
    name: 'guide',
    component: () => import('@/pages/TamrielGuidePage.vue'),
  },
  {
    path: '/characters',
    name: 'characters',
    component: () => import('@/pages/CharactersPage.vue'),
  },
  {
    path: '/notes',
    name: 'notes',
    component: () => import('@/pages/NotesPage.vue'),
  },
  {
    path: '/quentas',
    name: 'quentas',
    component: () => import('@/pages/QuentasPage.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
