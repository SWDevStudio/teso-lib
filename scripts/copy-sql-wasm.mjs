// Копирует sql-wasm.wasm (нужен jeep-sqlite для работы SQLite в браузере)
// из node_modules в public/assets, откуда jeep-sqlite грузит его по пути /assets/sql-wasm.wasm.
// Запускается автоматически как postinstall и вручную: npm run copy:wasm
import { copyFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname } from 'node:path'

const src = 'node_modules/sql.js/dist/sql-wasm.wasm'
const dest = 'public/assets/sql-wasm.wasm'

if (!existsSync(src)) {
  console.warn(`[copy-sql-wasm] источник не найден: ${src} — пропускаю`)
  process.exit(0)
}

mkdirSync(dirname(dest), { recursive: true })
copyFileSync(src, dest)
console.log(`[copy-sql-wasm] ${src} -> ${dest}`)
