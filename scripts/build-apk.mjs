// Сборка APK из CLI через Gradle-обёртку (кросс-платформенно: gradlew.bat на Windows).
// Перед запуском должны быть выполнены `vite build` и `cap sync` (см. npm-скрипты cap:apk / cap:apk:release).
// Использование: node scripts/build-apk.mjs [release]
import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const isWin = process.platform === 'win32'
const release = process.argv[2] === 'release'
const task = release ? 'assembleRelease' : 'assembleDebug'
const variant = release ? 'release' : 'debug'

const gradlew = resolve('android', isWin ? 'gradlew.bat' : 'gradlew')
const q = (s) => `"${s}"`

console.log(`▶ Сборка APK: gradlew ${task}…`)
execSync(`${q(gradlew)} ${task} --console=plain`, { stdio: 'inherit', cwd: 'android' })

const apkDir = resolve('android', 'app', 'build', 'outputs', 'apk', variant)
const apk = resolve(apkDir, `app-${variant}.apk`)
if (existsSync(apk)) {
  console.log(`\n✔ Готово: ${apk}`)
} else {
  console.log(`\n✔ Сборка завершена. APK ищите в ${apkDir}`)
}
