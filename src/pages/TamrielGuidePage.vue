<template>
  <section class="space-y-6">
    <header class="space-y-2">
      <h1 class="text-3xl font-bold text-primary">Путеводитель по Тамриэлю</h1>
      <p class="opacity-80">
        Краткий свод о провинциях континента: кто их населяет, где их престолы и чем они памятны —
        дабы не прослыть невеждой в чужих краях.
      </p>
    </header>

    <label class="input flex w-full items-center gap-2">
      <UiIcon name="search" class="opacity-60" />
      <input
        v-model="query"
        type="search"
        class="grow"
        placeholder="Поиск по названию провинции..."
      />
    </label>

    <UiEmptyState
      v-if="filteredLocations.length === 0"
      icon="search"
      title="Ничего не найдено"
      description="Ни одна провинция в этом своде не совпала с запросом."
    />

    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <button
        v-for="location in filteredLocations"
        :key="location.id"
        type="button"
        class="w-full text-left"
        @click="open(location)"
      >
        <UiCard clickable>
          <div class="space-y-2">
            <div class="flex min-w-0 items-center gap-3">
              <UiIcon name="guide" :size="28" class="shrink-0 text-primary" />
              <div class="min-w-0">
                <h2 class="text-xl font-semibold">{{ location.name }}</h2>
                <p class="text-base opacity-60">{{ location.nameEn }}</p>
              </div>
            </div>

            <p class="italic opacity-80">{{ location.oneLine }}</p>

            <div class="flex flex-wrap gap-1.5">
              <UiBadge color="primary" size="sm">{{ location.peoples }}</UiBadge>
              <UiBadge color="secondary" size="sm">{{ location.capital }}</UiBadge>
            </div>

            <p class="line-clamp-2 opacity-90">{{ location.shortDesc }}</p>
          </div>
        </UiCard>
      </button>
    </div>

    <UiModal v-model="modalOpen" :title="selected?.name">
      <div v-if="selected" class="space-y-4">
        <p class="text-base opacity-60">{{ selected.nameEn }}</p>

        <dl class="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div class="space-y-0.5">
            <dt class="text-sm font-semibold uppercase tracking-wide opacity-70">Народ</dt>
            <dd>{{ selected.peoples }}</dd>
          </div>
          <div class="space-y-0.5">
            <dt class="text-sm font-semibold uppercase tracking-wide opacity-70">Столица</dt>
            <dd>{{ selected.capital }}</dd>
          </div>
          <div class="space-y-0.5">
            <dt class="text-sm font-semibold uppercase tracking-wide opacity-70">Климат</dt>
            <dd>{{ selected.climate }}</dd>
          </div>
        </dl>

        <p class="italic opacity-80">{{ selected.oneLine }}</p>

        <div class="divider my-1" />

        <UiMarkdown :source="selected.fullText" />
      </div>
    </UiModal>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { locations, type TamrielLocation } from '@/assets/data/tamriel'
import UiIcon from '@/components/ui/UiIcon.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiModal from '@/components/ui/UiModal.vue'
import UiMarkdown from '@/components/ui/UiMarkdown.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'

const query = ref('')
const selected = ref<TamrielLocation | null>(null)

const modalOpen = computed({
  get: () => selected.value !== null,
  set: (value: boolean) => {
    if (!value) selected.value = null
  },
})

const filteredLocations = computed(() => {
  const needle = query.value.trim().toLowerCase()
  if (!needle) return locations
  return locations.filter(
    (location) =>
      location.name.toLowerCase().includes(needle) ||
      location.nameEn.toLowerCase().includes(needle),
  )
})

function open(location: TamrielLocation) {
  selected.value = location
}
</script>
