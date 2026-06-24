import { getDb, persist } from './client'

export interface Note {
  id: number
  title: string
  body: string
  created_at: string
  updated_at: string
}

export interface NoteInput {
  title: string
  body: string
}

export async function listNotes(): Promise<Note[]> {
  const res = await getDb().query(
    'SELECT * FROM notes ORDER BY datetime(updated_at) DESC, id DESC;',
  )
  return (res.values ?? []) as Note[]
}

export async function addNote(input: NoteInput): Promise<number> {
  const res = await getDb().run('INSERT INTO notes (title, body) VALUES (?, ?);', [
    input.title,
    input.body,
  ])
  await persist()
  return res.changes?.lastId ?? -1
}

export async function updateNote(id: number, input: NoteInput): Promise<void> {
  await getDb().run(
    "UPDATE notes SET title = ?, body = ?, updated_at = datetime('now') WHERE id = ?;",
    [input.title, input.body, id],
  )
  await persist()
}

export async function deleteNote(id: number): Promise<void> {
  await getDb().run('DELETE FROM notes WHERE id = ?;', [id])
  await persist()
}
