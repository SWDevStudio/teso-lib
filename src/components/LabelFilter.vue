<template>
  <div v-if="labels.length" class="flex flex-wrap items-center gap-2">
    <button type="button" class="cursor-pointer" @click="clear">
      <UiBadge
        color="neutral"
        :outline="modelValue.length !== 0"
        :class="modelValue.length === 0 ? '' : 'opacity-60'"
      >
        <UiIcon v-if="modelValue.length === 0" name="check" :size="14" />
        Все
      </UiBadge>
    </button>
    <button
      v-for="label in labels"
      :key="label.id"
      type="button"
      class="cursor-pointer"
      @click="toggle(label.id)"
    >
      <UiBadge
        :color="label.color as BadgeColor"
        :outline="!modelValue.includes(label.id)"
        :class="modelValue.includes(label.id) ? '' : 'opacity-60'"
      >
        <UiIcon v-if="modelValue.includes(label.id)" name="check" :size="14" />
        {{ label.name }}
      </UiBadge>
    </button>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useLabelsStore } from '@/stores/labels'
import type { BadgeColor } from '@/components/ui/types'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiIcon from '@/components/ui/UiIcon.vue'

const props = defineProps<{ modelValue: number[] }>()
const emit = defineEmits<{ 'update:modelValue': [value: number[]] }>()

const { labels } = storeToRefs(useLabelsStore())

function toggle(id: number) {
  if (props.modelValue.includes(id)) {
    emit(
      'update:modelValue',
      props.modelValue.filter((labelId) => labelId !== id),
    )
  } else {
    emit('update:modelValue', [...props.modelValue, id])
  }
}

function clear() {
  emit('update:modelValue', [])
}
</script>
