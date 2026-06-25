<template>
  <textarea
    v-model="model"
    :placeholder="placeholder"
    :rows="rows"
    :disabled="disabled"
    class="textarea w-full"
    :class="{ 'textarea-error': invalid }"
  />
</template>

<script setup lang="ts">
const model = defineModel<string>({ required: true })

withDefaults(
  defineProps<{
    placeholder?: string
    rows?: number
    disabled?: boolean
    invalid?: boolean
  }>(),
  { rows: 4 },
)
</script>
