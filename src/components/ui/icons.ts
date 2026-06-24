import type { Component } from 'vue'

import IconCreation from '~icons/game-icons/cosmic-egg'
import IconPantheon from '~icons/game-icons/greek-temple'
import IconCharacters from '~icons/game-icons/elf-helmet'
import IconNotes from '~icons/game-icons/scroll-quill'
import IconCodex from '~icons/game-icons/open-book'
import IconLore from '~icons/game-icons/spell-book'
import IconGood from '~icons/game-icons/holy-symbol'
import IconBad from '~icons/game-icons/daemon-skull'
import IconTitle from '~icons/game-icons/laurel-crown'

import IconPlus from '~icons/lucide/plus'
import IconSearch from '~icons/lucide/search'
import IconTrash from '~icons/lucide/trash-2'
import IconEdit from '~icons/lucide/pencil'
import IconClose from '~icons/lucide/x'
import IconMenu from '~icons/lucide/menu'
import IconTag from '~icons/lucide/tag'
import IconFilter from '~icons/lucide/funnel'
import IconChevronRight from '~icons/lucide/chevron-right'
import IconChevronLeft from '~icons/lucide/chevron-left'
import IconBack from '~icons/lucide/arrow-left'
import IconCheck from '~icons/lucide/check'
import IconSun from '~icons/lucide/sun'
import IconMoon from '~icons/lucide/moon'
import IconUser from '~icons/lucide/user'
import IconUsers from '~icons/lucide/users'

export const icons = {
  creation: IconCreation,
  pantheon: IconPantheon,
  characters: IconCharacters,
  notes: IconNotes,
  codex: IconCodex,
  lore: IconLore,
  good: IconGood,
  bad: IconBad,
  title: IconTitle,
  plus: IconPlus,
  search: IconSearch,
  trash: IconTrash,
  edit: IconEdit,
  close: IconClose,
  menu: IconMenu,
  tag: IconTag,
  filter: IconFilter,
  'chevron-right': IconChevronRight,
  'chevron-left': IconChevronLeft,
  back: IconBack,
  check: IconCheck,
  sun: IconSun,
  moon: IconMoon,
  user: IconUser,
  users: IconUsers,
} satisfies Record<string, Component>

export type IconName = keyof typeof icons
