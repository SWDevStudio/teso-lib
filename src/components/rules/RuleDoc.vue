<template>
  <div class="space-y-4">
    <RuleContent v-if="doc.intro" :html="doc.intro" />
    <div class="space-y-2">
      <RuleSectionNode
        v-for="section in doc.sections"
        :key="section.id"
        :section="section"
        :open-ids="openIds"
        :on-toggle="onToggle"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import type { RuleDoc, RuleSection } from '@/assets/data/rules.generated'
import RuleContent from './RuleContent.vue'
import RuleSectionNode from './RuleSectionNode.vue'

const props = defineProps<{ doc: RuleDoc; targetSectionId?: string | null }>()

const openIds = ref(new Set<string>())

function onToggle(id: string, event: Event) {
  const open = (event.target as HTMLDetailsElement).open
  const next = new Set(openIds.value)
  if (open) next.add(id)
  else next.delete(id)
  openIds.value = next
}

function findPath(sections: RuleSection[], id: string, acc: string[] = []): string[] | null {
  for (const section of sections) {
    const path = [...acc, section.id]
    if (section.id === id) return path
    const found = findPath(section.children, id, path)
    if (found) return found
  }
  return null
}

function openTarget(id: string | null | undefined) {
  if (!id) return
  const path = findPath(props.doc.sections, id)
  if (!path) return
  const next = new Set(openIds.value)
  for (const entry of path) next.add(entry)
  openIds.value = next
}

watch(() => props.targetSectionId, openTarget, { immediate: true })

onMounted(async () => {
  if (!props.targetSectionId) return
  await nextTick()
  document.getElementById(props.targetSectionId)?.scrollIntoView({ block: 'start' })
})
</script>
