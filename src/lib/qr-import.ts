// Применение записи, полученной из QR: создаёт заметку/персонажа и резолвит лейблы по имени.
// Лейблы переносятся по имени (id в каждой БД свои): addLabel — это resolve-or-create
// (INSERT OR IGNORE + SELECT по COLLATE NOCASE), поэтому существующий лейбл переиспользуется,
// а недостающий создаётся с дефолтным цветом.
import { addLabel } from '@/db'
import { useNotesStore } from '@/stores/notes'
import { useCharactersStore } from '@/stores/characters'
import { useQuentasStore } from '@/stores/quentas'
import { useLabelsStore } from '@/stores/labels'
import type { Transfer } from './qr-transfer'
import { TRANSFER_LIMITS } from './transfer-limits'

export interface ImportResult {
  kind: 'note' | 'character' | 'quenta'
  id: number
  title: string
}

async function resolveLabelIds(names: string[]): Promise<number[]> {
  const unique = [...new Set(names.map((n) => n.trim()).filter(Boolean))].slice(
    0,
    TRANSFER_LIMITS.label.max,
  )
  const ids: number[] = []
  for (const name of unique) {
    const id = await addLabel(name, 'primary')
    if (id > 0) ids.push(id)
  }
  return ids
}

/** Создаёт запись из расшифрованного QR. Возвращает тип, id и заголовок для уведомления. */
export async function applyTransfer(t: Transfer): Promise<ImportResult> {
  // Квенты без лейблов — обрабатываем отдельно.
  if (t.kind === 'quenta') {
    const id = await useQuentasStore().add({
      name: t.name,
      race: t.race,
      birth: t.birth,
      origin: t.origin,
      summary: t.summary,
      body: t.body,
    })
    return { kind: 'quenta', id, title: t.name }
  }

  const labelIds = await resolveLabelIds(t.labels)
  let result: ImportResult

  if (t.kind === 'note') {
    const id = await useNotesStore().add({ title: t.title, body: t.body, labelIds })
    result = { kind: 'note', id, title: t.title.trim() || 'Без названия' }
  } else {
    const id = await useCharactersStore().add({
      name: t.name,
      real_name: t.realName,
      title: t.title,
      note: t.note,
      labelIds,
    })
    result = { kind: 'character', id, title: t.name }
  }

  // Лейблы создавались напрямую через БД — обновим стор, чтобы новые отобразились в UI.
  await useLabelsStore().load()
  return result
}
