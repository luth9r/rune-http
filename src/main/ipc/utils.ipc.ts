import { ipcMain, dialog, BrowserWindow } from 'electron'

export const UTILS_CHANNELS = {
  SELECT_FILE: 'utils:select-file',
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
}
