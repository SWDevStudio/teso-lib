<template>
  <UiModal
    :model-value="modelValue"
    :title="modalTitle"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="flex flex-col items-center gap-4 text-center">
      <p v-if="entityTitle" class="font-medium">{{ entityTitle }}</p>

      <p v-if="error" class="text-error">{{ error }}</p>

      <template v-else-if="qrUrl">
        <img
          :src="qrUrl"
          alt="QR-код записи"
          width="300"
          height="300"
          class="rounded-box border border-base-300 bg-white p-2"
        />
        <p class="max-w-xs text-sm opacity-70">
          Откройте сканер в приложении на другом телефоне и наведите камеру на этот код.
        </p>
      </template>

      <p v-else class="opacity-70">Готовлю QR…</p>
    </div>
  </UiModal>
</template>

<script lang="ts">
import type { Note, Character, Quenta } from '@/db'

export type ShareSource =
  | { kind: 'note'; note: Note }
  | { kind: 'character'; character: Character }
  | { kind: 'quenta'; quenta: Quenta }
</script>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import QRCode from 'qrcode'
import UiModal from './ui/UiModal.vue'
import { useLabelsStore } from '@/stores/labels'
import { encodeTransfer, QR_ALNUM_CAPACITY, type Transfer } from '@/lib/qr-transfer'

const props = defineProps<{
  modelValue: boolean
  source: ShareSource | null
}>()

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const labelsStore = useLabelsStore()
const qrUrl = ref<string | null>(null)
const error = ref<string | null>(null)

const modalTitle = computed(() => {
  switch (props.source?.kind) {
    case 'character':
      return 'QR персонажа'
    case 'quenta':
      return 'QR квенты'
    default:
      return 'QR заметки'
  }
})

const entityTitle = computed(() => {
  const source = props.source
  if (!source) return ''
  if (source.kind === 'note') return source.note.title.trim() || 'Заметка без названия'
  if (source.kind === 'character') return source.character.name
  return source.quenta.name
})

function labelNames(ids: number[]): string[] {
  const byId = new Map(labelsStore.labels.map((label) => [label.id, label.name]))
  return ids.map((id) => byId.get(id)).filter((name): name is string => Boolean(name))
}

function buildTransfer(source: ShareSource): Transfer {
  if (source.kind === 'note') {
    const n = source.note
    return { kind: 'note', title: n.title, body: n.body, labels: labelNames(n.labelIds) }
  }
  if (source.kind === 'character') {
    const c = source.character
    return {
      kind: 'character',
      name: c.name,
      realName: c.real_name,
      title: c.title,
      note: c.note,
      labels: labelNames(c.labelIds),
    }
  }
  const q = source.quenta
  return {
    kind: 'quenta',
    name: q.name,
    race: q.race,
    birth: q.birth,
    origin: q.origin,
    summary: q.summary,
    body: q.body,
  }
}

async function generate() {
  qrUrl.value = null
  error.value = null
  if (!props.source) return
  if (labelsStore.labels.length === 0) await labelsStore.load()
  try {
    const payload = await encodeTransfer(buildTransfer(props.source))
    if (payload.length > QR_ALNUM_CAPACITY) {
      error.value = `Запись слишком длинная для QR (${payload.length} из ${QR_ALNUM_CAPACITY} символов). Сократите текст.`
      return
    }
    qrUrl.value = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'L',
      margin: 2,
      width: 300,
    })
  } catch {
    error.value = 'Не удалось сформировать QR-код.'
  }
}

watch(
  () => [props.modelValue, props.source] as const,
  ([open]) => {
    if (open) void generate()
  },
)
</script>
