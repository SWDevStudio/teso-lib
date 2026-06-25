// Кодек для передачи заметок и персонажей между телефонами через QR-код.
// Пайплайн: компактный JSON-конверт → UTF-8 → deflate-raw → base45.
// base45 (RFC 9285) укладывается в alphanumeric-режим QR (плотнее byte-режима) и читается
// любым сканером как обычная строка — поэтому переживает нативный MLKit-сканер, который
// произвольные сжатые байты испортил бы. Формат закрытый: эти коды читает только приложение.

export const QR_ALNUM_CAPACITY = 4296 // QR v40, alphanumeric, EC level L
export const SCHEMA_VERSION = 1

export interface NoteTransfer {
  kind: 'note'
  title: string
  body: string
  labels: string[]
}

export interface CharacterTransfer {
  kind: 'character'
  name: string
  realName: string | null
  title: string | null
  note: string | null
  labels: string[]
}

export interface QuentaTransfer {
  kind: 'quenta'
  name: string
  race: string
  birth: string
  origin: string
  summary: string
  body: string
}

export type Transfer = NoteTransfer | CharacterTransfer | QuentaTransfer

export class InvalidTransferError extends Error {}
export class UnsupportedVersionError extends Error {
  readonly version: unknown
  constructor(version: unknown) {
    super(`Код создан в другой версии приложения (схема ${String(version)}). Обновите приложение.`)
    this.version = version
  }
}

const B45 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:'

function base45Encode(bytes: Uint8Array): string {
  let out = ''
  for (let i = 0; i < bytes.length; i += 2) {
    const hi = bytes[i] ?? 0
    if (i + 1 < bytes.length) {
      const n = hi * 256 + (bytes[i + 1] ?? 0)
      out += B45.charAt(n % 45) + B45.charAt(Math.floor(n / 45) % 45) + B45.charAt(Math.floor(n / 2025))
    } else {
      out += B45.charAt(hi % 45) + B45.charAt(Math.floor(hi / 45))
    }
  }
  return out
}

function base45Decode(str: string): Uint8Array {
  const bytes: number[] = []
  for (let i = 0; i < str.length; i += 3) {
    const chunk = str.slice(i, i + 3)
    const d0 = B45.indexOf(chunk.charAt(0))
    const d1 = chunk.length > 1 ? B45.indexOf(chunk.charAt(1)) : -1
    const d2 = chunk.length > 2 ? B45.indexOf(chunk.charAt(2)) : 0
    if (chunk.length === 3) {
      if (d0 < 0 || d1 < 0 || d2 < 0) throw new InvalidTransferError('Недопустимый символ в коде')
      const n = d0 + d1 * 45 + d2 * 2025
      if (n > 0xffff) throw new InvalidTransferError('Повреждённый код')
      bytes.push(Math.floor(n / 256), n % 256)
    } else if (chunk.length === 2) {
      if (d0 < 0 || d1 < 0) throw new InvalidTransferError('Недопустимый символ в коде')
      const n = d0 + d1 * 45
      if (n > 0xff) throw new InvalidTransferError('Повреждённый код')
      bytes.push(n)
    } else {
      throw new InvalidTransferError('Повреждённый код')
    }
  }
  return Uint8Array.from(bytes)
}

async function pump(input: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const writer = stream.writable.getWriter()
  void writer.write(input as BufferSource)
  void writer.close()
  const reader = stream.readable.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    total += value.length
  }
  const out = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    out.set(chunk, offset)
    offset += chunk.length
  }
  return out
}

const deflateRaw = (bytes: Uint8Array) => pump(bytes, new CompressionStream('deflate-raw'))
const inflateRaw = (bytes: Uint8Array) => pump(bytes, new DecompressionStream('deflate-raw'))

function toEnvelope(t: Transfer): object {
  if (t.kind === 'note') {
    return { t: 'n', v: SCHEMA_VERSION, d: { ti: t.title, bo: t.body, l: t.labels } }
  }
  if (t.kind === 'character') {
    return {
      t: 'c',
      v: SCHEMA_VERSION,
      d: { na: t.name, rn: t.realName, ti: t.title, no: t.note, l: t.labels },
    }
  }
  return {
    t: 'q',
    v: SCHEMA_VERSION,
    d: { na: t.name, ra: t.race, bi: t.birth, or: t.origin, su: t.summary, bo: t.body },
  }
}

/** Кодирует запись в строку для QR (base45). */
export async function encodeTransfer(t: Transfer): Promise<string> {
  const json = JSON.stringify(toEnvelope(t))
  const deflated = await deflateRaw(new TextEncoder().encode(json))
  return base45Encode(deflated)
}

/** Длина итоговой строки QR в символах. */
export async function qrPayloadLength(t: Transfer): Promise<number> {
  return (await encodeTransfer(t)).length
}

/** Влезает ли запись в самый большой QR (с запасом коррекции L). */
export async function fitsInQr(t: Transfer): Promise<boolean> {
  return (await qrPayloadLength(t)) <= QR_ALNUM_CAPACITY
}

function asString(v: unknown): string {
  return typeof v === 'string' ? v : ''
}

function asNullableString(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null
}

function asLabels(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v.filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
}

/** Разбирает строку из отсканированного QR в типизированную запись. */
export async function decodeTransfer(scanned: string): Promise<Transfer> {
  const bytes = base45Decode(scanned.trim())

  let json: string
  try {
    json = new TextDecoder().decode(await inflateRaw(bytes))
  } catch {
    throw new InvalidTransferError('Не удалось распаковать код')
  }

  let env: { t?: unknown; v?: unknown; d?: Record<string, unknown> }
  try {
    env = JSON.parse(json)
  } catch {
    throw new InvalidTransferError('Повреждённые данные в коде')
  }

  if (env.v !== SCHEMA_VERSION) throw new UnsupportedVersionError(env.v)

  const d = env.d ?? {}
  if (env.t === 'n') {
    return { kind: 'note', title: asString(d.ti), body: asString(d.bo), labels: asLabels(d.l) }
  }
  if (env.t === 'c') {
    return {
      kind: 'character',
      name: asString(d.na),
      realName: asNullableString(d.rn),
      title: asNullableString(d.ti),
      note: asNullableString(d.no),
      labels: asLabels(d.l),
    }
  }
  if (env.t === 'q') {
    return {
      kind: 'quenta',
      name: asString(d.na),
      race: asString(d.ra),
      birth: asString(d.bi),
      origin: asString(d.or),
      summary: asString(d.su),
      body: asString(d.bo),
    }
  }
  throw new InvalidTransferError('Неизвестный тип записи в коде')
}
