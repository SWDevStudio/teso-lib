<template>
  <span :class="classes">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    color?:
      | 'primary'
      | 'secondary'
      | 'accent'
      | 'neutral'
      | 'info'
      | 'success'
      | 'warning'
      | 'error'
      | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    outline?: boolean
  }>(),
  { color: 'neutral', size: 'md' },
)

const classes = computed(() => [
  'badge',
  `badge-${props.color}`,
  props.size === 'sm' ? 'badge-sm' : props.size === 'lg' ? 'badge-lg' : '',
  props.outline ? 'badge-outline' : '',
])
</script>
