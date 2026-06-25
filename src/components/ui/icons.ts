import type { Component } from 'vue'

import IconCreation from '~icons/game-icons/cosmic-egg'
import IconPantheon from '~icons/game-icons/greek-temple'
import IconHouses from '~icons/game-icons/family-tree'
import IconGuide from '~icons/game-icons/compass'
import IconCharacters from '~icons/game-icons/elf-helmet'
import IconNotes from '~icons/game-icons/scroll-quill'
import IconCodex from '~icons/game-icons/open-book'
import IconLore from '~icons/game-icons/spell-book'
import IconQuenta from '~icons/game-icons/scroll-unfurled'
import IconGood from '~icons/game-icons/holy-symbol'
import IconBad from '~icons/game-icons/daemon-skull'
import IconTitle from '~icons/game-icons/laurel-crown'
import IconTower from '~icons/game-icons/white-tower'

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
import IconCopy from '~icons/lucide/copy'
import IconQr from '~icons/lucide/qr-code'
import IconScan from '~icons/lucide/scan-line'
import IconRules from '~icons/game-icons/rule-book'
import IconAlchemy from '~icons/game-icons/round-bottom-flask'
import IconSmithing from '~icons/game-icons/anvil'
import IconGardening from '~icons/game-icons/flower-pot'
import IconFaith from '~icons/game-icons/prayer'
import IconEnchanting from '~icons/game-icons/magic-swirl'
import IconClasses from '~icons/game-icons/battle-gear'
import IconWarrior from '~icons/game-icons/broadsword'
import IconMage from '~icons/game-icons/wizard-staff'
import IconThief from '~icons/game-icons/hooded-figure'
import IconJeweler from '~icons/game-icons/gems'
import IconBuilder from '~icons/game-icons/stone-wall'
import IconManager from '~icons/game-icons/two-coins'
import IconInnovator from '~icons/game-icons/gears'
import IconCommander from '~icons/game-icons/rank-3'

export const icons = {
  creation: IconCreation,
  pantheon: IconPantheon,
  houses: IconHouses,
  guide: IconGuide,
  characters: IconCharacters,
  notes: IconNotes,
  codex: IconCodex,
  lore: IconLore,
  quenta: IconQuenta,
  good: IconGood,
  bad: IconBad,
  title: IconTitle,
  tower: IconTower,
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
  copy: IconCopy,
  qr: IconQr,
  scan: IconScan,
  rules: IconRules,
  alchemy: IconAlchemy,
  smithing: IconSmithing,
  gardening: IconGardening,
  faith: IconFaith,
  enchanting: IconEnchanting,
  classes: IconClasses,
  warrior: IconWarrior,
  mage: IconMage,
  thief: IconThief,
  priest: IconGood,
  jeweler: IconJeweler,
  builder: IconBuilder,
  manager: IconManager,
  innovator: IconInnovator,
  commander: IconCommander,
} satisfies Record<string, Component>

export type IconName = keyof typeof icons
