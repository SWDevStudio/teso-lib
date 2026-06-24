<template>
  <FilterChips :options="options" :model-value="modelValue" @update:model-value="onChange" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useLabelsStore } from '@/stores/labels'
import type { BadgeColor, FilterChipOption } from '@/components/ui/types'
import FilterChips from '@/components/FilterChips.vue'

const props = defineProps<{ modelValue: number[] }>()
const emit = defineEmits<{ 'update:modelValue': [value: number[]] }>()

const { labels } = storeToRefs(useLabelsStore())

const options = computed<FilterChipOption[]>(() =>
  labels.value.map((label) => ({
    value: label.id,
    label: label.name,
    color: label.color as BadgeColor,
  })),
)

function onChange(value: (string | number)[]) {
  emit(
    'update:modelValue',
    value.map((item) => Number(item)),
  )
}
</script>
