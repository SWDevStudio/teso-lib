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
import IconImage from '~icons/lucide/image'
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
import IconCrestScales from '~icons/game-icons/scales'
import IconCrestDragon from '~icons/game-icons/dragon-head'
import IconCrestDiamond from '~icons/game-icons/cut-diamond'
import IconCrestAntlers from '~icons/game-icons/stag-head'
import IconCrestLion from '~icons/game-icons/lion'
import IconCrestEagle from '~icons/game-icons/eagle-emblem'
import IconCrestAxe from '~icons/game-icons/battle-axe'
import IconAlphabets from '~icons/game-icons/stone-tablet'
import IconAyleid from '~icons/game-icons/crystal-cluster'
import IconDwemer from '~icons/game-icons/cog'
import IconDaedric from '~icons/game-icons/pentacle'
import IconDragon from '~icons/game-icons/triple-claws'
import IconHerald from '~icons/game-icons/newspaper'
import IconAd from '~icons/game-icons/megaphone'
import IconChronicles from '~icons/game-icons/sands-of-time'
import IconCycles from '~icons/game-icons/book-pile'
import IconEconomy from '~icons/game-icons/coins'
import IconOriginals from '~icons/game-icons/papers'

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
  image: IconImage,
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
  scales: IconCrestScales,
  dragon: IconCrestDragon,
  diamond: IconCrestDiamond,
  antlers: IconCrestAntlers,
  lion: IconCrestLion,
  eagle: IconCrestEagle,
  axe: IconCrestAxe,
  alphabets: IconAlphabets,
  'script-ayleid': IconAyleid,
  'script-dwemer': IconDwemer,
  'script-daedric': IconDaedric,
  'script-dragon': IconDragon,
  herald: IconHerald,
  newspaper: IconHerald,
  megaphone: IconAd,
  chronicles: IconChronicles,
  cycles: IconCycles,
  economy: IconEconomy,
  originals: IconOriginals,
} satisfies Record<string, Component>

export type IconName = keyof typeof icons
