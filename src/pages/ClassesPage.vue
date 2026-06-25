<template>
  <section class="space-y-6">
    <header class="space-y-2">
      <h1 class="text-3xl font-bold text-primary">Классы</h1>
      <p class="opacity-80">
        Навыки и способности по уровням мастерства. Выбери класс или найди способность через поиск.
      </p>
    </header>

    <label class="input flex w-full items-center gap-2">
      <UiIcon name="search" class="opacity-60" />
      <input
        v-model="query"
        type="search"
        class="grow"
        placeholder="Поиск по классам и способностям: невидимость, душа, броня..."
      />
    </label>

    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <button
        v-for="ruleClass in filteredClasses"
        :key="ruleClass.id"
        type="button"
        class="w-full text-left"
        @click="open(ruleClass)"
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

    <div v-if="!trimmedQuery && ruleClasses.general.length" class="space-y-2">
      <h2 class="text-lg font-semibold text-primary">Общие правила</h2>
      <RuleSectionNode
        v-for="section in ruleClasses.general"
        :key="section.id"
        :section="section"
        :open-ids="generalOpen"
        :on-toggle="toggleGeneral"
      />
    </div>

    <UiModal v-model="modalOpen" :title="selected?.name">
      <div v-if="selected" class="space-y-4">
        <button
          v-if="craftDoc"
          type="button"
          class="btn btn-outline btn-primary btn-sm"
          @click="openCraft"
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
    </UiModal>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ruleClasses, ruleDocs, type RuleClass } from '@/assets/data/rules.generated'
import UiIcon from '@/components/ui/UiIcon.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiModal from '@/components/ui/UiModal.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'
import RuleContent from '@/components/rules/RuleContent.vue'
import RuleSectionNode from '@/components/rules/RuleSectionNode.vue'

const router = useRouter()

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

const modalOpen = computed({
  get: () => selected.value !== null,
  set: (value: boolean) => {
    if (!value) selected.value = null
  },
})

const craftDoc = computed(() =>
  selected.value?.craftSlug
    ? (ruleDocs.find((doc) => doc.id === selected.value?.craftSlug) ?? null)
    : null,
)

function toggleGeneral(id: string, event: Event) {
  const open = (event.target as HTMLDetailsElement).open
  const next = new Set(generalOpen.value)
  if (open) next.add(id)
  else next.delete(id)
  generalOpen.value = next
}

function noop() {}

function open(ruleClass: RuleClass) {
  selected.value = ruleClass
}

function openCraft() {
  const slug = selected.value?.craftSlug
  if (!slug) return
  selected.value = null
  router.push({ name: 'rules', query: { doc: slug } })
}
</script>
