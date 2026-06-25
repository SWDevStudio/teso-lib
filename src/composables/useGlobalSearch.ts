import { computed, ref } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import type { IconName } from '@/components/ui/icons'
import { deities } from '@/assets/data/pantheon'
import { towers } from '@/assets/data/towers'
import { locations } from '@/assets/data/tamriel'
import { houses } from '@/assets/data/houses'
import { creation } from '@/assets/data/creation'
import {
  ruleClasses,
  ruleDocs,
  type RuleDoc,
  type RuleSection,
} from '@/assets/data/rules.generated'
import { quickGuide } from '@/assets/data/quick-guide'
import { useCharactersStore } from '@/stores/characters'
import { useNotesStore } from '@/stores/notes'
import { useQuentasStore } from '@/stores/quentas'

export interface SearchEntry {
  id: string
  kind: string
  icon: IconName
  title: string
  subtitle?: string
  text: string
  to: RouteLocationRaw
}

export interface SearchGroup {
  kind: string
  entries: SearchEntry[]
}

const MAX_RESULTS = 60

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function flattenRuleSections(doc: RuleDoc, sections: RuleSection[], out: SearchEntry[]) {
  for (const section of sections) {
    out.push({
      id: `rules:${doc.id}:${section.id}`,
      kind: 'Правила',
      icon: doc.icon,
      title: section.title,
      subtitle: doc.title,
      text: section.text,
      to: { name: 'rules', query: { doc: doc.id, section: section.id } },
    })
    if (section.children.length) flattenRuleSections(doc, section.children, out)
  }
}

function buildStaticEntries(): SearchEntry[] {
  const out: SearchEntry[] = []

  for (const deity of deities) {
    out.push({
      id: `pantheon:${deity.id}`,
      kind: 'Пантеон',
      icon: 'pantheon',
      title: deity.altmerName,
      subtitle: deity.domain,
      text: [
        deity.altmerName,
        deity.otherNames.map((n) => `${n.race} ${n.name}`).join(' '),
        deity.domain,
        deity.oneLine,
        deity.shortDesc,
        deity.fullText,
      ].join(' '),
      to: { name: 'pantheon', query: { open: deity.id } },
    })
  }

  for (const tower of towers) {
    out.push({
      id: `towers:${tower.id}`,
      kind: 'Башни',
      icon: 'tower',
      title: tower.name,
      subtitle: tower.location,
      text: [
        tower.name,
        tower.otherNames.join(' '),
        tower.location,
        tower.stone,
        tower.oneLine,
        tower.shortDesc,
        tower.fullText,
      ].join(' '),
      to: { name: 'towers', query: { open: tower.id } },
    })
  }

  for (const location of locations) {
    out.push({
      id: `guide:${location.id}`,
      kind: 'Путеводитель',
      icon: 'guide',
      title: location.name,
      subtitle: location.capital,
      text: [
        location.name,
        location.nameEn,
        location.peoples,
        location.capital,
        location.climate,
        location.oneLine,
        location.shortDesc,
        location.fullText,
      ].join(' '),
      to: { name: 'guide', query: { open: location.id } },
    })
  }

  for (const house of houses) {
    out.push({
      id: `houses:${house.id}`,
      kind: 'Рода и Дома',
      icon: 'houses',
      title: house.name,
      subtitle: house.seat,
      text: [
        house.name,
        house.nameEn,
        house.race,
        house.seat,
        house.sphere,
        house.era,
        house.status,
        house.notableMembers.map((m) => `${m.name} ${m.note}`).join(' '),
        house.oneLine,
        house.shortDesc,
        house.fullText,
      ].join(' '),
      to: { name: 'houses', query: { open: house.id } },
    })
  }

  creation.sections.forEach((section, index) => {
    out.push({
      id: `creation:${index}`,
      kind: 'Сотворение мира',
      icon: 'creation',
      title: section.heading,
      text: `${section.heading} ${section.body}`,
      to: { name: 'creation', query: { open: String(index) } },
    })
  })

  for (const doc of [quickGuide, ...ruleDocs]) {
    out.push({
      id: `rules:${doc.id}`,
      kind: 'Правила',
      icon: doc.icon,
      title: doc.title,
      subtitle: 'Свод правил',
      text: `${doc.title} ${stripTags(doc.intro)}`,
      to: { name: 'rules', query: { doc: doc.id } },
    })
    flattenRuleSections(doc, doc.sections, out)
  }

  for (const ruleClass of ruleClasses.classes) {
    out.push({
      id: `class:${ruleClass.id}`,
      kind: 'Классы',
      icon: ruleClass.icon,
      title: ruleClass.name,
      subtitle: 'Класс',
      text: `${ruleClass.name} ${ruleClass.text}`,
      to: { name: 'rules', query: { classes: '1', class: ruleClass.id } },
    })
  }
  for (const section of ruleClasses.general) {
    out.push({
      id: `class-general:${section.id}`,
      kind: 'Классы',
      icon: 'classes',
      title: section.title,
      subtitle: 'Навыки и магия',
      text: section.text,
      to: { name: 'rules', query: { classes: '1' } },
    })
  }

  return out
}

