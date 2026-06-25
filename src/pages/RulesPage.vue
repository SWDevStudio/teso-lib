<template>
  <section class="space-y-6">
    <header class="space-y-2">
      <h1 class="text-3xl font-bold text-primary">Правила</h1>
      <p class="opacity-80">Свод правил игры. Открой нужный раздел или найди нужное через поиск.</p>
    </header>

    <label class="input flex w-full items-center gap-2">
      <UiIcon name="search" class="opacity-60" />
      <input
        v-model="query"
        type="search"
        class="grow"
        placeholder="Поиск по всем правилам: невидимость, хиты, душа..."
      />
    </label>

    <template v-if="trimmedQuery">
      <UiEmptyState
        v-if="results.length === 0"
        icon="search"
        title="Ничего не найдено"
        :description="`По запросу «${trimmedQuery}» в правилах ничего нет.`"
      />

      <div v-else class="space-y-2">
        <p class="text-sm opacity-60">Найдено: {{ results.length }}</p>
        <button
          v-for="result in results"
          :key="result.doc.id + result.section.id"
          type="button"
          class="w-full text-left"
          @click="openResult(result)"
        >
          <UiCard clickable>
            <div class="space-y-1">
              <div class="flex flex-wrap items-center gap-1.5 text-sm opacity-70">
                <UiIcon :name="result.doc.icon" :size="16" class="text-primary" />
                <span>{{ result.doc.title }}</span>
                <UiIcon name="chevron-right" :size="14" class="opacity-50" />
                <span class="font-semibold text-base-content">{{ result.section.title }}</span>
              </div>
              <p class="text-sm opacity-80" v-html="result.snippet" />
            </div>
          </UiCard>
        </button>
      </div>
    </template>

    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <button type="button" class="w-full text-left" @click="openDoc(quickGuide)">
        <UiCard clickable>
          <div class="flex items-center gap-3">
            <UiIcon :name="quickGuide.icon" :size="32" class="shrink-0 text-primary" />
            <div class="min-w-0">
              <h2 class="text-xl font-semibold">{{ quickGuide.title }}</h2>
              <p class="text-sm opacity-60">Самое важное · версия {{ quickGuide.version }}</p>
            </div>
          </div>
        </UiCard>
      </button>

      <button type="button" class="w-full text-left" @click="classesOpen = true">
        <UiCard clickable>
          <div class="flex items-center gap-3">
            <UiIcon name="classes" :size="32" class="shrink-0 text-primary" />
            <div class="min-w-0">
              <h2 class="text-xl font-semibold">Классы</h2>
              <p class="text-sm opacity-60">
                {{ ruleClasses.classes.length }} классов · навыки и уровни
              </p>
            </div>
          </div>
        </UiCard>
      </button>

      <button
        v-for="doc in ruleDocs"
        :key="doc.id"
        type="button"
        class="w-full text-left"
        @click="openDoc(doc)"
      >
        <UiCard clickable>
          <div class="flex items-center gap-3">
            <UiIcon :name="doc.icon" :size="32" class="shrink-0 text-primary" />
            <div class="min-w-0">
              <h2 class="text-xl font-semibold">{{ doc.title }}</h2>
              <p class="text-sm opacity-60">{{ docMeta(doc) }}</p>
            </div>
          </div>
        </UiCard>
      </button>
    </div>

    <UiModal v-model="modalOpen" :title="selectedDoc?.title">
      <template v-if="selectedDoc">
        <RuleDoc :doc="selectedDoc" :target-section-id="targetSectionId" />
        <div v-if="selectedDoc.id === 'quick'" class="mt-4 border-t border-base-300 pt-4">
          <UiButton variant="ghost" outline class="w-full" @click="originalOpen = true">
            <UiIcon name="search" :size="18" />
            Открыть оригинал
          </UiButton>
        </div>
      </template>
    </UiModal>

    <UiModal v-model="classesOpen" title="Классы">
      <RuleClassesView v-if="classesOpen" @open-craft="onOpenCraft" />
    </UiModal>

    <UiModal v-model="originalOpen" title="Краткое руководство — оригинал">
      <div class="space-y-3">
        <p class="text-sm opacity-70">Оригинальные страницы правил — на случай расхождений.</p>
        <a
          v-for="(src, index) in quickGuideImages"
          :key="src"
          :href="src"
          target="_blank"
          rel="noopener"
          class="block"
        >
          <img
            :src="src"
            :alt="pageAlt(index)"
            class="w-full rounded-lg border border-base-300"
            loading="lazy"
          />
        </a>
      </div>
    </UiModal>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  ruleClasses,
  ruleDocs,
  type RuleDoc as RuleDocType,
  type RuleSection,
} from '@/assets/data/rules.generated'
import UiIcon from '@/components/ui/UiIcon.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiModal from '@/components/ui/UiModal.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'
import RuleDoc from '@/components/rules/RuleDoc.vue'
import RuleClassesView from '@/components/rules/RuleClassesView.vue'
import { quickGuide, quickGuideImages } from '@/assets/data/quick-guide'

