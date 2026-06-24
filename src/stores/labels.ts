import { defineStore } from 'pinia'
import { ref } from 'vue'
import { addLabel, deleteLabel, listLabels, type Label } from '@/db'

export const useLabelsStore = defineStore('labels', () => {
  const labels = ref<Label[]>([])
  const loading = ref(false)

  async function load() {
    loading.value = true
    try {
      labels.value = await listLabels()
    } finally {
      loading.value = false
    }
  }

  async function add(name: string, color: string) {
    const id = await addLabel(name, color)
    await load()
    return id
  }

  async function remove(id: number) {
    await deleteLabel(id)
    await load()
  }

  return { labels, loading, load, add, remove }
})
