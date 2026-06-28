<template>
  <section class="space-y-6">
    <header class="space-y-2">
      <h1 class="text-3xl font-bold text-primary">Пантеон богов</h1>
      <p class="opacity-80">
        Глазами Высокого народа и по слову Праксис-королевы Алинора: священные покровители Нирна и
        почитаемые духи предков, силы лишь терпимые в домашней молитве — и те, чьё имя под запретом.
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
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        role="tab"
        class="tab gap-2"
        :class="{ 'tab-active': activeTab === tab.id }"
        :aria-selected="activeTab === tab.id"
        @click="activeTab = tab.id"
      >
        <UiIcon :name="tabIcon[tab.id]" />
        {{ tab.label }}
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
        class="h-full w-full text-left"
        @click="open(deity)"
      >
        <UiCard clickable class="h-full">
          <div class="space-y-2">
            <div class="flex items-start justify-between gap-2">
              <div class="flex min-w-0 items-center gap-3">
                <UiIcon
                  :name="tabIcon[rankToTab[deity.rank]]"
                  :size="28"
                  class="shrink-0 text-primary"
                />
                <div class="min-w-0">
                  <h2 class="text-xl font-semibold">{{ deity.altmerName }}</h2>
                  <p class="text-base opacity-80">{{ deity.domain }}</p>
                </div>
              </div>
              <div class="flex shrink-0 flex-col items-end gap-1">
                <UiBadge :color="rankMeta[deity.rank].color" size="sm">
                  {{ rankMeta[deity.rank].label }}
                </UiBadge>
                <UiBadge :color="natureMeta[deity.nature].color" size="sm">
                  {{ natureMeta[deity.nature].label }}
                </UiBadge>
              </div>
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
          <UiBadge :color="rankMeta[selected.rank].color">
            {{ rankMeta[selected.rank].label }}
          </UiBadge>
          <UiBadge :color="natureMeta[selected.nature].color">
            {{ natureMeta[selected.nature].label }}
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
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  deities,
  rankToTab,
  type Deity,
  type DeityNature,
  type DeityRank,
  type PantheonTab,
} from '@/assets/data/pantheon'
import type { BadgeColor } from '@/components/ui/types'
import type { IconName } from '@/components/ui/icons'
import UiIcon from '@/components/ui/UiIcon.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiModal from '@/components/ui/UiModal.vue'
import UiMarkdown from '@/components/ui/UiMarkdown.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'

const natureMeta: Record<DeityNature, { label: string; color: BadgeColor }> = {
  aedra: { label: 'Аэдра', color: 'info' },
  daedra: { label: 'Даэдра', color: 'warning' },
  ancestor: { label: 'Предок-герой', color: 'accent' },
  lorkhan: { label: 'Бог-Труп', color: 'neutral' },
  celestial: { label: 'Небесная сила', color: 'secondary' },
  mortal: { label: 'Человекобог', color: 'ghost' },
  trickster: { label: 'Бог-плут', color: 'neutral' },
}

const rankMeta: Record<DeityRank, { label: string; color: BadgeColor }> = {
  sacred: { label: 'Священный', color: 'success' },
  venerated: { label: 'Почитаемый', color: 'primary' },
  tolerated: { label: 'Терпимый', color: 'accent' },
  forbidden: { label: 'Запретный', color: 'error' },
}

const tabIcon: Record<PantheonTab, IconName> = {
  revered: 'good',
  tolerated: 'faith',
  forbidden: 'bad',
}

const tabs: { id: PantheonTab; label: string }[] = [
  { id: 'revered', label: 'Почитаемые' },
  { id: 'tolerated', label: 'Терпимые' },
  { id: 'forbidden', label: 'Запретные' },
]

const query = ref('')
const activeTab = ref<PantheonTab>('revered')
const selected = ref<Deity | null>(null)

const modalOpen = computed({
  get: () => selected.value !== null,
  set: (value: boolean) => {
    if (!value) selected.value = null
  },
})

const sourceDeities = computed(() =>
  deities.filter((deity) => rankToTab[deity.rank] === activeTab.value),
)

const filteredDeities = computed(() => {
  const needle = query.value.trim().toLowerCase()
  if (!needle) return sourceDeities.value
  return sourceDeities.value.filter((deity) => deity.altmerName.toLowerCase().includes(needle))
})

function open(deity: Deity) {
  selected.value = deity
}

const route = useRoute()

watch(
  () => route.query.open,
  (openId) => {
    if (!openId) return
    const deity = deities.find((item) => item.id === openId)
    if (!deity) return
    activeTab.value = rankToTab[deity.rank]
    open(deity)
  },
  { immediate: true },
)
</script>