interface SearchResult {
  doc: RuleDocType
  section: RuleSection
  snippet: string
}

const query = ref('')
const selectedDoc = ref<RuleDocType | null>(null)
const targetSectionId = ref<string | null>(null)
const classesOpen = ref(false)
const originalOpen = ref(false)

const trimmedQuery = computed(() => query.value.trim())

const modalOpen = computed({
  get: () => selectedDoc.value !== null,
  set: (value: boolean) => {
    if (!value) {
      selectedDoc.value = null
      targetSectionId.value = null
    }
  },
})

function escapeHtml(value: string) {
  return value.replace(
    /[&<>]/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[char] ?? char,
  )
}

function buildSnippet(text: string, needle: string) {
  const index = text.toLowerCase().indexOf(needle)
  if (index < 0) return escapeHtml(text.slice(0, 120)) + (text.length > 120 ? '…' : '')
  const start = Math.max(0, index - 40)
  const end = Math.min(text.length, index + needle.length + 70)
  const head = (start > 0 ? '…' : '') + escapeHtml(text.slice(start, index))
  const hit = '<mark>' + escapeHtml(text.slice(index, index + needle.length)) + '</mark>'
  const tail = escapeHtml(text.slice(index + needle.length, end)) + (end < text.length ? '…' : '')
  return head + hit + tail
}

function collectMatches(
  doc: RuleDocType,
  sections: RuleSection[],
  needle: string,
  found: SearchResult[],
) {
  for (const section of sections) {
    if (section.text.toLowerCase().includes(needle)) {
      found.push({ doc, section, snippet: buildSnippet(section.text, needle) })
    }
    if (found.length >= 80) return
    collectMatches(doc, section.children, needle, found)
    if (found.length >= 80) return
  }
}

const results = computed<SearchResult[]>(() => {
  const needle = trimmedQuery.value.toLowerCase()
  if (!needle) return []
  const found: SearchResult[] = []
  for (const doc of [quickGuide, ...ruleDocs]) {
    collectMatches(doc, doc.sections, needle, found)
    if (found.length >= 80) break
  }
  return found
})

function sectionWord(count: number) {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return 'раздел'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'раздела'
  return 'разделов'
}

function docMeta(doc: RuleDocType) {
  return `${doc.sections.length} ${sectionWord(doc.sections.length)} · версия ${doc.version}`
}

function pageAlt(index: number) {
  return `Краткое руководство — страница ${index + 1}`
}

function openDoc(doc: RuleDocType) {
  targetSectionId.value = null
  selectedDoc.value = doc
}

function openResult(result: SearchResult) {
  targetSectionId.value = result.section.id
  selectedDoc.value = result.doc
}

function onOpenCraft(slug: string) {
  classesOpen.value = false
  const doc = ruleDocs.find((item) => item.id === slug)
  if (doc) openDoc(doc)
}
</script>
