// Собирает обе сборки и раскладывает готовые файлы в release/windows и release/android,
// чтобы их можно было сразу отправлять, не выискивая по папкам.
// Версия = время сборки (CalVer): YYYY.MM.DD-HHMM — самая новая = самая большая.
// Использование: npm run build:all
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const RELEASE = path.join(ROOT, 'release')
const WIN_DIR = path.join(RELEASE, 'windows')
const ANDROID_DIR = path.join(RELEASE, 'android')
const APK_SRC = path.join(ROOT, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk')

const now = new Date()
const pad = (n) => String(n).padStart(2, '0')
const version = `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`

function run(cmd, extraEnv) {
  console.log(`\n▶ ${cmd}`)
  execSync(cmd, {
    stdio: 'inherit',
    cwd: ROOT,
    env: { ...process.env, VITE_BUILD_VERSION: version, ...extraEnv },
  })
}

console.log(`Версия сборки: ${version}`)

// Без подписи: signtool обращается к timestamp-серверу и может зависнуть/упасть,
// а портативной сборке для внутренней рассылки подпись не нужна.
run('npm run electron:dist', { CSC_IDENTITY_AUTO_DISCOVERY: 'false' })
run('npm run cap:apk')

for (const dir of [WIN_DIR, ANDROID_DIR]) {
  fs.rmSync(dir, { recursive: true, force: true })
  fs.mkdirSync(dir, { recursive: true })
}

const builtExe = fs.readdirSync(RELEASE).find((f) => f.toLowerCase().endsWith('.exe'))
if (!builtExe) throw new Error('Портативный .exe не найден в release/')
const exeName = `TamrielCodex-${version}-portable.exe`
fs.copyFileSync(path.join(RELEASE, builtExe), path.join(WIN_DIR, exeName))

if (!fs.existsSync(APK_SRC)) throw new Error(`APK не найден: ${APK_SRC}`)
const apkName = `TamrielCodex-${version}-debug.apk`
fs.copyFileSync(APK_SRC, path.join(ANDROID_DIR, apkName))

for (const entry of fs.readdirSync(RELEASE)) {
  if (entry === 'windows' || entry === 'android') continue
  try {
    fs.rmSync(path.join(RELEASE, entry), { recursive: true, force: true })
  } catch {
    console.warn(`не удалось убрать release/${entry} (занят?) — пропускаю`)
  }
}

const mb = (p) => Math.round(fs.statSync(p).size / 1024 / 1024)
console.log(`\n✓ Готово (сборка ${version}):`)
console.log(`  release/windows/${exeName}  (${mb(path.join(WIN_DIR, exeName))} МБ)`)
console.log(`  release/android/${apkName}  (${mb(path.join(ANDROID_DIR, apkName))} МБ)`)
