import { getDb, persist } from './client'
import { quentas as builtinQuentas } from '@/assets/data/quentas'

export interface Quenta {
  id: number
  name: string
  race: string
  birth: string
  origin: string
  summary: string
  body: string
  is_builtin: number
  created_at: string
}

export interface QuentaInput {
  name: string
  race: string
  birth: string
  origin: string
  summary: string
  body: string
}

export async function listQuentas(): Promise<Quenta[]> {
  const res = await getDb().query(
    'SELECT * FROM quentas ORDER BY datetime(created_at) DESC, id DESC;',
  )
  return (res.values ?? []) as Quenta[]
}

export async function addQuenta(input: QuentaInput, isBuiltin = false): Promise<number> {
  const res = await getDb().run(
    'INSERT INTO quentas (name, race, birth, origin, summary, body, is_builtin) VALUES (?, ?, ?, ?, ?, ?, ?);',
    [
      input.name,
      input.race,
      input.birth,
      input.origin,
      input.summary,
      input.body,
      isBuiltin ? 1 : 0,
    ],
  )
  await persist()
  return res.changes?.lastId ?? -1
}

export async function deleteQuenta(id: number): Promise<void> {
  await getDb().run('DELETE FROM quentas WHERE id = ?;', [id])
  await persist()
}

async function getMeta(key: string): Promise<string | null> {
  const res = await getDb().query('SELECT value FROM app_meta WHERE key = ?;', [key])
  const row = res.values?.[0] as { value: string } | undefined
  return row?.value ?? null
}

async function setMeta(key: string, value: string): Promise<void> {
  await getDb().run('INSERT OR REPLACE INTO app_meta (key, value) VALUES (?, ?);', [key, value])
}

const SEEDED_KEY = 'quentas_seeded'

// Сеет встроенные квенты ровно один раз (флаг в app_meta). Если пользователь удалит
// встроенную квенту — она не вернётся, так как флаг остаётся установленным.
export async function seedBuiltinQuentas(): Promise<void> {
  if ((await getMeta(SEEDED_KEY)) === '1') return
  for (const q of builtinQuentas) {
    await addQuenta(
      {
        name: q.name,
        race: q.race,
        birth: q.birth,
        origin: q.origin,
        summary: q.summary,
        body: q.body,
      },
      true,
    )
  }
  await setMeta(SEEDED_KEY, '1')
  await persist()
}
