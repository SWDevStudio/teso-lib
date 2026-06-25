<template>
  <section class="space-y-6">
    <header class="space-y-2">
      <h1 class="text-3xl font-bold text-primary">Рода и Дома</h1>
      <p class="opacity-80">
        Великие Дома, династии и родословные Тамриэля: кто правит, откуда родом и чем славен — дабы
        знать, с кем сводит тебя судьба.
      </p>
    </header>

    <label class="input flex w-full items-center gap-2">
      <UiIcon name="search" class="opacity-60" />
      <input v-model="query" type="search" class="grow" placeholder="Поиск по названию дома..." />
    </label>

    <FilterChips
      :options="regionOptions"
      :model-value="activeRegions"
      @update:model-value="onRegionChange"
    />

    <UiEmptyState
      v-if="filteredHouses.length === 0"
      icon="search"
      title="Ничего не найдено"
      description="Ни один дом не совпал с запросом."
    />

    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <button
        v-for="house in filteredHouses"
        :key="house.id"
        type="button"
        class="w-full text-left"
        @click="open(house)"
      >
        <UiCard clickable>
          <div class="space-y-2">
            <div class="flex items-start justify-between gap-2">
              <div class="flex min-w-0 items-center gap-3">
                <UiIcon name="houses" :size="28" class="shrink-0 text-primary" />
                <div class="min-w-0">
                  <h2 class="text-xl font-semibold">{{ house.name }}</h2>
                  <p class="text-base opacity-80">
                    {{ house.race }} · {{ regionLabel[house.region] }}
                  </p>
                </div>
              </div>
              <UiBadge :color="house.fallen ? 'error' : 'success'" size="sm">
                {{ house.fallen ? 'Пал' : 'Жив' }}
              </UiBadge>
            </div>

            <p class="line-clamp-2 opacity-90">{{ house.shortDesc }}</p>

            <div v-if="house.notableMembers.length" class="flex flex-wrap gap-1.5">
              <span
                v-for="member in house.notableMembers"
                :key="member.name"
                class="max-w-full rounded-md border border-base-300 bg-base-200 px-2 py-1 text-sm leading-snug"
              >
                {{ member.name }}
              </span>
            </div>
          </div>
        </UiCard>
      </button>
    </div>

    <UiModal v-model="modalOpen" :title="selected?.name">
      <div v-if="selected" class="space-y-4">
        <div class="flex flex-wrap items-center gap-2">
          <UiBadge color="primary" size="sm">{{ regionLabel[selected.region] }}</UiBadge>
          <UiBadge color="neutral" size="sm">{{ selected.race }}</UiBadge>
          <UiBadge :color="selected.fallen ? 'error' : 'success'" size="sm">
            {{ selected.fallen ? 'Пал' : 'Жив' }}
          </UiBadge>
        </div>

        <p class="italic opacity-80">{{ selected.oneLine }}</p>

        <dl class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <dt class="text-sm font-semibold uppercase tracking-wide opacity-70">Родовое гнездо</dt>
            <dd>{{ selected.seat }}</dd>
          </div>
          <div>
            <dt class="text-sm font-semibold uppercase tracking-wide opacity-70">Сфера</dt>
            <dd>{{ selected.sphere }}</dd>
          </div>
          <div>
            <dt class="text-sm font-semibold uppercase tracking-wide opacity-70">Цвета / печать</dt>
            <dd>{{ selected.colors }}</dd>
          </div>
          <div>
            <dt class="text-sm font-semibold uppercase tracking-wide opacity-70">Эпоха</dt>
            <dd>{{ selected.era }}</dd>
          </div>
          <div class="sm:col-span-2">
            <dt class="text-sm font-semibold uppercase tracking-wide opacity-70">Статус</dt>
            <dd>{{ selected.status }}</dd>
          </div>
        </dl>

        <div v-if="selected.notableMembers.length" class="space-y-1">
          <h4 class="text-sm font-semibold uppercase tracking-wide opacity-70">Ключевые лица</h4>
          <ul class="space-y-1">
            <li
              v-for="member in selected.notableMembers"
              :key="member.name"
              class="flex flex-col gap-0.5 sm:flex-row sm:gap-2"
            >
              <span class="font-medium opacity-90">{{ member.name }}</span>
              <span class="hidden opacity-50 sm:inline">—</span>
              <span class="opacity-80">{{ member.note }}</span>
            </li>
          </ul>
        </div>

        <div class="divider my-1" />

        <UiMarkdown :source="selected.fullText" />
      </div>
    </UiModal>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { houses, regions, regionLabel, type House, type HouseRegion } from '@/assets/data/houses'
import UiIcon from '@/components/ui/UiIcon.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiModal from '@/components/ui/UiModal.vue'
import UiMarkdown from '@/components/ui/UiMarkdown.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'
import FilterChips from '@/components/FilterChips.vue'
import type { FilterChipOption } from '@/components/ui/types'

const query = ref('')
const activeRegions = ref<HouseRegion[]>([])

const regionOptions = computed<FilterChipOption<HouseRegion>[]>(() =>
  regions.map((region) => ({
    value: region.id,
    label: region.label,
    color: 'primary',
  })),
)

function onRegionChange(value: HouseRegion[]) {
  activeRegions.value = value
}
const selected = ref<House | null>(null)

const modalOpen = computed({
  get: () => selected.value !== null,
  set: (value: boolean) => {
    if (!value) selected.value = null
  },
})

const filteredHouses = computed(() => {
  const needle = query.value.trim().toLowerCase()
  return houses.filter((house) => {
    const matchesRegion =
      activeRegions.value.length === 0 || activeRegions.value.includes(house.region)
    const matchesQuery =
      !needle ||
      house.name.toLowerCase().includes(needle) ||
      house.nameEn.toLowerCase().includes(needle)
    return matchesRegion && matchesQuery
  })
})

function open(house: House) {
  selected.value = house
}

const route = useRoute()

watch(
  () => route.query.open,
  (id) => {
    if (typeof id !== 'string') return
    const house = houses.find((item) => item.id === id)
    if (house) open(house)
  },
  { immediate: true },
)
</script>
