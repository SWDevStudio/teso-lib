<template>
  <div class="space-y-8">
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div class="space-y-2">
        <p class="text-sm uppercase tracking-[0.3em] text-primary">Лики Тамриэля</p>
        <h1 class="text-3xl font-bold md:text-4xl">Важные персонажи</h1>
        <p class="max-w-2xl opacity-80">
          Запомни тех, чьи деяния пересекают твой путь — друзей, врагов и тех, чью истинную природу
          скрывают чужие имена.
        </p>
      </div>
      <UiButton @click="openCreate">
        <UiIcon name="plus" />
        Добавить персонажа
      </UiButton>
    </header>

    <div v-if="labels.length" class="flex flex-wrap items-center gap-2">
      <button type="button" class="cursor-pointer" @click="clearFilter">
        <UiBadge
          color="neutral"
          :outline="activeFilter.length !== 0"
          :class="activeFilter.length === 0 ? '' : 'opacity-60'"
        >
          <UiIcon v-if="activeFilter.length === 0" name="check" :size="14" />
          Все
        </UiBadge>
      </button>
      <button
        v-for="label in labels"
        :key="label.id"
        type="button"
        class="cursor-pointer"
        @click="toggleFilter(label.id)"
      >
        <UiBadge
          :color="label.color as BadgeColor"
          :outline="!activeFilter.includes(label.id)"
          :class="activeFilter.includes(label.id) ? '' : 'opacity-60'"
        >
          <UiIcon v-if="activeFilter.includes(label.id)" name="check" :size="14" />
          {{ label.name }}
        </UiBadge>
      </button>
    </div>

    <UiEmptyState
      v-if="!loading && characters.length === 0"
      icon="characters"
      title="Пока нет персонажей"
      description="Здесь появятся записи о смертных и бессмертных, чьи судьбы стоит помнить."
    >
      <template #actions>
        <UiButton @click="openCreate">
          <UiIcon name="plus" />
          Добавить персонажа
        </UiButton>
      </template>
    </UiEmptyState>

    <UiEmptyState
      v-else-if="filteredCharacters.length === 0"
      icon="filter"
      title="По выбранным лейблам ничего не найдено"
      description="Записи есть, но ни одна не подходит под все выбранные лейблы."
    >
      <template #actions>
        <UiButton variant="ghost" @click="clearFilter">
          <UiIcon name="filter" />
          Сбросить фильтр
        </UiButton>
      </template>
    </UiEmptyState>

    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <UiCard v-for="character in filteredCharacters" :key="character.id">
        <div class="space-y-2">
          <h3 class="text-xl font-semibold">{{ character.name }}</h3>
          <p v-if="character.real_name" class="text-sm opacity-70">
            Истинное имя: {{ character.real_name }}
          </p>
          <p v-if="character.title" class="text-sm italic opacity-70">{{ character.title }}</p>
          <p v-if="character.note" class="whitespace-pre-wrap opacity-90">{{ character.note }}</p>
          <div v-if="character.labelIds.length" class="flex flex-wrap gap-2 pt-1">
            <template v-for="labelId in character.labelIds" :key="labelId">
              <UiBadge
                v-if="labelById.get(labelId)"
                :color="labelById.get(labelId)!.color as BadgeColor"
                size="sm"
              >
                {{ labelById.get(labelId)!.name }}
              </UiBadge>
            </template>
          </div>
        </div>
        <template #actions>
          <UiButton variant="ghost" size="sm" aria-label="Изменить" @click="openEdit(character.id)">
            <UiIcon name="edit" />
          </UiButton>
          <UiButton
            variant="ghost"
            size="sm"
            aria-label="Удалить"
            @click="removeCharacter(character.id)"
          >
            <UiIcon name="trash" />
          </UiButton>
        </template>
      </UiCard>
    </div>

    <UiModal v-model="modalOpen" :title="modalTitle">
      <form id="character-form" class="space-y-4" @submit.prevent="onSubmit">
        <UiField label="Имя" :error="errors.name" required>
          <UiInput v-model="name" :invalid="!!errors.name" placeholder="Как его знают в Тамриэле" />
        </UiField>

        <UiField label="Реальное имя">
          <UiInput v-model="realName" placeholder="Имя, скрытое от посторонних" />
        </UiField>

        <UiField label="Титулы">
          <UiInput v-model="title" placeholder="Звания, прозвища, регалии" />
        </UiField>

        <UiField label="Заметка">
          <UiTextarea v-model="note" placeholder="Что стоит помнить об этом лице" :rows="4" />
        </UiField>

        <UiField label="Лейблы">
          <div class="space-y-3">
            <div v-if="labels.length" class="flex flex-wrap gap-2">
              <div v-for="label in labels" :key="label.id" class="inline-flex items-center gap-1">
                <button type="button" class="cursor-pointer" @click="toggleSelectedLabel(label.id)">
                  <UiBadge
                    :color="label.color as BadgeColor"
                    :outline="!selectedLabelIds.includes(label.id)"
                    :class="selectedLabelIds.includes(label.id) ? '' : 'opacity-60'"
                  >
                    <UiIcon v-if="selectedLabelIds.includes(label.id)" name="check" :size="14" />
                    {{ label.name }}
                  </UiBadge>
                </button>
                <button
                  type="button"
                  class="text-error/60 transition hover:text-error"
                  aria-label="Удалить лейбл"
                  @click="removeLabel(label.id)"
                >
                  <UiIcon name="close" :size="14" />
                </button>
              </div>
            </div>

            <div class="flex flex-wrap items-end gap-2">
              <div class="grow basis-40">
                <UiInput v-model="newLabelName" placeholder="Новый лейбл" />
              </div>
              <UiButton
                variant="secondary"
                outline
                :disabled="!newLabelName.trim()"
                @click="createLabel"
              >
                <UiIcon name="tag" />
                Создать
              </UiButton>
            </div>
          </div>
        </UiField>
      </form>

      <template #actions>
        <UiButton variant="ghost" @click="closeModal">Отмена</UiButton>
        <UiButton type="submit" form="character-form">Сохранить</UiButton>
      </template>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useForm } from 'vee-validate'
