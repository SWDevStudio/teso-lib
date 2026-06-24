<template>
  <div class="space-y-3">
    <div v-if="labels.length" class="flex flex-wrap gap-2">
      <div v-for="label in labels" :key="label.id" class="inline-flex items-center gap-1">
        <button type="button" class="cursor-pointer" @click="toggle(label.id)">
          <UiBadge
            :color="label.color as BadgeColor"
            :outline="!modelValue.includes(label.id)"
            :class="modelValue.includes(label.id) ? '' : 'opacity-60'"
          >
            <UiIcon v-if="modelValue.includes(label.id)" name="check" :size="14" />
            {{ label.name }}
          </UiBadge>
        </button>
        <button
          type="button"
          class="flex size-11 items-center justify-center text-error/60 transition hover:text-error"
          aria-label="Удалить лейбл"
          @click="remove(label.id)"
        >
          <UiIcon name="close" :size="16" />
        </button>
      </div>
    </div>

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
import UiBadge from '@/components/ui/UiBadge.vue'
import UiButton from '@/components/ui/UiButton.vue'
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
