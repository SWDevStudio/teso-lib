<template>
  <button :type="type" :class="classes" :disabled="disabled || loading">
    <span v-if="loading" class="loading loading-spinner loading-sm" />
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'accent' | 'neutral' | 'ghost' | 'error'
    size?: 'sm' | 'md' | 'lg'
    type?: 'button' | 'submit' | 'reset'
    block?: boolean
    outline?: boolean
    disabled?: boolean
    loading?: boolean
  }>(),
  { variant: 'primary', size: 'md', type: 'button' },
)

const classes = computed(() => [
  'btn',
  `btn-${props.variant}`,
  props.size === 'sm' ? 'btn-sm' : props.size === 'lg' ? 'btn-lg' : '',
  props.block ? 'btn-block' : '',
  props.outline ? 'btn-outline' : '',
])
</script>
