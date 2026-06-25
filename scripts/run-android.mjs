// Запуск приложения на эмуляторе/устройстве Android из CLI.
// Обходит баг `cap run` на Windows (Capacitor зовёт './gradlew' без .bat):
// поднимает эмулятор при необходимости, ставит APK через gradlew installDebug и стартует приложение.
// Эмулятор привязан к этой сессии терминала: Ctrl+C или закрытие терминала гасит его
// (но только если эмулятор был запущен этим скриптом — уже работавший оставляем как есть).
// Перед запуском должны быть выполнены `vite build` и `cap sync` (см. npm-скрипт cap:run).
// Использование: node scripts/run-android.mjs [имя_AVD]
import { execSync, spawn } from 'node:child_process'
import { resolve } from 'node:path'

const APP_ID = 'com.teso.app'
const isWin = process.platform === 'win32'
const SDK = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT
if (!SDK) {
  console.error('✗ Не задан ANDROID_HOME / ANDROID_SDK_ROOT')
  process.exit(1)
}

const exe = (name) => (isWin ? `${name}.exe` : name)
const adb = `${SDK}/platform-tools/${exe('adb')}`
const emulatorBin = `${SDK}/emulator/${exe('emulator')}`

const q = (s) => `"${s}"`
const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)
const run = (cmd, opts = {}) => execSync(cmd, { stdio: 'inherit', ...opts })
const read = (cmd) => execSync(cmd, { encoding: 'utf8' }).trim()

const runningDevices = () =>
  read(`${q(adb)} devices`)
    .split('\n')
    .slice(1)
    .map((l) => l.trim())
    .filter((l) => l.endsWith('\tdevice'))
    .map((l) => l.split('\t')[0])

let serial = runningDevices()[0]
let emuChild = null
const startedByUs = !serial

if (startedByUs) {
  const avds = read(`${q(emulatorBin)} -list-avds`)
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
  if (avds.length === 0) {
    console.error('✗ Нет ни одного AVD. Создайте эмулятор в Android Studio → Device Manager.')
    process.exit(1)
  }
  const wanted = process.argv[2]
  const avd = wanted && avds.includes(wanted) ? wanted : avds[0]

  console.log(`▶ Запускаю эмулятор: ${avd}`)
  // НЕ detached: процесс остаётся в этой консоли и гаснет вместе с терминалом.
  emuChild = spawn(emulatorBin, ['-avd', avd], { stdio: 'ignore' })

  const stop = () => {
    console.log('\n⏹ Останавливаю эмулятор…')
    try {
      if (serial) execSync(`${q(adb)} -s ${serial} emu kill`, { stdio: 'ignore' })
      else emuChild?.kill()
    } catch {
      /* уже остановлен */
    }
    process.exit(0)
  }
  process.on('SIGINT', stop)
  process.on('SIGTERM', stop)
  process.on('SIGBREAK', stop)

  console.log('⏳ Жду подключения устройства…')
  run(`${q(adb)} wait-for-device`)

  console.log('⏳ Жду завершения загрузки Android…')
  let waited = 0
  let booted = ''
  while (booted !== '1' && waited < 240_000) {
    sleep(3000)
    waited += 3000
    try {
      booted = read(`${q(adb)} shell getprop sys.boot_completed`)
    } catch {
      booted = ''
    }
  }
  if (booted !== '1') {
    console.error('✗ Эмулятор не загрузился за отведённое время')
    process.exit(1)
  }
  serial = runningDevices()[0]
  console.log('✔ Эмулятор загружен')
}

console.log('▶ Сборка и установка APK (gradlew installDebug)…')
const gradlew = resolve('android', isWin ? 'gradlew.bat' : 'gradlew')
run(`${q(gradlew)} installDebug`, { cwd: 'android' })

console.log('▶ Запуск приложения…')
run(`${q(adb)} shell monkey -p ${APP_ID} -c android.intent.category.LAUNCHER 1`)

if (startedByUs) {
  console.log('\n✔ Приложение запущено. Эмулятор привязан к этому терминалу.')
  console.log('   Нажмите Ctrl+C (или закройте терминал), чтобы закрыть эмулятор.')
  await new Promise(() => {}) // держим сессию, пока не придёт сигнал остановки
} else {
  console.log('✔ Готово — приложение запущено (эмулятор был открыт ранее, оставляю работать).')
}
