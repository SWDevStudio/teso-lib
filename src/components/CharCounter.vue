<template>
  <p class="mt-1 text-right text-xs tabular-nums" :class="over ? 'text-error' : 'opacity-60'">
    {{ value.length }} / {{ max }}<span v-if="over"> · не поместится в QR</span>
  </p>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ value: string; max: number }>()

const over = computed(() => props.value.length > props.max)
</script>
