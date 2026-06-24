import type { IconName } from '@/components/ui/icons'

export interface NavCard {
  title: string
  description: string
  icon: IconName
  routeName: string
}

export const navCards: NavCard[] = [
  {
    title: 'Сотворение мира',
    description: 'Как был создан Мундус — по мнению Старшего Народа',
    icon: 'creation',
    routeName: 'creation',
  },
  {
    title: 'Пантеон богов',
    description: 'Те, кого альтмеры чтят, и те, кого презирают',
    icon: 'pantheon',
    routeName: 'pantheon',
  },
  {
    title: 'Важные персонажи',
    description: 'Заметки об игроках: имена, титулы и лейблы',
    icon: 'characters',
    routeName: 'characters',
  },
  {
    title: 'Заметки',
    description: 'Личные записи летописца',
    icon: 'notes',
    routeName: 'notes',
  },
]
