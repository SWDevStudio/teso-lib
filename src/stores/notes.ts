import { defineStore } from 'pinia'
import { ref } from 'vue'
import { addNote, deleteNote, listNotes, updateNote, type Note, type NoteInput } from '@/db'

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<Note[]>([])
  const loading = ref(false)

  async function load() {
    loading.value = true
    try {
      notes.value = await listNotes()
    } finally {
      loading.value = false
    }
  }

  async function add(input: NoteInput) {
    const id = await addNote(input)
    await load()
    return id
  }

  async function update(id: number, input: NoteInput) {
    await updateNote(id, input)
    await load()
  }

  async function remove(id: number) {
    await deleteNote(id)
    await load()
  }

  return { notes, loading, load, add, update, remove }
})
