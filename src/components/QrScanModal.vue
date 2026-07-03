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
        <label v-if="showCameraPicker" class="flex w-full max-w-xs items-center gap-2 text-left">
          <UiIcon name="camera" :size="20" class="shrink-0 opacity-70" />
          <UiSelect v-model="selectedCameraId" :options="cameraOptions" aria-label="Выбор камеры" />
        </label>
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
import { computed, nextTick, ref, watch } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import QrScanner from 'qr-scanner'
import UiModal from './ui/UiModal.vue'
import UiButton from './ui/UiButton.vue'
import UiIcon from './ui/UiIcon.vue'
import UiSelect from './ui/UiSelect.vue'
import { decodeTransfer, InvalidTransferError, UnsupportedVersionError } from '@/lib/qr-transfer'
import { applyTransfer } from '@/lib/qr-import'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const videoEl = ref<HTMLVideoElement | null>(null)
const message = ref('')
const cameraError = ref(false)
const outcome = ref<{ ok: boolean; text: string } | null>(null)
const cameras = ref<QrScanner.Camera[]>([])
const selectedCameraId = useLocalStorage('qr-scan-camera', '')
let scanner: QrScanner | null = null
let activeCameraId = ''
let busy = false

const showCameraPicker = computed(() => cameras.value.length > 1)

function facingLabel(label: string): string {
  const lower = label.toLowerCase()
  if (/front|user|передн/.test(lower)) return 'Передняя камера'
  if (/back|rear|environment|задн/.test(lower)) return 'Задняя камера'
  return label
}

const cameraOptions = computed(() => {
  const named = cameras.value.map((camera, index) => ({
    value: camera.id,
    base: facingLabel(camera.label) || `Камера ${index + 1}`,
  }))
  const totals = named.reduce<Record<string, number>>((acc, item) => {
    acc[item.base] = (acc[item.base] ?? 0) + 1
    return acc
  }, {})
  const seen: Record<string, number> = {}
  return named.map((item) => {
    if (totals[item.base] === 1) return { value: item.value, label: item.base }
    seen[item.base] = (seen[item.base] ?? 0) + 1
    return { value: item.value, label: `${item.base} ${seen[item.base]}` }
  })
})

function defaultCameraId(list: QrScanner.Camera[]): string {
  const back = list.find((camera) => /back|rear|environment/i.test(camera.label))
  return (back ?? list[0])?.id ?? ''
}

watch(selectedCameraId, (id) => {
  if (!scanner || !id || id === activeCameraId) return
  activeCameraId = id
  void scanner.setCamera(id).catch(() => {})
})

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
    preferredCamera: selectedCameraId.value || 'environment',
    returnDetailedScanResult: true,
    highlightScanRegion: true,
  })
  try {
    await scanner.start()
    message.value = 'Наведите камеру на QR-код'
    cameraError.value = false
    await refreshCameras()
  } catch {
    message.value = 'Камера недоступна — загрузите фото QR ниже.'
    cameraError.value = true
  }
}

async function refreshCameras() {
  try {
    cameras.value = await QrScanner.listCameras(true)
  } catch {
    cameras.value = []
  }
  const ids = cameras.value.map((camera) => camera.id)
  if (selectedCameraId.value && ids.includes(selectedCameraId.value)) {
    activeCameraId = selectedCameraId.value
    return
  }
  const fallback = defaultCameraId(cameras.value)
  activeCameraId = fallback
  if (fallback && scanner) await scanner.setCamera(fallback).catch(() => {})
  selectedCameraId.value = fallback
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
