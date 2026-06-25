<template>
  <UiModal
    :model-value="modelValue"
    title="Сканировать QR"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="flex flex-col items-center gap-4 text-center">
      <template v-if="outcome">
        <UiIcon
          :name="outcome.ok ? 'check' : 'close'"
          :size="44"
          :class="outcome.ok ? 'text-success' : 'text-error'"
        />
        <p class="font-medium">{{ outcome.text }}</p>
        <UiButton variant="primary" @click="restart">Сканировать ещё</UiButton>
      </template>

      <template v-else>
        <video
          ref="videoEl"
          class="aspect-square w-full max-w-xs rounded-box bg-black object-cover"
        />
        <p v-if="message" class="text-sm" :class="cameraError ? 'text-error' : 'opacity-70'">
          {{ message }}
        </p>
        <label class="btn btn-outline btn-sm">
          Загрузить фото QR
          <input type="file" accept="image/*" class="hidden" @change="onFile" />
        </label>
      </template>
    </div>
  </UiModal>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import QrScanner from 'qr-scanner'
import UiModal from './ui/UiModal.vue'
import UiButton from './ui/UiButton.vue'
import UiIcon from './ui/UiIcon.vue'
import { decodeTransfer, InvalidTransferError, UnsupportedVersionError } from '@/lib/qr-transfer'
import { applyTransfer } from '@/lib/qr-import'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const videoEl = ref<HTMLVideoElement | null>(null)
const message = ref('')
const cameraError = ref(false)
const outcome = ref<{ ok: boolean; text: string } | null>(null)
let scanner: QrScanner | null = null
let busy = false

function stopCamera() {
  scanner?.stop()
  scanner?.destroy()
  scanner = null
}

async function importText(text: string): Promise<string> {
  const transfer = await decodeTransfer(text)
  const imported = await applyTransfer(transfer)
  const label = { note: 'Заметка', character: 'Персонаж', quenta: 'Квента' }[imported.kind]
  return `${label} «${imported.title}» добавлена`
}

async function onCameraScan(text: string) {
  if (busy || outcome.value) return
  busy = true
  try {
    const successMessage = await importText(text)
    stopCamera()
    outcome.value = { ok: true, text: successMessage }
  } catch (e) {
    if (e instanceof UnsupportedVersionError) {
      stopCamera()
      outcome.value = { ok: false, text: e.message }
    } else {
      message.value = 'Это не код приложения — наведите на нужный QR.'
      cameraError.value = false
    }
  } finally {
    busy = false
  }
}

async function startCamera() {
  await nextTick()
  if (!videoEl.value) return
  scanner = new QrScanner(videoEl.value, (result) => void onCameraScan(result.data), {
    returnDetailedScanResult: true,
    highlightScanRegion: true,
  })
  try {
    await scanner.start()
    message.value = 'Наведите камеру на QR-код'
    cameraError.value = false
  } catch {
    message.value = 'Камера недоступна — загрузите фото QR ниже.'
    cameraError.value = true
  }
}

async function onFile(event: Event) {
  const input = event.currentTarget
  if (!(input instanceof HTMLInputElement)) return
  const file = input.files?.[0]
  if (!file) return
  try {
    const result = await QrScanner.scanImage(file, { returnDetailedScanResult: true })
    const text = await importText(result.data)
    stopCamera()
    outcome.value = { ok: true, text }
  } catch (e) {
    const text =
      e instanceof InvalidTransferError || e instanceof UnsupportedVersionError
        ? e.message
        : 'QR-код не найден на изображении.'
    stopCamera()
    outcome.value = { ok: false, text }
  }
}

function reset() {
  outcome.value = null
  message.value = ''
  cameraError.value = false
  busy = false
}

function restart() {
  reset()
  void startCamera()
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      reset()
      void startCamera()
    } else {
      stopCamera()
    }
  },
)
</script>
