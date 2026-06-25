<template>
  <FilterChips :options="options" :model-value="modelValue" @update:model-value="onChange" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useLabelsStore } from '@/stores/labels'
import { toBadgeColor, type FilterChipOption } from '@/components/ui/types'
import FilterChips from '@/components/FilterChips.vue'

defineProps<{ modelValue: number[] }>()
const emit = defineEmits<{ 'update:modelValue': [value: number[]] }>()

const { labels } = storeToRefs(useLabelsStore())

const options = computed<FilterChipOption<number>[]>(() =>
  labels.value.map((label) => ({
    value: label.id,
    label: label.name,
    color: toBadgeColor(label.color),
  })),
)

function onChange(value: number[]) {
  emit('update:modelValue', value)
}
</script>
