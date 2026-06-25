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

    <LabelFilter v-model="activeFilter" />

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
          <h3 class="text-xl font-semibold">
            <span v-if="character.title" class="font-normal opacity-80"
              >{{ character.title }}
            </span>
            {{ character.name }}
          </h3>
          <p v-if="character.note" class="whitespace-pre-wrap opacity-90">{{ character.note }}</p>
          <p v-if="character.real_name" class="text-sm opacity-60">
            Истинное имя: {{ character.real_name }}
          </p>
          <LabelTags :ids="character.labelIds" class="pt-1" />
        </div>
        <template #actions>
          <UiButton
            v-if="characterWithinLimits(character)"
            variant="ghost"
            icon
            aria-label="Поделиться QR"
            @click="openShare(character)"
          >
            <UiIcon name="qr" />
          </UiButton>
          <UiButton
            variant="ghost"
            icon
            :aria-label="copiedId === character.id ? 'Имя скопировано' : 'Копировать имя'"
            @click="copyName(character)"
          >
            <UiIcon :name="copiedId === character.id ? 'check' : 'copy'" />
          </UiButton>
          <UiButton variant="ghost" icon aria-label="Изменить" @click="openEdit(character.id)">
            <UiIcon name="edit" />
          </UiButton>
          <UiButton
            variant="ghost"
            icon
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
          <CharCounter :value="name" :max="LIMITS.character.name" />
        </UiField>

        <UiField label="Реальное имя">
          <UiInput v-model="realName" placeholder="Имя, скрытое от посторонних" />
          <CharCounter :value="realName" :max="LIMITS.character.realName" />
        </UiField>

        <UiField label="Титулы">
          <UiInput v-model="title" placeholder="Звания, прозвища, регалии" />
          <CharCounter :value="title" :max="LIMITS.character.title" />
        </UiField>

        <UiField label="Заметка">
          <UiTextarea v-model="note" placeholder="Что стоит помнить об этом лице" :rows="4" />
          <CharCounter :value="note" :max="LIMITS.character.note" />
        </UiField>

        <UiField label="Лейблы">
          <LabelPicker v-model="selectedLabelIds" @deleted="onLabelDeleted" />
        </UiField>
      </form>

      <template #actions>
        <UiButton variant="ghost" @click="closeModal">Отмена</UiButton>
        <UiButton type="submit" form="character-form">Сохранить</UiButton>
      </template>
    </UiModal>

    <QrShareModal v-model="qrOpen" :source="qrSource" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useForm } from 'vee-validate'
import { useClipboard } from '@vueuse/core'
import { useConfirm } from '@/composables/useConfirm'
import { useCharactersStore } from '@/stores/characters'
import { useLabelsStore } from '@/stores/labels'
import type { Character, CharacterInput } from '@/db'
import UiButton from '@/components/ui/UiButton.vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiModal from '@/components/ui/UiModal.vue'
import UiField from '@/components/ui/UiField.vue'
import UiInput from '@/components/ui/UiInput.vue'
import UiTextarea from '@/components/ui/UiTextarea.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'
import LabelFilter from '@/components/LabelFilter.vue'
import LabelPicker from '@/components/LabelPicker.vue'
import LabelTags from '@/components/LabelTags.vue'
import QrShareModal, { type ShareSource } from '@/components/QrShareModal.vue'
import CharCounter from '@/components/CharCounter.vue'
import { TRANSFER_LIMITS as LIMITS, characterWithinLimits } from '@/lib/transfer-limits'

interface CharacterForm {
  name: string
  realName: string
  title: string
  note: string
}

const route = useRoute()
const charactersStore = useCharactersStore()
const labelsStore = useLabelsStore()
const { characters, loading } = storeToRefs(charactersStore)

const { copy } = useClipboard()
const copiedId = ref<number | null>(null)

function displayName(character: Character) {
  return character.title ? `${character.title} ${character.name}` : character.name
}

function copyName(character: Character) {
  copy(displayName(character))
  copiedId.value = character.id
  window.setTimeout(() => {
    if (copiedId.value === character.id) copiedId.value = null
  }, 1500)
}

const activeFilter = ref<number[]>([])

const filteredCharacters = computed(() => {
  if (activeFilter.value.length === 0) return characters.value
  return characters.value.filter((character) =>
    activeFilter.value.every((labelId) => character.labelIds.includes(labelId)),
  )
})

function clearFilter() {
  activeFilter.value = []
}

function onLabelDeleted(id: number) {
  activeFilter.value = activeFilter.value.filter((labelId) => labelId !== id)
  charactersStore.load()
}

const modalOpen = ref(false)
const editingId = ref<number | null>(null)
const selectedLabelIds = ref<number[]>([])

const qrOpen = ref(false)
const qrSource = ref<ShareSource | null>(null)

function openShare(character: Character) {
  qrSource.value = { kind: 'character', character }
  qrOpen.value = true
}

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

const modalTitle = computed(() =>
  editingId.value === null ? 'Внести персонажа' : 'Изменить запись',
)

function closeModal() {
  modalOpen.value = false
  editingId.value = null
  selectedLabelIds.value = []
  resetForm()
}

function openCreate() {
  resetForm()
  editingId.value = null
  selectedLabelIds.value = []
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
  modalOpen.value = true
}

watch(
  [() => route.query.open, characters],
  ([openId]) => {
    if (typeof openId !== 'string') return
    if (characters.value.length === 0) {
      charactersStore.load()
      return
    }
    const character = characters.value.find((item) => String(item.id) === openId)
    if (character) openEdit(character.id)
  },
  { immediate: true },
)

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

const { confirm } = useConfirm()

async function removeCharacter(id: number) {
  const ok = await confirm({
    message: 'Удалить этого персонажа? Действие необратимо.',
    confirmText: 'Удалить',
    danger: true,
  })
  if (!ok) return
  await charactersStore.remove(id)
}

onMounted(() => {
  charactersStore.load()
  labelsStore.load()
})
</script>
