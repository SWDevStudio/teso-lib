// Генерит build/icon.ico из public/favicon.svg через sharp (уже в зависимостях).
// ICO собирается вручную как контейнер с одним PNG 256x256 (Vista+ PNG-icon).
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import sharp from 'sharp'

const src = 'public/favicon.svg'
const dest = 'build/icon.ico'
const size = 256

const png = await sharp(src, { density: 384 }).resize(size, size).png().toBuffer()

const header = Buffer.alloc(6)
header.writeUInt16LE(0, 0)
header.writeUInt16LE(1, 2)
header.writeUInt16LE(1, 4)

const entry = Buffer.alloc(16)
entry.writeUInt8(0, 0)
entry.writeUInt8(0, 1)
entry.writeUInt8(0, 2)
entry.writeUInt8(0, 3)
entry.writeUInt16LE(1, 4)
entry.writeUInt16LE(32, 6)
entry.writeUInt32LE(png.length, 8)
entry.writeUInt32LE(header.length + 16, 12)

mkdirSync(dirname(dest), { recursive: true })
writeFileSync(dest, Buffer.concat([header, entry, png]))
console.log(`[make-icon] ${src} -> ${dest} (${size}x${size}, ${png.length} bytes)`)
