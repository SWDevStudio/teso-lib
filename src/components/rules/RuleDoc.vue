<template>
  <div class="space-y-4">
    <RuleContent v-if="doc.intro" :html="doc.intro" />

    <div class="space-y-2">
      <template v-for="section in doc.sections" :key="section.id">
        <h3
          v-if="!section.html"
          class="border-b border-base-300 pt-3 pb-1 text-lg font-bold text-primary"
        >
          {{ section.title }}
        </h3>

        <details
          v-else
          :id="section.id"
          class="collapse-arrow collapse border border-base-300 bg-base-100"
          :open="openIds.has(section.id)"
          @toggle="onToggle(section, $event)"
        >
          <summary class="collapse-title min-h-0 py-3 font-semibold">{{ section.title }}</summary>
          <div class="collapse-content">
            <RuleContent :html="section.html" />
          </div>
        </details>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import type { RuleDoc, RuleSection } from '@/assets/data/rules.generated'
import RuleContent from './RuleContent.vue'

const props = defineProps<{ doc: RuleDoc; targetSectionId?: string | null }>()

const openIds = ref(new Set<string>())

watch(
  () => props.targetSectionId,
  (id) => {
    if (id) openIds.value = new Set([...openIds.value, id])
  },
  { immediate: true },
)

function onToggle(section: RuleSection, event: Event) {
  const open = (event.target as HTMLDetailsElement).open
  const next = new Set(openIds.value)
  if (open) next.add(section.id)
  else next.delete(section.id)
  openIds.value = next
}

onMounted(async () => {
  if (!props.targetSectionId) return
  await nextTick()
  document.getElementById(props.targetSectionId)?.scrollIntoView({ block: 'start' })
})
</script>
