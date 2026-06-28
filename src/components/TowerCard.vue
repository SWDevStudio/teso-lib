<template>
  <button type="button" class="h-full w-full text-left" @click="emit('open', tower)">
    <UiCard clickable class="h-full">
      <div class="space-y-2">
        <div class="flex items-start justify-between gap-2">
          <div class="flex min-w-0 items-center gap-3">
            <UiIcon name="tower" :size="28" class="shrink-0 text-primary" />
            <div class="min-w-0">
              <h3 class="text-xl font-semibold">{{ tower.name }}</h3>
              <p class="text-sm opacity-60">{{ tower.location }}</p>
            </div>
          </div>
          <UiBadge :color="towerStatusMeta[tower.status].color" size="sm">
            {{ towerStatusMeta[tower.status].label }}
          </UiBadge>
        </div>

        <p class="line-clamp-2 opacity-90">{{ tower.shortDesc }}</p>

        <p class="text-sm"><span class="opacity-60">Камень:</span> {{ tower.stone }}</p>
      </div>
    </UiCard>
  </button>
</template>

<script setup lang="ts">
import { towerStatusMeta, type Tower } from '@/assets/data/towers'
import UiIcon from '@/components/ui/UiIcon.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiBadge from '@/components/ui/UiBadge.vue'

defineProps<{ tower: Tower }>()
const emit = defineEmits<{ open: [tower: Tower] }>()
</script>
