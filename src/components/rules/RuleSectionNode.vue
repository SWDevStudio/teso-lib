<template>
  <details
    v-if="section.level <= 2"
    :id="section.id"
    class="collapse-arrow collapse border border-base-300 bg-base-100"
    :open="openIds.has(section.id)"
    @toggle="onToggle(section.id, $event)"
  >
    <summary
      class="collapse-title min-h-0 py-3 font-semibold"
      :class="section.level === 1 ? 'text-lg' : ''"
    >
      {{ section.title }}
    </summary>
    <div class="collapse-content space-y-2">
      <RuleContent v-if="section.html" :html="section.html" />
      <RuleSectionNode
        v-for="child in section.children"
        :key="child.id"
        :section="child"
        :open-ids="openIds"
        :on-toggle="onToggle"
      />
    </div>
  </details>

  <div v-else :id="section.id" class="space-y-1">
    <component
      :is="section.level >= 4 ? 'h5' : 'h4'"
      class="pt-2 font-bold text-primary"
      :class="section.level >= 4 ? 'text-sm opacity-90' : ''"
    >
      {{ section.title }}
    </component>
    <RuleContent v-if="section.html" :html="section.html" />
    <RuleSectionNode
      v-for="child in section.children"
      :key="child.id"
      :section="child"
      :open-ids="openIds"
      :on-toggle="onToggle"
    />
  </div>
</template>

<script setup lang="ts">
import type { RuleSection } from '@/assets/data/rules.generated'
import RuleContent from './RuleContent.vue'

defineProps<{
  section: RuleSection
  openIds: Set<string>
  onToggle: (id: string, event: Event) => void
}>()
</script>
