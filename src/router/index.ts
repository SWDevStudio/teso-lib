import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'

export interface NavLink {
  name: string
  label: string
}

export const navLinks: NavLink[] = [
  { name: 'creation', label: 'Сотворение мира' },
  { name: 'pantheon', label: 'Пантеон' },
  { name: 'characters', label: 'Персонажи' },
  { name: 'notes', label: 'Заметки' },
  { name: 'quentas', label: 'Квенты' },
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
