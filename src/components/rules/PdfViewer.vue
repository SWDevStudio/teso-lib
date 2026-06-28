<template>
  <div ref="container" class="space-y-3">
    <p v-if="error" class="text-sm text-error">Не удалось открыть PDF: {{ error }}</p>
    <div v-else-if="loading" class="flex justify-center py-10">
      <span class="loading loading-spinner loading-lg text-primary" />
    </div>
    <canvas
      v-for="page in pageCount"
      :key="page"
      :ref="(el) => registerCanvas(page, el)"
      :data-page="page"
      class="aspect-[1/1.414] w-full rounded-lg border border-base-300 bg-white"
    />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

const props = defineProps<{ src: string }>()

const container = ref<HTMLElement | null>(null)
const pageCount = ref(0)
const loading = ref(true)
const error = ref('')

const canvases = new Map<number, HTMLCanvasElement>()
const rendered = new Set<number>()
let loadingTask: ReturnType<typeof pdfjsLib.getDocument> | null = null
let pdf: PDFDocumentProxy | null = null
let observer: IntersectionObserver | null = null

function registerCanvas(page: number, el: Element | ComponentPublicInstance | null) {
  if (el instanceof HTMLCanvasElement) {
    canvases.set(page, el)
    observer?.observe(el)
  }
}

async function renderPage(page: number) {
  if (rendered.has(page) || !pdf) return
  const canvas = canvases.get(page)
  if (!canvas) return
  rendered.add(page)
  const pdfPage = await pdf.getPage(page)
  const width = canvas.clientWidth || container.value?.clientWidth || 600
  const unscaled = pdfPage.getViewport({ scale: 1 })
  const ratio = Math.min(window.devicePixelRatio || 1, 2)
  const viewport = pdfPage.getViewport({ scale: (width / unscaled.width) * ratio })
  canvas.width = viewport.width
  canvas.height = viewport.height
  canvas.style.aspectRatio = `${viewport.width} / ${viewport.height}`
  await pdfPage.render({ canvas, viewport }).promise
}

onMounted(async () => {
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const target = entry.target
        if (entry.isIntersecting && target instanceof HTMLElement) {
          const page = Number(target.dataset.page)
          if (page) renderPage(page)
        }
      }
    },
    { rootMargin: '400px 0px' },
  )
  try {
    loadingTask = pdfjsLib.getDocument({ url: props.src })
    pdf = await loadingTask.promise
    pageCount.value = pdf.numPages
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
  loadingTask?.destroy()
})
</script>
