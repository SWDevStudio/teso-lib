<template>
  <section class="space-y-6">
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div class="space-y-2">
        <h1 class="text-3xl font-bold text-primary">Квенты</h1>
        <p class="max-w-2xl opacity-80">
          Жизнеописания героев Тамриэля — их род, путь и тайны, что стоит знать перед встречей.
        </p>
      </div>
      <UiButton @click="openCreate">
        <UiIcon name="plus" />
        Добавить квенту
      </UiButton>
    </header>

    <UiEmptyState
      v-if="!loading && quentas.length === 0"
      icon="quenta"
      title="Пока нет квент"
      description="Запиши жизнеописание героя — или прими готовую квенту по QR-коду."
    >
      <template #actions>
        <UiButton @click="openCreate">
          <UiIcon name="plus" />
          Добавить квенту
        </UiButton>
      </template>
    </UiEmptyState>

    <div v-else class="space-y-4">
      <button
        v-for="quenta in quentas"
        :key="quenta.id"
        type="button"
        class="w-full text-left"
        @click="selected = quenta"
      >
        <UiCard clickable>
          <div class="space-y-2">
            <div class="flex items-start justify-between gap-3">
              <div class="flex min-w-0 items-center gap-3">
                <UiIcon name="quenta" :size="28" class="shrink-0 text-primary" />
                <div class="min-w-0">
                  <h2 class="text-xl font-semibold">{{ quenta.name }}</h2>
                  <p class="text-base opacity-80">{{ raceOrigin(quenta) }}</p>
                </div>
              </div>
              <UiBadge v-if="quenta.birth" color="primary" size="sm" outline class="shrink-0">
                {{ quenta.birth }}
              </UiBadge>
            </div>
            <p v-if="quenta.summary" class="line-clamp-3 opacity-90">{{ quenta.summary }}</p>
          </div>
        </UiCard>
      </button>
    </div>

    <UiModal v-model="detailOpen" :title="selected?.name">
      <article v-if="selected" class="space-y-4">
        <div class="flex flex-wrap items-center gap-2 text-sm">
          <UiBadge v-if="selected.race" color="primary" size="sm" outline>{{ selected.race }}</UiBadge>
          <UiBadge v-if="selected.birth" color="secondary" size="sm" outline>
            {{ selected.birth }}
          </UiBadge>
          <span v-if="selected.origin" class="opacity-70">{{ selected.origin }}</span>
        </div>
        <p v-if="selected.summary" class="border-l-2 border-primary/40 pl-3 italic opacity-80">
          {{ selected.summary }}
        </p>
        <div class="divider my-1" />
        <UiMarkdown :source="selected.body" />
      </article>

      <template #actions>
        <UiButton
          v-if="selected && shareableIds.has(selected.id)"
          variant="ghost"
          @click="shareSelected"
        >
          <UiIcon name="qr" />
          Поделиться
        </UiButton>
        <span v-else class="self-center px-1 text-xs opacity-60">Слишком длинная для QR</span>
        <UiButton variant="error" outline @click="removeSelected">
          <UiIcon name="trash" />
          Удалить
        </UiButton>
      </template>
    </UiModal>

    <UiModal v-model="createOpen" title="Новая квента">
      <form id="quenta-form" class="space-y-4" @submit.prevent="onSubmit">
        <UiField label="Имя" :error="errors.name" required>
          <UiInput v-model="name" :invalid="!!errors.name" placeholder="Как зовут героя" />
        </UiField>
        <div class="grid gap-4 sm:grid-cols-3">
          <UiField label="Раса">
            <UiInput v-model="race" placeholder="Альтмер, данмер…" />
          </UiField>
          <UiField label="Рождение">
            <UiInput v-model="birth" placeholder="95 год 4Э" />
          </UiField>
          <UiField label="Происхождение">
            <UiInput v-model="origin" placeholder="Откуда родом" />
          </UiField>
        </div>
        <UiField label="Краткое описание">
          <UiTextarea v-model="summary" :rows="3" placeholder="Одно-два предложения для карточки" />
        </UiField>
        <UiField label="Жизнеописание" hint="Поддерживается Markdown">
          <UiTextarea v-model="body" :rows="10" placeholder="Полная история героя…" />
        </UiField>
      </form>
      <template #actions>
        <UiButton variant="ghost" @click="createOpen = false">Отмена</UiButton>
        <UiButton type="submit" form="quenta-form" :loading="loading">Сохранить</UiButton>
      </template>
    </UiModal>

    <QrShareModal v-model="qrOpen" :source="qrSource" />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useForm } from 'vee-validate'
