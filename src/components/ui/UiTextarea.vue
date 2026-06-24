<template>
  <textarea
    :value="modelValue"
    :placeholder="placeholder"
    :rows="rows"
    :disabled="disabled"
    class="textarea w-full"
    :class="{ 'textarea-error': invalid }"
    @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  />
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
    rows?: number
    disabled?: boolean
    invalid?: boolean
  }>(),
  { rows: 4 },
)

defineEmits<{ 'update:modelValue': [value: string] }>()
</script>
