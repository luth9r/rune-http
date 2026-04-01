import { ipcMain, app } from 'electron'
import { promises as fs } from 'fs'
import path from 'path'

const DEFAULT_DATA_DIR = app.getPath('userData')

function getDataDir() {
  try {
    const settingsPath = path.join(DEFAULT_DATA_DIR, 'rune-settings.json')
    const settings = JSON.parse(require('fs').readFileSync(settingsPath, 'utf-8'))
    if (settings?.dataStoragePath) {
      return settings.dataStoragePath
    }
  } catch {
    // If settings don't exist or are invalid, use default
  }
  return DEFAULT_DATA_DIR
}

function filePath(name: string) {
  // Always store settings in the default location to avoid chicken-and-egg problem
  if (name === 'rune-settings') {
    return path.join(DEFAULT_DATA_DIR, `${name}.json`)
  }
  return path.join(getDataDir(), `${name}.json`)
}

async function readFile<T>(name: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath(name), 'utf-8')
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

async function writeFile(name: string, data: unknown): Promise<void> {
  const dir = name === 'rune-settings' ? DEFAULT_DATA_DIR : getDataDir()
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(filePath(name), JSON.stringify(data, null, 2), 'utf-8')
}

export function registerStorageHandlers() {
  ipcMain.handle(
    'storage:read',
    async (_e, name: string, fallback: unknown) => {
      return readFile(name, fallback)
    }
  )

  ipcMain.handle('storage:write', async (_e, name: string, data: unknown) => {
    await writeFile(name, data)
  })
}
