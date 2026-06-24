import { getDb, persist } from './client'

export interface CharacterRow {
  id: number
  name: string
  real_name: string | null
  title: string | null
  note: string | null
  created_at: string
  updated_at: string
}

export interface Character extends CharacterRow {
  labelIds: number[]
}

export interface CharacterInput {
  name: string
  real_name: string | null
  title: string | null
  note: string | null
  labelIds: number[]
}

interface CharacterLabelLink {
  character_id: number
  label_id: number
}

export async function listCharacters(): Promise<Character[]> {
  const db = getDb()
  const rows = ((
    await db.query('SELECT * FROM characters ORDER BY datetime(updated_at) DESC, id DESC;')
  ).values ?? []) as CharacterRow[]
  const links = ((await db.query('SELECT character_id, label_id FROM character_labels;')).values ??
    []) as CharacterLabelLink[]

  const byCharacter = new Map<number, number[]>()
  for (const link of links) {
    const ids = byCharacter.get(link.character_id) ?? []
    ids.push(link.label_id)
    byCharacter.set(link.character_id, ids)
  }

  return rows.map((row) => ({ ...row, labelIds: byCharacter.get(row.id) ?? [] }))
}

async function replaceLabels(characterId: number, labelIds: number[]): Promise<void> {
  const db = getDb()
  await db.run('DELETE FROM character_labels WHERE character_id = ?;', [characterId])
  for (const labelId of labelIds) {
    await db.run('INSERT OR IGNORE INTO character_labels (character_id, label_id) VALUES (?, ?);', [
      characterId,
      labelId,
    ])
  }
}

export async function addCharacter(input: CharacterInput): Promise<number> {
  const res = await getDb().run(
    'INSERT INTO characters (name, real_name, title, note) VALUES (?, ?, ?, ?);',
    [input.name, input.real_name, input.title, input.note],
  )
  const id = res.changes?.lastId ?? -1
  if (id > 0) await replaceLabels(id, input.labelIds)
  await persist()
  return id
}

export async function updateCharacter(id: number, input: CharacterInput): Promise<void> {
  await getDb().run(
    "UPDATE characters SET name = ?, real_name = ?, title = ?, note = ?, updated_at = datetime('now') WHERE id = ?;",
    [input.name, input.real_name, input.title, input.note, id],
  )
  await replaceLabels(id, input.labelIds)
  await persist()
}

export async function deleteCharacter(id: number): Promise<void> {
  const db = getDb()
  await db.run('DELETE FROM character_labels WHERE character_id = ?;', [id])
  await db.run('DELETE FROM characters WHERE id = ?;', [id])
  await persist()
}
