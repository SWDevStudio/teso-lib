<template>
  <div v-if="resolved.length" class="flex flex-wrap gap-2">
    <UiBadge v-for="label in resolved" :key="label.id" :color="label.color" size="sm">
      {{ label.name }}
    </UiBadge>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useLabelsStore } from '@/stores/labels'
import type { Label } from '@/db'
import { toBadgeColor } from '@/components/ui/types'
import UiBadge from '@/components/ui/UiBadge.vue'

const props = defineProps<{ ids: number[] }>()

const { labels } = storeToRefs(useLabelsStore())

const byId = computed(() => new Map(labels.value.map((label) => [label.id, label])))
const resolved = computed(() =>
  props.ids
    .map((id) => byId.value.get(id))
    .filter((label): label is Label => label !== undefined)
    .map((label) => ({ id: label.id, name: label.name, color: toBadgeColor(label.color) })),
)
</script>
