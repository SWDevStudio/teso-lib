import { getDb, persist } from './client'

export interface Note {
  id: number
  title: string
  body: string
  created_at: string
  updated_at: string
  labelIds: number[]
}

export interface NoteInput {
  title: string
  body: string
  labelIds: number[]
}

interface NoteRow {
  id: number
  title: string
  body: string
  created_at: string
  updated_at: string
}

interface NoteLabelLink {
  note_id: number
  label_id: number
}

export async function listNotes(): Promise<Note[]> {
  const db = getDb()
  const rows = ((await db.query('SELECT * FROM notes ORDER BY datetime(updated_at) DESC, id DESC;'))
    .values ?? []) as NoteRow[]
  const links = ((await db.query('SELECT note_id, label_id FROM note_labels;')).values ??
    []) as NoteLabelLink[]

  const byNote = new Map<number, number[]>()
  for (const link of links) {
    const ids = byNote.get(link.note_id) ?? []
    ids.push(link.label_id)
    byNote.set(link.note_id, ids)
  }

  return rows.map((row) => ({ ...row, labelIds: byNote.get(row.id) ?? [] }))
}

async function replaceLabels(noteId: number, labelIds: number[]): Promise<void> {
  const db = getDb()
  await db.run('DELETE FROM note_labels WHERE note_id = ?;', [noteId])
  for (const labelId of labelIds) {
    await db.run('INSERT OR IGNORE INTO note_labels (note_id, label_id) VALUES (?, ?);', [
      noteId,
      labelId,
    ])
  }
}

export async function addNote(input: NoteInput): Promise<number> {
  const res = await getDb().run('INSERT INTO notes (title, body) VALUES (?, ?);', [
    input.title,
    input.body,
  ])
  const id = res.changes?.lastId ?? -1
  if (id > 0) await replaceLabels(id, input.labelIds)
  await persist()
  return id
}

export async function updateNote(id: number, input: NoteInput): Promise<void> {
  await getDb().run(
    "UPDATE notes SET title = ?, body = ?, updated_at = datetime('now') WHERE id = ?;",
    [input.title, input.body, id],
  )
  await replaceLabels(id, input.labelIds)
  await persist()
}

export async function deleteNote(id: number): Promise<void> {
  const db = getDb()
  await db.run('DELETE FROM note_labels WHERE note_id = ?;', [id])
  await db.run('DELETE FROM notes WHERE id = ?;', [id])
  await persist()
}
