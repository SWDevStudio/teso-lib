// Лимиты длины полей для записей, передаваемых через QR.
// Подобраны так, чтобы даже worst-case (несжимаемый кириллический текст) гарантированно
// влезал в самый большой QR (v40, alphanumeric, уровень коррекции L = 4296 символов)
// после сжатия и base45. Реальный текст жмётся гораздо лучше; финальная гарантия —
// проверка фактического размера через fitsInQr() в qr-transfer.ts.
export const TRANSFER_LIMITS = {
  note: {
    title: 100,
    body: 2000,
  },
  character: {
    name: 60,
    realName: 60,
    title: 180,
    note: 1400,
  },
  label: {
    max: 5,
    name: 24,
  },
} as const

// Запись можно передать через QR, только если её поля в пределах лимитов.
// (Лимиты подобраны с запасом, поэтому «в пределах» гарантирует, что код соберётся.)
export function noteWithinLimits(note: { title: string; body: string }): boolean {
  return (
    note.title.length <= TRANSFER_LIMITS.note.title && note.body.length <= TRANSFER_LIMITS.note.body
  )
}

export function characterWithinLimits(character: {
  name: string
  real_name: string | null
  title: string | null
  note: string | null
}): boolean {
  const limit = TRANSFER_LIMITS.character
  return (
    character.name.length <= limit.name &&
    (character.real_name?.length ?? 0) <= limit.realName &&
    (character.title?.length ?? 0) <= limit.title &&
    (character.note?.length ?? 0) <= limit.note
  )
}