import { useCharactersStore } from '@/stores/characters'
import { useLabelsStore } from '@/stores/labels'
import type { CharacterInput } from '@/db'
import UiButton from '@/components/ui/UiButton.vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiModal from '@/components/ui/UiModal.vue'
import UiField from '@/components/ui/UiField.vue'
import UiInput from '@/components/ui/UiInput.vue'
import UiTextarea from '@/components/ui/UiTextarea.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'

type BadgeColor = 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'

const DEFAULT_LABEL_COLOR: BadgeColor = 'primary'

interface CharacterForm {
  name: string
  realName: string
  title: string
  note: string
}

const charactersStore = useCharactersStore()
const labelsStore = useLabelsStore()
const { characters, loading } = storeToRefs(charactersStore)
const { labels } = storeToRefs(labelsStore)

const labelById = computed(() => new Map(labels.value.map((label) => [label.id, label])))

const activeFilter = ref<number[]>([])

const filteredCharacters = computed(() => {
  if (activeFilter.value.length === 0) return characters.value
  return characters.value.filter((character) =>
    activeFilter.value.every((labelId) => character.labelIds.includes(labelId)),
  )
})

function toggleFilter(labelId: number) {
  const index = activeFilter.value.indexOf(labelId)
  if (index === -1) activeFilter.value.push(labelId)
  else activeFilter.value.splice(index, 1)
}

function clearFilter() {
  activeFilter.value = []
}

const modalOpen = ref(false)
const editingId = ref<number | null>(null)
const selectedLabelIds = ref<number[]>([])
const newLabelName = ref('')

const { handleSubmit, errors, defineField, resetForm } = useForm<CharacterForm>({
  initialValues: { name: '', realName: '', title: '', note: '' },
  validationSchema: {
    name: (value: string) => (value && value.trim() ? true : 'Назови имя сего смертного'),
  },
})

const [name] = defineField('name')
const [realName] = defineField('realName')
const [title] = defineField('title')
const [note] = defineField('note')

const modalTitle = computed(() => (editingId.value === null ? 'Внести персонажа' : 'Изменить запись'))

function toggleSelectedLabel(labelId: number) {
  const index = selectedLabelIds.value.indexOf(labelId)
  if (index === -1) selectedLabelIds.value.push(labelId)
  else selectedLabelIds.value.splice(index, 1)
}

async function createLabel() {
  const trimmed = newLabelName.value.trim()
  if (!trimmed) return
  const id = await labelsStore.add(trimmed, DEFAULT_LABEL_COLOR)
  if (id > 0 && !selectedLabelIds.value.includes(id)) selectedLabelIds.value.push(id)
  newLabelName.value = ''
}

async function removeLabel(id: number) {
  if (!window.confirm('Удалить этот лейбл? Он исчезнет у всех персонажей.')) return
  await labelsStore.remove(id)
  selectedLabelIds.value = selectedLabelIds.value.filter((labelId) => labelId !== id)
  activeFilter.value = activeFilter.value.filter((labelId) => labelId !== id)
  await charactersStore.load()
}

function closeModal() {
  modalOpen.value = false
  editingId.value = null
  selectedLabelIds.value = []
  newLabelName.value = ''
  resetForm()
}

function openCreate() {
  resetForm()
  editingId.value = null
  selectedLabelIds.value = []
  newLabelName.value = ''
  modalOpen.value = true
}

function openEdit(id: number) {
  const character = characters.value.find((item) => item.id === id)
  if (!character) return
  editingId.value = id
  resetForm({
    values: {
      name: character.name,
      realName: character.real_name ?? '',
      title: character.title ?? '',
      note: character.note ?? '',
    },
  })
  selectedLabelIds.value = [...character.labelIds]
  newLabelName.value = ''
  modalOpen.value = true
}

const onSubmit = handleSubmit(async (values) => {
  const input: CharacterInput = {
    name: values.name.trim(),
    real_name: values.realName.trim() || null,
    title: values.title.trim() || null,
    note: values.note.trim() || null,
    labelIds: [...selectedLabelIds.value],
  }
  if (editingId.value === null) await charactersStore.add(input)
  else await charactersStore.update(editingId.value, input)
  closeModal()
})

async function removeCharacter(id: number) {
  if (!window.confirm('Удалить этого персонажа? Действие необратимо.')) return
  await charactersStore.remove(id)
}

onMounted(() => {
  charactersStore.load()
  labelsStore.load()
})
</script>
