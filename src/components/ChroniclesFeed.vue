<template>
  <div class="space-y-6">
    <p class="opacity-80">
      Летопись событий и толков Тамриэля по годам Четвёртой эры — то, что объявляли герольды,
      печатал «Вороной Курьер» или шептали в тавернах, на рынках и меж соседей.
    </p>

    <label class="input flex w-full items-center gap-2">
      <UiIcon name="search" class="opacity-60" />
      <input v-model="query" type="search" class="grow" placeholder="Поиск по годам и слухам..." />
    </label>

    <UiEmptyState
      v-if="filteredChronicles.length === 0"
      icon="search"
      title="Ничего не найдено"
      description="Ни один слух не совпал с запросом."
    />

    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <button
        v-for="chronicle in filteredChronicles"
        :key="chronicle.id"
        type="button"
        class="h-full w-full text-left"
        @click="open(chronicle)"
      >
        <UiCard clickable class="h-full">
          <div class="space-y-2">
            <div class="flex items-start justify-between gap-2">
              <div class="flex min-w-0 items-center gap-3">
                <UiIcon name="chronicles" :size="28" class="shrink-0 text-primary" />
                <div class="min-w-0">
                  <h2 class="text-xl font-semibold">{{ chronicle.title }}</h2>
                  <p class="text-sm opacity-70">{{ rumorLabel(chronicle.count) }}</p>
                </div>
              </div>
            </div>

            <p class="line-clamp-3 opacity-90">{{ chronicle.teaser }}</p>
          </div>
        </UiCard>
      </button>
    </div>

    <UiModal v-model="modalOpen" :title="selected?.title">
      <div v-if="selected" class="space-y-4">
        <div class="flex flex-wrap items-center gap-2">
          <UiBadge color="primary" size="sm">{{ selected.year }} г. IV эры</UiBadge>
          <UiBadge color="neutral" size="sm">{{ rumorLabel(selected.count) }}</UiBadge>
        </div>

        <UiMarkdown :source="selected.fullText" />
      </div>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { chronicles, type Chronicle } from '@/assets/data/chronicles'
import UiIcon from '@/components/ui/UiIcon.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiModal from '@/components/ui/UiModal.vue'
import UiMarkdown from '@/components/ui/UiMarkdown.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'

function rumorLabel(count: number) {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return `${count} слух`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${count} слуха`
  return `${count} слухов`
}

const query = ref('')
const selected = ref<Chronicle | null>(null)

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

const filteredChronicles = computed(() => {
  const needle = query.value.trim().toLowerCase()
  if (!needle) return chronicles
  return chronicles.filter(
    (chronicle) =>
      chronicle.title.toLowerCase().includes(needle) ||
      chronicle.fullText.toLowerCase().includes(needle),
  )
})

function open(chronicle: Chronicle) {
  selected.value = chronicle
}

watch(
  () => route.query.open,
  (id) => {
    if (typeof id !== 'string') return
    const chronicle = chronicles.find((item) => item.id === id)
    if (chronicle) open(chronicle)
  },
  { immediate: true },
)
</script>
