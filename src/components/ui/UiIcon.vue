<template>
  <component
    :is="component"
    :width="dimension"
    :height="dimension"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : true"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { icons, type IconName } from './icons'

const props = withDefaults(
  defineProps<{
    name: IconName
    size?: number | string
    label?: string
  }>(),
  { size: '1.25em' },
)

const component = computed(() => icons[props.name])
const dimension = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))
</script>
