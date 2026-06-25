import { defineStore } from 'pinia'
import { ref } from 'vue'
import { addQuenta, deleteQuenta, listQuentas, type Quenta, type QuentaInput } from '@/db'

export const useQuentasStore = defineStore('quentas', () => {
  const quentas = ref<Quenta[]>([])
  const loading = ref(false)

  async function load() {
    loading.value = true
    try {
      quentas.value = await listQuentas()
    } finally {
      loading.value = false
    }
  }

  async function add(input: QuentaInput) {
    const id = await addQuenta(input)
    await load()
    return id
  }

  async function remove(id: number) {
    await deleteQuenta(id)
    await load()
  }

  return { quentas, loading, load, add, remove }
})
