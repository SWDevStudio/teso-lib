<template>
  <div class="space-y-6">
    <p class="opacity-80">
      Газеты, указы, воззвания и события онлайн-циклов (214–215 годы IV эры). Часть материалов
      выходила картинками — для них показан оригинал и ссылка на источник.
    </p>

    <label class="input flex w-full items-center gap-2">
      <UiIcon name="search" class="opacity-60" />
      <input
        v-model="query"
        type="search"
        class="grow"
        placeholder="Поиск по материалам циклов..."
      />
    </label>

    <div class="space-y-2">
      <FilterChips
        :options="cycleOptions"
        :model-value="activeCycles"
        all-label="Все циклы"
        @update:model-value="onCycleChange"
      />
      <FilterChips
        :options="typeOptions"
        :model-value="activeTypes"
        all-label="Любой тип"
        @update:model-value="onTypeChange"
      />
    </div>

    <UiEmptyState
      v-if="filteredDocs.length === 0"
      icon="search"
      title="Ничего не найдено"
      description="Ни один материал не совпал с запросом."
    />

    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <button
        v-for="doc in filteredDocs"
        :key="doc.id"
        type="button"
        class="h-full w-full text-left"
        @click="open(doc)"
      >
        <UiCard clickable class="h-full">
          <div class="space-y-2">
            <div class="flex items-start justify-between gap-2">
              <div class="flex min-w-0 items-center gap-3">
                <UiIcon :name="typeIcon[doc.type]" :size="28" class="shrink-0 text-primary" />
                <div class="min-w-0">
                  <h2 class="text-lg font-semibold leading-snug">{{ doc.title }}</h2>
                  <p class="text-sm opacity-70">{{ cycleLabel[doc.cycle] }}</p>
                </div>
              </div>
              <UiBadge :color="typeColor[doc.type]" size="sm">{{
                cycleTypeLabel[doc.type]
              }}</UiBadge>
            </div>

            <img
              v-if="doc.images.length"
              :src="imageSrc(doc.images[0])"
              :alt="doc.title"
              loading="lazy"
              class="max-h-48 w-full rounded-md border border-base-300 object-cover"
            />

            <p class="line-clamp-2 opacity-90">{{ doc.lede }}</p>
          </div>
        </UiCard>
      </button>
    </div>

    <UiModal v-model="modalOpen" :title="selected?.title">
      <div v-if="selected" class="space-y-4">
        <div class="flex flex-wrap items-center gap-2">
          <UiBadge color="primary" size="sm">{{ cycleLabel[selected.cycle] }}</UiBadge>
          <UiBadge :color="typeColor[selected.type]" size="sm">
            {{ cycleTypeLabel[selected.type] }}
          </UiBadge>
          <span v-if="selected.source" class="text-sm opacity-70">{{ selected.source }}</span>
        </div>

        <UiMarkdown v-if="selected.fullText" :source="selected.fullText" />

        <div v-else-if="selected.images.length" class="space-y-3">
          <img
            v-for="(img, index) in selected.images"
            :key="img"
            :src="imageSrc(img)"
            :alt="`${selected.title} — лист ${index + 1}`"
            loading="lazy"
            class="w-full rounded-lg border border-base-300"
          />
        </div>

        <p v-else class="opacity-80">{{ selected.lede }}</p>

        <a
          v-if="selected.sourceUrl"
          :href="selected.sourceUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="link link-primary inline-flex items-center gap-2 text-sm opacity-70"
        >
          <UiIcon name="herald" :size="16" />
          Источник: VK
        </a>
      </div>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  cycleDocs,
  cycleGroups,
  cycleTypeLabel,
  type CycleDoc,
  type CycleDocType,
  type CycleKey,
} from '@/assets/data/cycledocs'
import type { BadgeColor, FilterChipOption } from '@/components/ui/types'
import type { IconName } from '@/components/ui/icons'
import UiIcon from '@/components/ui/UiIcon.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiModal from '@/components/ui/UiModal.vue'
import UiMarkdown from '@/components/ui/UiMarkdown.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'
import FilterChips from '@/components/FilterChips.vue'

const cycleImages = import.meta.glob<string>('../assets/cycles/*.jpg', {
  eager: true,
  import: 'default',
})

function imageSrc(file: string | undefined): string {
  if (!file) return ''
  const found = Object.entries(cycleImages).find(([path]) => path.endsWith(`/${file}`))
  return found ? found[1] : ''
}

const typeIcon: Record<CycleDocType, IconName> = {
  newspaper: 'herald',
  decree: 'title',
  event: 'megaphone',
  book: 'lore',
  report: 'notes',
}

const typeColor: Record<CycleDocType, BadgeColor> = {
  newspaper: 'primary',
  decree: 'warning',
  event: 'accent',
  book: 'secondary',
  report: 'neutral',
}

const cycleLabel = computed<Record<string, string>>(() =>
  Object.fromEntries(cycleGroups.map((group) => [group.id, group.label])),
)

const cycleOptions = computed<FilterChipOption<CycleKey>[]>(() =>
  cycleGroups
    .filter((group) => cycleDocs.some((doc) => doc.cycle === group.id))
    .map((group) => ({ value: group.id, label: group.label, color: 'secondary' })),
)

const presentTypes = computed<CycleDocType[]>(() => {
  const order: CycleDocType[] = ['newspaper', 'decree', 'event', 'book', 'report']
  return order.filter((type) => cycleDocs.some((doc) => doc.type === type))
})

const typeOptions = computed<FilterChipOption<CycleDocType>[]>(() =>
  presentTypes.value.map((type) => ({
    value: type,
    label: cycleTypeLabel[type],
    color: 'primary',
  })),
)

const query = ref('')
const activeCycles = ref<CycleKey[]>([])
const activeTypes = ref<CycleDocType[]>([])

function onCycleChange(value: CycleKey[]) {
  activeCycles.value = value
}

function onTypeChange(value: CycleDocType[]) {
  activeTypes.value = value
}

const selected = ref<CycleDoc | null>(null)

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

const filteredDocs = computed(() => {
  const needle = query.value.trim().toLowerCase()
  return cycleDocs.filter((doc) => {
    const matchesCycle = activeCycles.value.length === 0 || activeCycles.value.includes(doc.cycle)
    const matchesType = activeTypes.value.length === 0 || activeTypes.value.includes(doc.type)
    const matchesQuery =
      !needle ||
      doc.title.toLowerCase().includes(needle) ||
      doc.lede.toLowerCase().includes(needle) ||
      doc.fullText.toLowerCase().includes(needle)
    return matchesCycle && matchesType && matchesQuery
  })
})

function open(doc: CycleDoc) {
  selected.value = doc
}

watch(
  () => route.query.open,
  (id) => {
    if (typeof id !== 'string') return
    const doc = cycleDocs.find((item) => item.id === id)
    if (doc) open(doc)
  },
  { immediate: true },
)
</script>
