import { app, BrowserWindow, protocol, session, shell } from 'electron'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'

const SCHEME = 'app'
const HOST = 'teso'
const ORIGIN = `${SCHEME}://${HOST}`

const DIST = app.isPackaged
  ? path.join(process.resourcesPath, 'dist')
  : path.join(__dirname, '..', 'dist')

const MIME: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
  '.map': 'application/json',
}

protocol.registerSchemesAsPrivileged([
  {
    scheme: SCHEME,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      stream: true,
      corsEnabled: true,
    },
  },
])

function resolveFile(pathname: string): string | null {
  const clean = decodeURIComponent(pathname.split('?')[0].split('#')[0])
  const candidate = path.normalize(path.join(DIST, clean))
  if (candidate !== DIST && !candidate.startsWith(DIST + path.sep)) return null
  return candidate
}

function registerAppProtocol() {
  protocol.handle(SCHEME, async (request) => {
    const { pathname } = new URL(request.url)
    let file = resolveFile(pathname)

    let exists = false
    if (file) {
      try {
        exists = (await stat(file)).isFile()
      } catch {
        exists = false
      }
    }

    if (!exists) {
      const ext = file ? path.extname(file).toLowerCase() : ''
      if (ext && ext !== '.html') return new Response('Not found', { status: 404 })
      file = path.join(DIST, 'index.html')
    }

    const data = await readFile(file)
    const mime = MIME[path.extname(file).toLowerCase()] ?? 'application/octet-stream'
    return new Response(new Uint8Array(data), { headers: { 'content-type': mime } })
  })
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 820,
    minWidth: 360,
    minHeight: 560,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#14110C',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) void shell.openExternal(url)
    return { action: 'deny' }
  })

  win.once('ready-to-show', () => {
    win.maximize()
    win.show()
  })

  void win.loadURL(`${ORIGIN}/`)
  return win
}

app.whenReady().then(() => {
  registerAppProtocol()

  const ses = session.defaultSession
  ses.setPermissionRequestHandler((_wc, permission, callback) => callback(permission === 'media'))
  ses.setPermissionCheckHandler((_wc, permission) => permission === 'media')

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
