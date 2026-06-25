<template>
  <div>
    <div v-if="selected" class="space-y-4">
      <button
        type="button"
        class="btn btn-ghost btn-sm min-h-11 gap-1 px-2"
        @click="selected = null"
      >
        <UiIcon name="back" :size="18" />
        К классам
      </button>

      <div class="flex items-center gap-3">
        <UiIcon :name="selected.icon" :size="36" class="text-primary" />
        <h3 class="text-2xl font-bold">{{ selected.name }}</h3>
      </div>

      <button
        v-if="craftDoc"
        type="button"
        class="btn btn-outline btn-primary btn-sm"
        @click="emit('open-craft', selected.craftSlug!)"
      >
        <UiIcon :name="craftDoc.icon" :size="18" />
        Полные правила: {{ craftDoc.title }}
      </button>

      <RuleContent v-if="selected.html" :html="selected.html" />

      <div class="space-y-2">
        <RuleSectionNode
          v-for="section in selected.sections"
          :key="section.id"
          :section="section"
          :open-ids="emptyOpen"
          :on-toggle="noop"
        />
      </div>
    </div>

    <div v-else class="space-y-4">
      <label class="input flex w-full items-center gap-2">
        <UiIcon name="search" class="opacity-60" />
        <input
          v-model="query"
          type="search"
          class="grow"
          placeholder="Поиск по классам и способностям..."
        />
      </label>

      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <button
          v-for="ruleClass in filteredClasses"
          :key="ruleClass.id"
          type="button"
          class="w-full text-left"
          @click="selected = ruleClass"
        >
          <UiCard clickable>
            <div class="flex flex-col items-center gap-2 py-2 text-center">
              <UiIcon :name="ruleClass.icon" :size="40" class="text-primary" />
              <span class="font-semibold">{{ ruleClass.name }}</span>
            </div>
          </UiCard>
        </button>
      </div>

      <UiEmptyState
        v-if="filteredClasses.length === 0"
        icon="search"
        title="Ничего не найдено"
        :description="`По запросу «${trimmedQuery}» среди классов ничего нет.`"
      />

      <div v-if="!trimmedQuery && ruleClasses.general.length" class="space-y-2 pt-2">
        <h3 class="text-lg font-semibold text-primary">Общие правила</h3>
        <RuleSectionNode
          v-for="section in ruleClasses.general"
          :key="section.id"
          :section="section"
          :open-ids="generalOpen"
          :on-toggle="toggleGeneral"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ruleClasses, ruleDocs, type RuleClass } from '@/assets/data/rules.generated'
import { useBackHandler } from '@/composables/useBackButton'
import UiIcon from '@/components/ui/UiIcon.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'
import RuleContent from './RuleContent.vue'
import RuleSectionNode from './RuleSectionNode.vue'

const emit = defineEmits<{ 'open-craft': [slug: string] }>()

const query = ref('')
const selected = ref<RuleClass | null>(null)
const generalOpen = ref(new Set<string>())
const emptyOpen = ref(new Set<string>())

const trimmedQuery = computed(() => query.value.trim())

const filteredClasses = computed(() => {
  const needle = trimmedQuery.value.toLowerCase()
  if (!needle) return ruleClasses.classes
  return ruleClasses.classes.filter(
    (item) => item.name.toLowerCase().includes(needle) || item.text.toLowerCase().includes(needle),
  )
})

const craftDoc = computed(() =>
  selected.value?.craftSlug
    ? (ruleDocs.find((doc) => doc.id === selected.value?.craftSlug) ?? null)
    : null,
)

useBackHandler(
  () => selected.value !== null,
  () => {
    selected.value = null
  },
)

function toggleGeneral(id: string, event: Event) {
  const open = (event.target as HTMLDetailsElement).open
  const next = new Set(generalOpen.value)
  if (open) next.add(id)
  else next.delete(id)
  generalOpen.value = next
}

function noop() {}
</script>
