import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  addCharacter,
  deleteCharacter,
  listCharacters,
  updateCharacter,
  type Character,
  type CharacterInput,
} from '@/db'

export const useCharactersStore = defineStore('characters', () => {
  const characters = ref<Character[]>([])
  const loading = ref(false)

  async function load() {
    loading.value = true
    try {
      characters.value = await listCharacters()
    } finally {
      loading.value = false
    }
  }

  async function add(input: CharacterInput) {
    const id = await addCharacter(input)
    await load()
    return id
  }

  async function update(id: number, input: CharacterInput) {
    await updateCharacter(id, input)
    await load()
  }

  async function remove(id: number) {
    await deleteCharacter(id)
    await load()
  }

  return { characters, loading, load, add, update, remove }
})