import { useConfirm } from '@/composables/useConfirm'
import { useQuentasStore } from '@/stores/quentas'
import type { Quenta } from '@/db'
import { fitsInQr, type QuentaTransfer } from '@/lib/qr-transfer'
import UiButton from '@/components/ui/UiButton.vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiModal from '@/components/ui/UiModal.vue'
import UiField from '@/components/ui/UiField.vue'
import UiInput from '@/components/ui/UiInput.vue'
import UiTextarea from '@/components/ui/UiTextarea.vue'
import UiMarkdown from '@/components/ui/UiMarkdown.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'
import QrShareModal, { type ShareSource } from '@/components/QrShareModal.vue'

interface QuentaForm {
  name: string
  race: string
  birth: string
  origin: string
  summary: string
  body: string
}

const store = useQuentasStore()
const { quentas, loading } = storeToRefs(store)
const { confirm } = useConfirm()

const selected = ref<Quenta | null>(null)
const detailOpen = computed({
  get: () => selected.value !== null,
  set: (value: boolean) => {
    if (!value) selected.value = null
  },
})

function raceOrigin(quenta: Quenta) {
  return [quenta.race, quenta.origin].filter(Boolean).join(' · ')
}

function toTransfer(quenta: Quenta): QuentaTransfer {
  return {
    kind: 'quenta',
    name: quenta.name,
    race: quenta.race,
    birth: quenta.birth,
    origin: quenta.origin,
    summary: quenta.summary,
    body: quenta.body,
  }
}

const shareableIds = ref<Set<number>>(new Set())
watch(
  quentas,
  async (list) => {
    const fits = await Promise.all(list.map((q) => fitsInQr(toTransfer(q))))
    shareableIds.value = new Set(list.filter((_, i) => fits[i]).map((q) => q.id))
  },
  { immediate: true },
)

const qrOpen = ref(false)
const qrSource = ref<ShareSource | null>(null)

function shareSelected() {
  if (!selected.value) return
  const quenta = selected.value
  selected.value = null
  qrSource.value = { kind: 'quenta', quenta }
  qrOpen.value = true
}

async function removeSelected() {
  if (!selected.value) return
  const ok = await confirm({
    message: 'Удалить эту квенту? Действие необратимо.',
    confirmText: 'Удалить',
    danger: true,
  })
  if (!ok) return
  await store.remove(selected.value.id)
  selected.value = null
}

const createOpen = ref(false)

const { handleSubmit, errors, defineField, resetForm } = useForm<QuentaForm>({
  initialValues: { name: '', race: '', birth: '', origin: '', summary: '', body: '' },
  validationSchema: {
    name: (v: string) => (v && v.trim() ? true : 'Укажите имя героя'),
  },
})
const [name] = defineField('name')
const [race] = defineField('race')
const [birth] = defineField('birth')
const [origin] = defineField('origin')
const [summary] = defineField('summary')
const [body] = defineField('body')

function openCreate() {
  resetForm()
  createOpen.value = true
}

const onSubmit = handleSubmit(async (values) => {
  await store.add({
    name: values.name.trim(),
    race: values.race.trim(),
    birth: values.birth.trim(),
    origin: values.origin.trim(),
    summary: values.summary.trim(),
    body: values.body.trim(),
  })
  createOpen.value = false
  resetForm()
})

onMounted(() => {
  store.load()
})
</script>
