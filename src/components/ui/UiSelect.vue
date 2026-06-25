<template>
  <select
    v-model="model"
    class="select w-full"
    :class="{ 'select-error': invalid }"
    :disabled="disabled"
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

const model = defineModel<string | number>({ required: true })

defineProps<{
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
}>()
</script>
