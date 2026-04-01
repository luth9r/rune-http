import { ipcMain, dialog, BrowserWindow } from 'electron'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export const UTILS_CHANNELS = {
  SELECT_FILE: 'utils:select-file',
  SELECT_DIRECTORY: 'utils:select-directory',
  GET_SYSTEM_FONTS: 'utils:get-system-fonts',
} as const

export function registerUtilsIpc(): void {
  ipcMain.handle(UTILS_CHANNELS.SELECT_FILE, async () => {
    const window = BrowserWindow.getAllWindows()[0]
    if (!window) return null

    const { canceled, filePaths } = await dialog.showOpenDialog(window, {
      properties: ['openFile'],
    })

    if (canceled || filePaths.length === 0) {
      return null
    }

    return filePaths[0]
  })

  ipcMain.handle(UTILS_CHANNELS.SELECT_DIRECTORY, async () => {
    const window = BrowserWindow.getAllWindows()[0]
    if (!window) return null

    const { canceled, filePaths } = await dialog.showOpenDialog(window, {
      properties: ['openDirectory'],
    })

    if (canceled || filePaths.length === 0) {
      return null
    }

    return filePaths[0]
  })

  ipcMain.handle(UTILS_CHANNELS.GET_SYSTEM_FONTS, async () => {
    try {
      if (process.platform === 'linux') {
        const { stdout } = await execAsync('fc-list : family')
        const families = stdout
          .split('\n')
          .map((line) => line.split(',')[0].trim())
          .filter((f) => f && !f.startsWith('.'))
        
        return Array.from(new Set(families)).sort()
      }
      
      // Fallback for other platforms
      return [
        'Inter',
        'JetBrains Mono',
        'Fira Code',
        'Cascadia Code',
        'system-ui',
        'sans-serif',
        'monospace',
      ].sort()
    } catch (error) {
      console.error('Failed to get system fonts:', error)
      return ['Inter', 'monospace']
    }
  })
}
