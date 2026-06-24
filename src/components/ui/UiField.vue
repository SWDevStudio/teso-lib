<template>
  <div class="w-full">
    <label v-if="label" class="mb-1 block text-sm font-medium">
      {{ label }}
      <span v-if="required" class="text-error">*</span>
    </label>
    <slot />
    <p v-if="error" class="mt-1 text-sm text-error">{{ error }}</p>
    <p v-else-if="hint" class="mt-1 text-sm opacity-60">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label?: string
  error?: string
  hint?: string
  required?: boolean
}>()
</script>