const staticEntries: SearchEntry[] = buildStaticEntries()

export function useGlobalSearch() {
  const charactersStore = useCharactersStore()
  const notesStore = useNotesStore()
  const quentasStore = useQuentasStore()

  const query = ref('')

  function ensureLoaded() {
    if (!charactersStore.loading && charactersStore.characters.length === 0) charactersStore.load()
    if (!notesStore.loading && notesStore.notes.length === 0) notesStore.load()
    if (!quentasStore.loading && quentasStore.quentas.length === 0) quentasStore.load()
  }

  const dbEntries = computed<SearchEntry[]>(() => {
    const out: SearchEntry[] = []
    for (const character of charactersStore.characters) {
      out.push({
        id: `character:${character.id}`,
        kind: 'Персонажи',
        icon: 'characters',
        title: character.name,
        subtitle: character.title ?? character.real_name ?? undefined,
        text: [character.name, character.real_name, character.title, character.note]
          .filter(Boolean)
          .join(' '),
        to: { name: 'characters', query: { open: String(character.id) } },
      })
    }
    for (const note of notesStore.notes) {
      out.push({
        id: `note:${note.id}`,
        kind: 'Заметки',
        icon: 'notes',
        title: note.title,
        text: `${note.title} ${note.body}`,
        to: { name: 'notes', query: { open: String(note.id) } },
      })
    }
    for (const quenta of quentasStore.quentas) {
      out.push({
        id: `quenta:${quenta.id}`,
        kind: 'Квенты',
        icon: 'quenta',
        title: quenta.name,
        subtitle: quenta.race,
        text: [
          quenta.name,
          quenta.race,
          quenta.birth,
          quenta.origin,
          quenta.summary,
          quenta.body,
        ].join(' '),
        to: { name: 'quentas', query: { open: String(quenta.id) } },
      })
    }
    return out
  })

  const results = computed<SearchEntry[]>(() => {
    const needle = query.value.trim().toLowerCase()
    if (!needle) return []
    const found: SearchEntry[] = []
    for (const entry of [...staticEntries, ...dbEntries.value]) {
      if (entry.title.toLowerCase().includes(needle) || entry.text.toLowerCase().includes(needle)) {
        found.push(entry)
        if (found.length >= MAX_RESULTS) break
      }
    }
    return found
  })

  const groups = computed<SearchGroup[]>(() => {
    const byKind = new Map<string, SearchEntry[]>()
    for (const entry of results.value) {
      const list = byKind.get(entry.kind)
      if (list) list.push(entry)
      else byKind.set(entry.kind, [entry])
    }
    return [...byKind.entries()].map(([kind, entries]) => ({ kind, entries }))
  })

  return { query, results, groups, ensureLoaded }
}
