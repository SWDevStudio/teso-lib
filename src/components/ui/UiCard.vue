<template>
  <div
    class="card border border-base-300 bg-base-100 shadow-md"
    :class="clickable ? 'cursor-pointer transition-shadow hover:shadow-lg' : ''"
  >
    <div class="card-body">
      <slot name="header" />
      <h3 v-if="title" class="card-title">{{ title }}</h3>
      <slot />
      <div v-if="$slots.actions" class="card-actions justify-end">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    clickable?: boolean
  }>(),
  { clickable: false },
)
</script>
