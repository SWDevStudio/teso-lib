<template>
  <label class="flex cursor-pointer items-center gap-2">
    <input v-model="model" type="checkbox" class="checkbox checkbox-primary" :disabled="disabled" />
    <span v-if="label">{{ label }}</span>
  </label>
</template>

<script setup lang="ts">
const model = defineModel<boolean>({ required: true })

defineProps<{
  label?: string
  disabled?: boolean
}>()
</script>
