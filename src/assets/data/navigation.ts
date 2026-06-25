import type { Component } from 'vue'
import type { IconName } from '@/components/ui/icons'

// Единый источник навигации. Добавляй раздел СЮДА (в sections) —
// меню (navLinks), карточки главной (navCards) и маршруты выводятся из него.
export interface Section {
  name: string
  path: string
  label: string
  title: string
  description: string
  icon: IconName
  component: () => Promise<Component>
}

export const sections: Section[] = [
  {
    name: 'rules',
    path: '/rules',
    label: 'Правила',
    title: 'Правила',
    description: 'Свод правил игры: бой, магия, ремёсла, состояния и многое другое',
    icon: 'rules',
    component: () => import('@/pages/RulesPage.vue'),
  },
  {
    name: 'creation',
    path: '/creation',
    label: 'Сотворение мира',
    title: 'Сотворение мира',
    description: 'Как был создан Мундус — по мнению Старшего Народа',
    icon: 'creation',
    component: () => import('@/pages/WorldCreationPage.vue'),
  },
  {
    name: 'pantheon',
    path: '/pantheon',
    label: 'Пантеон',
    title: 'Пантеон богов',
    description: 'Те, кого альтмеры чтят, и те, кого презирают',
    icon: 'pantheon',
    component: () => import('@/pages/PantheonPage.vue'),
  },
  {
    name: 'characters',
    path: '/characters',
    label: 'Персонажи',
    title: 'Важные персонажи',
    description: 'Заметки об игроках: имена, титулы и лейблы',
    icon: 'characters',
    component: () => import('@/pages/CharactersPage.vue'),
  },
  {
    name: 'notes',
    path: '/notes',
    label: 'Заметки',
    title: 'Заметки',
    description: 'Личные записи летописца',
    icon: 'notes',
    component: () => import('@/pages/NotesPage.vue'),
  },
  {
    name: 'quentas',
    path: '/quentas',
    label: 'Квенты',
    title: 'Квенты',
    description: 'Жизнеописания героев Тамриэля',
    icon: 'quenta',
    component: () => import('@/pages/QuentasPage.vue'),
  },
  {
    name: 'houses',
    path: '/houses',
    label: 'Рода и Дома',
    title: 'Рода и Дома',
    description: 'Великие Дома и династии Тамриэля и их родословные',
    icon: 'houses',
    component: () => import('@/pages/HousesPage.vue'),
  },
  {
    name: 'guide',
    path: '/guide',
    label: 'Путеводитель',
    title: 'Путеводитель по Тамриэлю',
    description: 'Краткий свод о провинциях: кто их населяет, где престолы и чем памятны',
    icon: 'guide',
    component: () => import('@/pages/TamrielGuidePage.vue'),
  },
  {
    name: 'towers',
    path: '/towers',
    label: 'Башни',
    title: 'Башни Нирна',
    description: 'Древние столпы, что стабилизируют Мундус: их Камни, история и статус',
    icon: 'tower',
    component: () => import('@/pages/TowersPage.vue'),
  },
]

export interface NavCard {
  title: string
  description: string
  icon: IconName
  routeName: string
}

export const navCards: NavCard[] = sections.map((section) => ({
  title: section.title,
  description: section.description,
  icon: section.icon,
  routeName: section.name,
}))
