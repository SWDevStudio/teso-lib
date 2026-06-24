<template>
  <section class="space-y-6">
    <header class="space-y-2">
      <h1 class="text-3xl font-bold text-primary">Квенты</h1>
      <p class="opacity-80">
        Жизнеописания героев Тамриэля — их род, путь и тайны, что стоит знать перед встречей.
      </p>
    </header>

    <div class="space-y-4">
      <button
        v-for="quenta in quentas"
        :key="quenta.id"
        type="button"
        class="w-full text-left"
        @click="open(quenta)"
      >
        <UiCard clickable>
          <div class="space-y-2">
            <div class="flex items-start justify-between gap-3">
              <div class="flex min-w-0 items-center gap-3">
                <UiIcon name="quenta" :size="28" class="shrink-0 text-primary" />
                <div class="min-w-0">
                  <h2 class="text-xl font-semibold">{{ quenta.name }}</h2>
                  <p class="text-base opacity-80">{{ quenta.race }} · {{ quenta.origin }}</p>
                </div>
              </div>
              <UiBadge color="primary" size="sm" outline>{{ quenta.birth }}</UiBadge>
            </div>
            <p class="line-clamp-3 opacity-90">{{ quenta.summary }}</p>
          </div>
        </UiCard>
      </button>
    </div>

    <UiModal v-model="modalOpen" :title="selected?.name">
      <div v-if="selected" class="space-y-4">
        <p class="text-base opacity-80">
          {{ selected.race }} · {{ selected.birth }} · {{ selected.origin }}
        </p>
        <div class="divider my-1" />
        <UiMarkdown :source="selected.body" />
      </div>
    </UiModal>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { quentas, type Quenta } from '@/assets/data/quentas'
import UiIcon from '@/components/ui/UiIcon.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiModal from '@/components/ui/UiModal.vue'
import UiMarkdown from '@/components/ui/UiMarkdown.vue'

const selected = ref<Quenta | null>(null)

const modalOpen = computed({
  get: () => selected.value !== null,
  set: (value: boolean) => {
    if (!value) selected.value = null
  },
})

function open(quenta: Quenta) {
  selected.value = quenta
}
</script>
