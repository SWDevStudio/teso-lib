<template>
  <div class="space-y-4">
    <div v-for="row in alphabetRows" :key="row.label" class="space-y-1.5">
      <h4 class="text-xs font-semibold uppercase tracking-wide opacity-60">{{ row.label }}</h4>
      <div class="grid grid-cols-6 gap-1.5 sm:grid-cols-8">
        <div
          v-for="char in row.chars"
          :key="char"
          class="flex flex-col items-center gap-1 rounded-md border border-base-300 bg-base-200 px-1 pb-2 pt-1.5"
          @click="emit('glyphClick', char)"
        >
          <span class="text-xs leading-none opacity-50">{{ char }}</span>
          <GlyphText :text="char" :font="font" class="text-3xl" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { alphabetRows } from '@/assets/data/alphabets'
import GlyphText from './GlyphText.vue'

defineProps<{ font: string }>()
const emit = defineEmits<{ glyphClick: [char: string] }>()
</script>
