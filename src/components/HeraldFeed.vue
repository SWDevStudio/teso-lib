<template>
  <div class="space-y-6">
    <p class="opacity-80">
      Вести со всех концов Тамриэля, собранные летописцем по слухам, указам и донесениям: что
      творится в Сиродиле, на Островах, на Севере и в южных краях.
    </p>

    <label class="input flex w-full items-center gap-2">
      <UiIcon name="search" class="opacity-60" />
      <input v-model="query" type="search" class="grow" placeholder="Поиск по новостям..." />
    </label>

    <div class="space-y-2">
      <FilterChips
        :options="issueOptions"
        :model-value="activeIssues"
        all-label="Все выпуски"
        @update:model-value="onIssueChange"
      />
      <FilterChips
        :options="regionOptions"
        :model-value="activeRegions"
        all-label="Весь Тамриэль"
        @update:model-value="onRegionChange"
      />
    </div>

    <UiEmptyState
      v-if="filteredArticles.length === 0"
      icon="search"
      title="Ничего не найдено"
      description="Ни одна весть не совпала с запросом."
    />

    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <button
        v-for="article in filteredArticles"
        :key="article.id"
        type="button"
        class="h-full w-full text-left"
        @click="open(article)"
      >
        <UiCard clickable class="h-full">
          <div class="space-y-2">
            <div class="flex items-start justify-between gap-2">
              <div class="flex min-w-0 items-center gap-3">
                <UiIcon :name="article.icon" :size="28" class="shrink-0 text-primary" />
                <div class="min-w-0">
                  <h2 class="text-lg font-semibold leading-snug">{{ article.title }}</h2>
                  <p class="text-sm opacity-70">
                    {{ heraldRegionLabel[article.region] }} · {{ issueLabel[article.issue] }}
                  </p>
                </div>
              </div>
              <UiBadge v-if="article.isAd" color="accent" size="sm">Объявление</UiBadge>
            </div>

            <p v-if="article.lede" class="line-clamp-2 italic opacity-90">{{ article.lede }}</p>
            <p v-else class="line-clamp-2 opacity-80">{{ article.fullText }}</p>
          </div>
        </UiCard>
      </button>
    </div>

    <UiModal v-model="modalOpen" :title="selected?.title">
      <div v-if="selected" class="space-y-4">
        <div class="flex flex-wrap items-center gap-2">
          <UiBadge color="primary" size="sm">{{ heraldRegionLabel[selected.region] }}</UiBadge>
          <UiBadge color="neutral" size="sm">{{ issueLabel[selected.issue] }}</UiBadge>
          <UiBadge v-if="selected.isAd" color="accent" size="sm">Объявление</UiBadge>
          <span class="text-sm opacity-70">{{ selected.date }}</span>
        </div>

        <p v-if="selected.lede" class="text-lg font-medium italic opacity-90">
          {{ selected.lede }}
        </p>

        <div class="divider my-1" />

        <UiMarkdown :source="selected.fullText" />
      </div>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  heraldIssues,
  heraldRegionLabel,
  heraldRegions,
  newsArticles,
  type HeraldRegion,
  type NewsArticle,
} from '@/assets/data/herald'
import type { FilterChipOption } from '@/components/ui/types'
import UiIcon from '@/components/ui/UiIcon.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiModal from '@/components/ui/UiModal.vue'
import UiMarkdown from '@/components/ui/UiMarkdown.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'
import FilterChips from '@/components/FilterChips.vue'

const issueLabel = computed<Record<number, string>>(() =>
  Object.fromEntries(heraldIssues.map((item) => [item.issue, item.label])),
)

const issueOptions = computed<FilterChipOption<number>[]>(() =>
  heraldIssues.map((item) => ({ value: item.issue, label: item.label, color: 'secondary' })),
)

const regionOptions = computed<FilterChipOption<HeraldRegion>[]>(() =>
  heraldRegions.map((region) => ({ value: region.id, label: region.label, color: 'primary' })),
)

const query = ref('')
const activeIssues = ref<number[]>([])
const activeRegions = ref<HeraldRegion[]>([])

function onIssueChange(value: number[]) {
  activeIssues.value = value
}

function onRegionChange(value: HeraldRegion[]) {
  activeRegions.value = value
}

const selected = ref<NewsArticle | null>(null)

const route = useRoute()
const router = useRouter()

const modalOpen = computed({
  get: () => selected.value !== null,
  set: (value: boolean) => {
    if (value) return
    selected.value = null
    if (route.query.open !== undefined) {
      const nextQuery = { ...route.query }
      delete nextQuery.open
      router.replace({ query: nextQuery })
    }
  },
})

const filteredArticles = computed(() => {
  const needle = query.value.trim().toLowerCase()
  return newsArticles.filter((article) => {
    const matchesIssue =
      activeIssues.value.length === 0 || activeIssues.value.includes(article.issue)
    const matchesRegion =
      activeRegions.value.length === 0 || activeRegions.value.includes(article.region)
    const matchesQuery =
      !needle ||
      article.title.toLowerCase().includes(needle) ||
      article.lede.toLowerCase().includes(needle) ||
      article.fullText.toLowerCase().includes(needle)
    return matchesIssue && matchesRegion && matchesQuery
  })
})

function open(article: NewsArticle) {
  selected.value = article
}

watch(
  () => route.query.open,
  (id) => {
    if (typeof id !== 'string') return
    const article = newsArticles.find((item) => item.id === id)
    if (article) open(article)
  },
  { immediate: true },
)
</script>
