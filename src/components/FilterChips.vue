<template>
  <div v-if="options.length" class="flex flex-wrap items-center gap-2">
    <button v-if="allLabel" type="button" class="cursor-pointer" @click="clear">
      <UiBadge
        color="neutral"
        :outline="modelValue.length !== 0"
        :class="modelValue.length === 0 ? '' : 'opacity-60'"
      >
        <UiIcon v-if="modelValue.length === 0" name="check" :size="14" />
        {{ allLabel }}
      </UiBadge>
    </button>
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="cursor-pointer"
      @click="toggle(option.value)"
    >
      <UiBadge
        :color="option.color ?? 'neutral'"
        :outline="!isActive(option.value)"
        :class="isActive(option.value) ? '' : 'opacity-60'"
      >
        <UiIcon v-if="isActive(option.value)" name="check" :size="14" />
        {{ option.label }}
      </UiBadge>
    </button>
  </div>
</template>

<script setup lang="ts" generic="T extends string | number">
import type { FilterChipOption } from '@/components/ui/types'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiIcon from '@/components/ui/UiIcon.vue'

const props = withDefaults(
  defineProps<{
    options: FilterChipOption<T>[]
    modelValue: T[]
    allLabel?: string
  }>(),
  { allLabel: 'Все' },
)

const emit = defineEmits<{ 'update:modelValue': [value: T[]] }>()

function isActive(value: T) {
  return props.modelValue.includes(value)
}

function toggle(value: T) {
  if (isActive(value)) {
    emit(
      'update:modelValue',
      props.modelValue.filter((item) => item !== value),
    )
  } else {
    emit('update:modelValue', [...props.modelValue, value])
  }
}

function clear() {
  emit('update:modelValue', [])
}
</script>
