import { getDb, persist } from './client'

export interface Label {
  id: number
  name: string
  color: string
  created_at: string
}

export async function listLabels(): Promise<Label[]> {
  const res = await getDb().query('SELECT * FROM labels ORDER BY name COLLATE NOCASE;')
  return (res.values ?? []) as Label[]
}

export async function addLabel(name: string, color: string): Promise<number> {
  await getDb().run('INSERT OR IGNORE INTO labels (name, color) VALUES (?, ?);', [name, color])
  await persist()
  const res = await getDb().query('SELECT id FROM labels WHERE name = ?;', [name])
  const row = res.values?.[0] as { id: number } | undefined
  return row?.id ?? -1
}

export async function deleteLabel(id: number): Promise<void> {
  await getDb().run('DELETE FROM character_labels WHERE label_id = ?;', [id])
  await getDb().run('DELETE FROM labels WHERE id = ?;', [id])
  await persist()
}
