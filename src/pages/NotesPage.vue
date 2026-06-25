<template>
  <section class="space-y-6">
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div class="space-y-1">
        <p class="text-sm uppercase tracking-[0.3em] text-primary">Личный архив</p>
        <h1 class="text-3xl font-bold md:text-4xl">Заметки</h1>
        <p class="opacity-80">Мысли, наблюдения и тайны, что не доверишь чужому уху.</p>
      </div>
      <UiButton @click="openCreate">
        <UiIcon name="plus" />
        Добавить заметку
      </UiButton>
    </header>

    <LabelFilter v-model="activeFilter" />

    <UiEmptyState
      v-if="!loading && notes.length === 0"
      icon="notes"
      title="Заметок пока нет"
      description="Запиши первую мысль — пусть она переживёт века, как и наш род."
    >
      <template #actions>
        <UiButton @click="openCreate">
          <UiIcon name="plus" />
          Добавить заметку
        </UiButton>
      </template>
    </UiEmptyState>

    <UiEmptyState
      v-else-if="filteredNotes.length === 0"
      icon="filter"
      title="По выбранным лейблам ничего не найдено"
      description="Заметки есть, но ни одна не подходит под все выбранные лейблы."
    >
      <template #actions>
        <UiButton variant="ghost" @click="clearFilter">
          <UiIcon name="filter" />
          Сбросить фильтр
        </UiButton>
      </template>
    </UiEmptyState>

    <div v-else class="grid gap-4 md:grid-cols-2">
      <UiCard v-for="note in filteredNotes" :key="note.id">
        <h3 v-if="note.title" class="text-xl font-semibold">{{ note.title }}</h3>
        <p class="whitespace-pre-wrap leading-relaxed">{{ note.body }}</p>
        <LabelTags :ids="note.labelIds" class="pt-1" />
        <p class="mt-2 text-sm opacity-70">{{ formatDate(note.updated_at) }}</p>
        <template #actions>
          <UiButton
            v-if="noteWithinLimits(note)"
            variant="ghost"
            icon
            aria-label="Поделиться QR"
            @click="openShare(note)"
          >
            <UiIcon name="qr" />
          </UiButton>
          <UiButton variant="ghost" icon aria-label="Изменить" @click="openEdit(note)">
            <UiIcon name="edit" />
          </UiButton>
          <UiButton variant="ghost" icon aria-label="Удалить" @click="removeNote(note.id)">
            <UiIcon name="trash" />
          </UiButton>
        </template>
      </UiCard>
    </div>

    <UiModal v-model="modalOpen" :title="editingId !== null ? 'Изменить заметку' : 'Новая заметка'">
      <form id="note-form" class="space-y-4" @submit.prevent="onSubmit">
        <UiField label="Заголовок" :error="errors.title">
          <UiInput v-model="title" placeholder="Необязательно" :invalid="!!errors.title" />
          <CharCounter :value="title" :max="LIMITS.note.title" />
        </UiField>
        <UiField label="Текст" :error="errors.body" required>
          <UiTextarea
            v-model="body"
            :rows="6"
            placeholder="Изложи свою мысль"
            :invalid="!!errors.body"
          />
          <CharCounter :value="body" :max="LIMITS.note.body" />
        </UiField>
        <UiField label="Лейблы">
          <LabelPicker v-model="selectedLabelIds" @deleted="onLabelDeleted" />
        </UiField>
      </form>
      <template #actions>
        <UiButton variant="ghost" @click="closeModal">Отмена</UiButton>
        <UiButton type="submit" form="note-form" :loading="loading">Сохранить</UiButton>
      </template>
    </UiModal>

    <QrShareModal v-model="qrOpen" :source="qrSource" />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useForm } from 'vee-validate'
import { useConfirm } from '@/composables/useConfirm'
import { useNotesStore } from '@/stores/notes'
import { useLabelsStore } from '@/stores/labels'
import type { Note, NoteInput } from '@/db'
import UiButton from '@/components/ui/UiButton.vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import UiModal from '@/components/ui/UiModal.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiField from '@/components/ui/UiField.vue'
import UiInput from '@/components/ui/UiInput.vue'
import UiTextarea from '@/components/ui/UiTextarea.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'
import LabelFilter from '@/components/LabelFilter.vue'
import LabelPicker from '@/components/LabelPicker.vue'
import LabelTags from '@/components/LabelTags.vue'
import QrShareModal, { type ShareSource } from '@/components/QrShareModal.vue'
import CharCounter from '@/components/CharCounter.vue'
import { TRANSFER_LIMITS as LIMITS, noteWithinLimits } from '@/lib/transfer-limits'

const store = useNotesStore()
const labelsStore = useLabelsStore()
const route = useRoute()
const { notes, loading } = storeToRefs(store)

const activeFilter = ref<number[]>([])

const filteredNotes = computed(() => {
  if (activeFilter.value.length === 0) return notes.value
  return notes.value.filter((note) =>
    activeFilter.value.every((labelId) => note.labelIds.includes(labelId)),
  )
})

function clearFilter() {
  activeFilter.value = []
}

function onLabelDeleted(id: number) {
  activeFilter.value = activeFilter.value.filter((labelId) => labelId !== id)
  store.load()
}

const modalOpen = ref(false)
const editingId = ref<number | null>(null)
const selectedLabelIds = ref<number[]>([])

const qrOpen = ref(false)
const qrSource = ref<ShareSource | null>(null)

function openShare(note: Note) {
  qrSource.value = { kind: 'note', note }
  qrOpen.value = true
}

const { handleSubmit, errors, defineField, resetForm } = useForm<{ title: string; body: string }>({
  initialValues: { title: '', body: '' },
  validationSchema: {
    body: (v: string) => (v && v.trim() ? true : 'Запишите текст заметки'),
  },
})
const [title] = defineField('title')
const [body] = defineField('body')

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

function formatDate(value: string) {
  const parsed = new Date(value.replace(' ', 'T') + 'Z')
  return Number.isNaN(parsed.getTime()) ? value : dateFormatter.format(parsed)
}

function openCreate() {
  editingId.value = null
  resetForm({ values: { title: '', body: '' } })
  selectedLabelIds.value = []
  modalOpen.value = true
}

function openEdit(note: Note) {
  editingId.value = note.id
  resetForm({ values: { title: note.title, body: note.body } })
  selectedLabelIds.value = [...note.labelIds]
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
  editingId.value = null
  selectedLabelIds.value = []
  resetForm({ values: { title: '', body: '' } })
}

const { confirm } = useConfirm()

async function removeNote(id: number) {
  const ok = await confirm({
    message: 'Удалить эту заметку? Действие необратимо.',
    confirmText: 'Удалить',
    danger: true,
  })
  if (!ok) return
  store.remove(id)
}

const onSubmit = handleSubmit(async (vals) => {
  const input: NoteInput = {
    title: vals.title.trim(),
    body: vals.body.trim(),
    labelIds: [...selectedLabelIds.value],
  }
  if (editingId.value !== null) {
    await store.update(editingId.value, input)
  } else {
    await store.add(input)
  }
  closeModal()
})

onMounted(() => {
  store.load()
  labelsStore.load()
})

watch(
  [() => route.query.open, notes],
  ([open]) => {
    if (open === undefined || open === null) return
    const id = Number(open)
    if (Number.isNaN(id)) return
    const note = notes.value.find((n) => n.id === id)
    if (note) {
      openEdit(note)
    } else if (notes.value.length === 0 && !loading.value) {
      store.load()
    }
  },
  { immediate: true },
)
</script>
