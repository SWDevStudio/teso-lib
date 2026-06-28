// Dev-режим Electron с горячей перезагрузкой:
// 1) поднимает Vite dev-сервер (HMR рендерера),
// 2) собирает electron/main.ts и preload.ts через esbuild в watch-режиме,
// 3) запускает Electron, указывая ему URL dev-сервера через VITE_DEV_SERVER_URL,
// 4) при изменении main/preload перезапускает процесс Electron.
// Запуск: npm run electron:dev
import electronPath from 'electron'
import { createServer } from 'vite'
import { context } from 'esbuild'
import { spawn } from 'node:child_process'

const server = await createServer({ server: { host: '127.0.0.1' } })
await server.listen()
server.printUrls()

const url = server.resolvedUrls?.local?.[0]
if (!url) {
  console.error('[electron:dev] не удалось определить URL dev-сервера')
  await server.close()
  process.exit(1)
}

let electronProc = null

function spawnElectron() {
  const env = { ...process.env, VITE_DEV_SERVER_URL: url }
  delete env.ELECTRON_RUN_AS_NODE
  const proc = spawn(electronPath, ['.'], { stdio: 'inherit', env })
  electronProc = proc
  proc.on('close', () => {
    if (electronProc === proc) void cleanup()
  })
}

function restartElectron() {
  if (!electronProc) {
    spawnElectron()
    return
  }
  const old = electronProc
  electronProc = null
  old.once('close', spawnElectron)
  old.kill()
}

const ctx = await context({
  entryPoints: ['electron/main.ts', 'electron/preload.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  external: ['electron'],
  outdir: 'dist-electron',
  outExtension: { '.js': '.cjs' },
  plugins: [
    {
      name: 'electron-restart',
      setup(build) {
        build.onEnd((result) => {
          if (result.errors.length > 0) return
          restartElectron()
        })
      },
    },
  ],
})

await ctx.watch()

let cleaningUp = false
async function cleanup() {
  if (cleaningUp) return
  cleaningUp = true
  await ctx.dispose()
  await server.close()
  process.exit(0)
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
