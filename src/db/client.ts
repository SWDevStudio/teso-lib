import { Capacitor } from '@capacitor/core'
import {
  CapacitorSQLite,
  SQLiteConnection,
  type SQLiteDBConnection,
} from '@capacitor-community/sqlite'

import { DB_NAME, DB_VERSION, upgrades } from './migrations'

const sqlite = new SQLiteConnection(CapacitorSQLite)
const isWeb = Capacitor.getPlatform() === 'web'

let db: SQLiteDBConnection | null = null
let initPromise: Promise<SQLiteDBConnection> | null = null

export function initDb(): Promise<SQLiteDBConnection> {
  if (initPromise) return initPromise

  initPromise = (async () => {
    if (isWeb) {
      await customElements.whenDefined('jeep-sqlite')
      await sqlite.initWebStore()
    }

    await sqlite.addUpgradeStatement(DB_NAME, upgrades)

    const consistent = (await sqlite.checkConnectionsConsistency()).result ?? false
    const alreadyOpen = (await sqlite.isConnection(DB_NAME, false)).result ?? false

    db =
      consistent && alreadyOpen
        ? await sqlite.retrieveConnection(DB_NAME, false)
        : await sqlite.createConnection(DB_NAME, false, 'no-encryption', DB_VERSION, false)

    await db.open()
    await db.execute('PRAGMA foreign_keys = ON;')

    if (isWeb) await sqlite.saveToStore(DB_NAME)

    return db
  })()

  return initPromise
}

export function getDb(): SQLiteDBConnection {
  if (!db) throw new Error('БД не инициализирована — сначала вызовите initDb()')
  return db
}

export async function persist(): Promise<void> {
  if (isWeb) await sqlite.saveToStore(DB_NAME)
}

export { DB_NAME, DB_VERSION } from './migrations'
