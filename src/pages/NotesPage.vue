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

    <div v-else class="grid gap-4 md:grid-cols-2">
      <UiCard v-for="note in notes" :key="note.id">
        <h3 v-if="note.title" class="text-xl font-semibold">{{ note.title }}</h3>
        <p class="whitespace-pre-wrap leading-relaxed">{{ note.body }}</p>
        <p class="mt-2 text-xs opacity-70">{{ formatDate(note.updated_at) }}</p>
        <template #actions>
          <UiButton
            variant="ghost"
            size="sm"
            aria-label="Изменить"
            @click="openEdit(note.id, note.title, note.body)"
          >
            <UiIcon name="edit" />
          </UiButton>
          <UiButton variant="ghost" size="sm" aria-label="Удалить" @click="removeNote(note.id)">
            <UiIcon name="trash" />
          </UiButton>
        </template>
      </UiCard>
    </div>

    <UiModal v-model="modalOpen" :title="editingId !== null ? 'Изменить заметку' : 'Новая заметка'">
      <form id="note-form" class="space-y-4" @submit.prevent="onSubmit">
        <UiField label="Заголовок" :error="errors.title">
          <UiInput v-model="title" placeholder="Необязательно" :invalid="!!errors.title" />
        </UiField>
        <UiField label="Текст" :error="errors.body" required>
          <UiTextarea
            v-model="body"
            :rows="6"
            placeholder="Изложи свою мысль"
            :invalid="!!errors.body"
          />
        </UiField>
      </form>
      <template #actions>
        <UiButton variant="ghost" @click="closeModal">Отмена</UiButton>
        <UiButton type="submit" form="note-form" :loading="loading">Сохранить</UiButton>
      </template>
    </UiModal>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useForm } from 'vee-validate'
import { useNotesStore } from '@/stores/notes'
import type { NoteInput } from '@/db'
import UiButton from '@/components/ui/UiButton.vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import UiModal from '@/components/ui/UiModal.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiField from '@/components/ui/UiField.vue'
import UiInput from '@/components/ui/UiInput.vue'
import UiTextarea from '@/components/ui/UiTextarea.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'

const store = useNotesStore()
const { notes, loading } = storeToRefs(store)

const modalOpen = ref(false)
const editingId = ref<number | null>(null)

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
  modalOpen.value = true
}

function openEdit(id: number, noteTitle: string, noteBody: string) {
  editingId.value = id
  resetForm({ values: { title: noteTitle, body: noteBody } })
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
  editingId.value = null
  resetForm({ values: { title: '', body: '' } })
}

function removeNote(id: number) {
  if (!window.confirm('Удалить эту заметку? Действие необратимо.')) return
  store.remove(id)
}

const onSubmit = handleSubmit(async (vals) => {
  const input: NoteInput = { title: vals.title.trim(), body: vals.body.trim() }
  if (editingId.value !== null) {
    await store.update(editingId.value, input)
  } else {
    await store.add(input)
  }
  closeModal()
})

onMounted(() => {
  store.load()
})
</script>
