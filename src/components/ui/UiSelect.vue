<template>
  <select
    class="select w-full"
    :class="{ 'select-error': invalid }"
    :value="modelValue"
    :disabled="disabled"
    @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
  >
    <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
    <option v-for="option in options" :key="option.value" :value="option.value">
      {{ option.label }}
    </option>
  </select>
</template>

<script setup lang="ts">
interface SelectOption {
  label: string
  value: string | number
}

defineProps<{
  modelValue: string | number
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
}>()

defineEmits<{ 'update:modelValue': [value: string] }>()
</script>
