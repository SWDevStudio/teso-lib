<template>
  <UiModal v-model="open" title="Поиск по всему">
    <div class="space-y-4">
      <label class="input flex w-full items-center gap-2">
        <UiIcon name="search" class="opacity-60" />
        <input
          ref="inputEl"
          v-model="query"
          type="search"
          class="grow"
          placeholder="Боги, правила, башни, классы, персонажи..."
        />
      </label>

      <p v-if="trimmed" class="text-sm opacity-60">Найдено: {{ results.length }}</p>

      <UiEmptyState
        v-if="trimmed && results.length === 0"
        icon="search"
        title="Ничего не найдено"
        :description="`По запросу «${trimmed}» ничего нет.`"
      />

      <div v-for="group in groups" :key="group.kind" class="space-y-2">
        <h3
          class="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary"
        >
          {{ group.kind }} <span class="opacity-50">({{ group.entries.length }})</span>
        </h3>
        <button
          v-for="entry in group.entries"
          :key="entry.id"
          type="button"
          class="w-full text-left"
          @click="go(entry)"
        >
          <UiCard clickable>
            <div class="space-y-0.5">
              <div class="flex flex-wrap items-center gap-2">
                <UiIcon :name="entry.icon" :size="18" class="shrink-0 text-primary" />
                <span class="font-semibold">{{ entry.title }}</span>
                <span v-if="entry.subtitle" class="text-sm opacity-60">· {{ entry.subtitle }}</span>
              </div>
              <p v-if="snippet(entry)" class="text-sm opacity-75" v-html="snippet(entry)" />
            </div>
          </UiCard>
        </button>
      </div>
    </div>
  </UiModal>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGlobalSearch, type SearchEntry } from '@/composables/useGlobalSearch'
import UiModal from '@/components/ui/UiModal.vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'

const open = defineModel<boolean>({ required: true })
const router = useRouter()
const { query, results, groups, ensureLoaded } = useGlobalSearch()
const inputEl = ref<HTMLInputElement | null>(null)

const trimmed = computed(() => query.value.trim())

watch(open, async (isOpen) => {
  if (isOpen) {
    ensureLoaded()
    await nextTick()
    inputEl.value?.focus()
  } else {
    query.value = ''
  }
})

function go(entry: SearchEntry) {
  open.value = false
  router.push(entry.to)
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>]/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[char] ?? char,
  )
}

function snippet(entry: SearchEntry): string {
  const needle = trimmed.value.toLowerCase()
  if (!needle) return ''
  const index = entry.text.toLowerCase().indexOf(needle)
  if (index < 0) return ''
  const start = Math.max(0, index - 40)
  const end = Math.min(entry.text.length, index + needle.length + 60)
  const head = (start > 0 ? '…' : '') + escapeHtml(entry.text.slice(start, index))
  const hit = '<mark>' + escapeHtml(entry.text.slice(index, index + needle.length)) + '</mark>'
  const tail =
    escapeHtml(entry.text.slice(index + needle.length, end)) + (end < entry.text.length ? '…' : '')
  return head + hit + tail
}
</script>
