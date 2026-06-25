<template>
  <section class="space-y-6">
    <header class="space-y-2">
      <h1 class="text-3xl font-bold text-primary">Башни Нирна</h1>
      <p class="opacity-80">
        Древнейшие столпы, что удерживают и стабилизируют Мундус. Каждая обладает Камнем —
        средоточием силы — и способна влиять на саму ткань реальности.
      </p>
    </header>

    <label class="input flex w-full items-center gap-2">
      <UiIcon name="search" class="opacity-60" />
      <input v-model="query" type="search" class="grow" placeholder="Поиск по названию башни..." />
    </label>

    <UiEmptyState
      v-if="trimmedQuery && filtered.length === 0"
      icon="search"
      title="Ничего не найдено"
      :description="`Ни одна башня не совпала с запросом «${trimmedQuery}».`"
    />

    <template v-else-if="trimmedQuery">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TowerCard v-for="tower in filtered" :key="tower.id" :tower="tower" @open="open" />
      </div>
    </template>

    <template v-else>
      <div class="space-y-3">
        <h2 class="text-lg font-semibold text-primary">Главные башни</h2>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TowerCard v-for="tower in majorTowers" :key="tower.id" :tower="tower" @open="open" />
        </div>
      </div>

      <div class="space-y-3">
        <h2 class="text-lg font-semibold text-primary">Малоизвестные и спорные</h2>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TowerCard v-for="tower in minorTowers" :key="tower.id" :tower="tower" @open="open" />
        </div>
      </div>
    </template>

    <UiModal v-model="modalOpen" :title="selected?.name">
      <div v-if="selected" class="space-y-4">
        <div class="flex flex-wrap items-center gap-3">
          <UiBadge :color="towerStatusMeta[selected.status].color">
            {{ towerStatusMeta[selected.status].label }}
          </UiBadge>
          <span class="text-base opacity-80">{{ selected.location }}</span>
        </div>

        <dl class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div class="space-y-0.5">
            <dt class="text-sm font-semibold uppercase tracking-wide opacity-70">Камень</dt>
            <dd>{{ selected.stone }}</dd>
          </div>
          <div v-if="selected.otherNames.length" class="space-y-0.5">
            <dt class="text-sm font-semibold uppercase tracking-wide opacity-70">Иные названия</dt>
            <dd>{{ selected.otherNames.join(', ') }}</dd>
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
import { towers, towerStatusMeta, type Tower } from '@/assets/data/towers'
import TowerCard from '@/components/TowerCard.vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiModal from '@/components/ui/UiModal.vue'
import UiMarkdown from '@/components/ui/UiMarkdown.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'

const query = ref('')
const selected = ref<Tower | null>(null)

const trimmedQuery = computed(() => query.value.trim())

const modalOpen = computed({
  get: () => selected.value !== null,
  set: (value: boolean) => {
    if (!value) selected.value = null
  },
})

const majorTowers = computed(() => towers.filter((tower) => tower.tier === 'major'))
const minorTowers = computed(() => towers.filter((tower) => tower.tier === 'minor'))

const filtered = computed(() => {
  const needle = trimmedQuery.value.toLowerCase()
  if (!needle) return towers
  return towers.filter(
    (tower) =>
      tower.name.toLowerCase().includes(needle) ||
      tower.otherNames.some((name) => name.toLowerCase().includes(needle)),
  )
})

function open(tower: Tower) {
  selected.value = tower
}
</script>
