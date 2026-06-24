<template>
  <div
    class="flex flex-col items-center justify-center gap-3 rounded-box border border-dashed border-base-300 p-10 text-center"
  >
    <UiIcon v-if="icon" :name="icon" :size="48" class="opacity-40" />
    <p v-if="title" class="text-lg font-medium">{{ title }}</p>
    <p v-if="description" class="max-w-sm text-sm opacity-70">{{ description }}</p>
    <slot name="actions" />
  </div>
</template>

<script setup lang="ts">
import UiIcon from './UiIcon.vue'
import type { IconName } from './icons'

defineProps<{
  icon?: IconName
  title?: string
  description?: string
}>()
</script>
