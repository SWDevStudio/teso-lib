<template>
  <section class="space-y-6">
    <header class="space-y-2">
      <h1 class="text-3xl font-bold text-primary">Пантеон богов</h1>
      <p class="opacity-80">
        Глазами Высокого народа: те, кого мы чтим как предков-духов, и те, кого отвергаем как
        порождения обмана и распада.
      </p>
    </header>

    <label class="input flex w-full items-center gap-2">
      <UiIcon name="search" class="opacity-60" />
      <input
        v-model="query"
        type="search"
        class="grow"
        placeholder="Поиск по альтмерскому имени..."
      />
    </label>

    <div role="tablist" class="tabs tabs-box">
      <button
        type="button"
        role="tab"
        class="tab gap-2"
        :class="{ 'tab-active': activeCategory === 'good' }"
        :aria-selected="activeCategory === 'good'"
        @click="activeCategory = 'good'"
      >
        <UiIcon name="good" />
        Почитаемые
      </button>
      <button
        type="button"
        role="tab"
        class="tab gap-2"
        :class="{ 'tab-active': activeCategory === 'bad' }"
        :aria-selected="activeCategory === 'bad'"
        @click="activeCategory = 'bad'"
      >
        <UiIcon name="bad" />
        Отвергнутые
      </button>
    </div>

    <UiEmptyState
      v-if="filteredDeities.length === 0"
      icon="search"
      title="Никого не найдено"
      description="Ни одно имя в этом списке не совпало с запросом."
    />

    <div v-else role="tabpanel" class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <button
        v-for="deity in filteredDeities"
        :key="deity.id"
        type="button"
        class="w-full text-left"
        @click="open(deity)"
      >
        <UiCard clickable>
          <div class="space-y-2">
            <div class="flex items-start justify-between gap-2">
              <div class="flex min-w-0 items-center gap-3">
                <UiIcon
                  :name="deity.category === 'good' ? 'good' : 'bad'"
                  :size="28"
                  class="shrink-0 text-primary"
                />
                <div class="min-w-0">
                  <h2 class="text-xl font-semibold">{{ deity.altmerName }}</h2>
                  <p class="text-base opacity-80">{{ deity.domain }}</p>
                </div>
              </div>
              <UiBadge :color="deity.revered ? 'success' : 'error'" size="sm">
                {{ deity.revered ? 'Почитаем' : 'Отвергнут' }}
              </UiBadge>
            </div>

            <p class="line-clamp-2 opacity-90">{{ deity.shortDesc }}</p>

            <div v-if="deity.otherNames.length" class="flex flex-wrap gap-1.5">
              <span
                v-for="other in deity.otherNames"
                :key="other.race"
                class="max-w-full rounded-md border border-base-300 bg-base-200 px-2 py-1 text-sm leading-snug"
              >
                {{ other.race }} — {{ other.name }}
              </span>
            </div>
          </div>
        </UiCard>
      </button>
    </div>

    <UiModal v-model="modalOpen" :title="selected?.altmerName">
      <div v-if="selected" class="space-y-4">
        <div class="flex flex-wrap items-center gap-3">
          <UiBadge :color="selected.revered ? 'success' : 'error'">
            {{ selected.revered ? 'Почитаем' : 'Отвергнут' }}
          </UiBadge>
          <span class="text-base opacity-80">{{ selected.domain }}</span>
        </div>

        <p class="italic opacity-80">{{ selected.oneLine }}</p>

        <div v-if="selected.otherNames.length" class="space-y-1">
          <h4 class="text-sm font-semibold uppercase tracking-wide opacity-70">
            Имена у других народов
          </h4>
          <ul class="space-y-1">
            <li
              v-for="other in selected.otherNames"
              :key="other.race"
              class="flex flex-col gap-0.5 sm:flex-row sm:gap-2"
            >
              <span class="font-medium opacity-70">{{ other.race }}</span>
              <span class="hidden opacity-50 sm:inline">→</span>
              <span>{{ other.name }}</span>
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
import { computed, ref } from 'vue'
import { goodDeities, badDeities, type Deity } from '@/assets/data/pantheon'
import UiIcon from '@/components/ui/UiIcon.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiModal from '@/components/ui/UiModal.vue'
import UiMarkdown from '@/components/ui/UiMarkdown.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'

type Category = 'good' | 'bad'

const query = ref('')
const activeCategory = ref<Category>('good')
const selected = ref<Deity | null>(null)

const modalOpen = computed({
  get: () => selected.value !== null,
  set: (value: boolean) => {
    if (!value) selected.value = null
  },
})

const sourceDeities = computed(() => (activeCategory.value === 'good' ? goodDeities : badDeities))

const filteredDeities = computed(() => {
  const needle = query.value.trim().toLowerCase()
  if (!needle) return sourceDeities.value
  return sourceDeities.value.filter((deity) => deity.altmerName.toLowerCase().includes(needle))
})

function open(deity: Deity) {
  selected.value = deity
}
</script>
