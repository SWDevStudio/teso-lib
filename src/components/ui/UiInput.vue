<template>
  <input
    v-model="model"
    :type="type"
    :placeholder="placeholder"
    :disabled="disabled"
    class="input w-full"
    :class="{ 'input-error': invalid }"
  />
</template>

<script setup lang="ts">
const model = defineModel<string>({ required: true })

withDefaults(
  defineProps<{
    type?: string
    placeholder?: string
    disabled?: boolean
    invalid?: boolean
  }>(),
  { type: 'text' },
)
</script>
