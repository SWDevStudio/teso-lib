<template>
  <div class="space-y-3">
    <ul
      v-if="labels.length"
      class="divide-y divide-base-200 overflow-hidden rounded-box border border-base-300"
    >
      <li v-for="label in labels" :key="label.id" class="flex items-center gap-2 pr-1">
        <UiCheckbox
          :model-value="modelValue.includes(label.id)"
          :label="label.name"
          class="grow px-3 py-2"
          @update:model-value="() => toggle(label.id)"
        />
        <button
          type="button"
          class="flex size-11 shrink-0 items-center justify-center text-error/60 transition hover:text-error"
          aria-label="Удалить лейбл"
          @click="remove(label.id)"
        >
          <UiIcon name="trash" :size="16" />
        </button>
      </li>
    </ul>

    <div class="flex flex-wrap items-end gap-2">
      <div class="grow basis-40">
        <UiInput v-model="newLabelName" placeholder="Новый лейбл" />
      </div>
      <UiButton variant="secondary" outline :disabled="!newLabelName.trim()" @click="create">
        <UiIcon name="tag" />
        Создать
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useLabelsStore } from '@/stores/labels'
import type { BadgeColor } from '@/components/ui/types'
import UiButton from '@/components/ui/UiButton.vue'
import UiCheckbox from '@/components/ui/UiCheckbox.vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import UiInput from '@/components/ui/UiInput.vue'

const DEFAULT_LABEL_COLOR: BadgeColor = 'primary'

const props = defineProps<{ modelValue: number[] }>()
const emit = defineEmits<{
  'update:modelValue': [value: number[]]
  deleted: [id: number]
}>()

const labelsStore = useLabelsStore()
const { labels } = storeToRefs(labelsStore)

const newLabelName = ref('')

function toggle(id: number) {
  if (props.modelValue.includes(id)) {
    emit(
      'update:modelValue',
      props.modelValue.filter((labelId) => labelId !== id),
    )
  } else {
    emit('update:modelValue', [...props.modelValue, id])
  }
}

async function create() {
  const trimmed = newLabelName.value.trim()
  if (!trimmed) return
  const id = await labelsStore.add(trimmed, DEFAULT_LABEL_COLOR)
  if (id > 0 && !props.modelValue.includes(id)) emit('update:modelValue', [...props.modelValue, id])
  newLabelName.value = ''
}

async function remove(id: number) {
  if (!window.confirm('Удалить этот лейбл? Он исчезнет у всех персонажей и заметок.')) return
  await labelsStore.remove(id)
  emit(
    'update:modelValue',
    props.modelValue.filter((labelId) => labelId !== id),
  )
  emit('deleted', id)
}
</script>
