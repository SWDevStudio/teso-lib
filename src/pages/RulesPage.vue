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
              <p class="text-sm opacity-60">
                {{ doc.sections.length }} {{ sectionWord(doc.sections.length) }} · версия
                {{ doc.version }}
              </p>
            </div>
          </div>
        </UiCard>
      </button>
    </div>

    <UiModal v-model="modalOpen" :title="selectedDoc?.title">
      <RuleDoc v-if="selectedDoc" :doc="selectedDoc" :target-section-id="targetSectionId" />
    </UiModal>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  ruleDocs,
  type RuleDoc as RuleDocType,
  type RuleSection,
} from '@/assets/data/rules.generated'
import UiIcon from '@/components/ui/UiIcon.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiModal from '@/components/ui/UiModal.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'
import RuleDoc from '@/components/rules/RuleDoc.vue'

interface SearchResult {
  doc: RuleDocType
  section: RuleSection
  snippet: string
}

const query = ref('')
const selectedDoc = ref<RuleDocType | null>(null)
const targetSectionId = ref<string | null>(null)

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
  for (const doc of ruleDocs) {
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

function openDoc(doc: RuleDocType) {
  targetSectionId.value = null
  selectedDoc.value = doc
}

function openResult(result: SearchResult) {
  targetSectionId.value = result.section.id
  selectedDoc.value = result.doc
}

const route = useRoute()

watch(
  () => route.query.doc,
  (slug) => {
    if (!slug) return
    const doc = ruleDocs.find((item) => item.id === slug)
    if (doc) openDoc(doc)
  },
  { immediate: true },
)
</script>
