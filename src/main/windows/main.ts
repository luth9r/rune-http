import { app, BrowserWindow } from 'electron'
import { join } from 'node:path'

import { createWindow } from 'lib/electron-app/factories/windows/create'
import { ENVIRONMENT } from 'shared/constants'
import { displayName, resources } from '~/package.json'

const iconPath = app.isPackaged
  ? join(process.resourcesPath, 'build/icons/icon.png')
  : join(app.getAppPath(), resources, 'build/icons/icon.png')

export async function MainWindow() {
  const window = createWindow({
    id: 'main',
    title: displayName,
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    center: true,
    movable: true,
    resizable: true,
    alwaysOnTop: true,
    autoHideMenuBar: true,
    backgroundColor: '#1D1F21',

    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
    },
    icon: iconPath,
  })

  window.webContents.on('did-finish-load', () => {
    if (ENVIRONMENT.IS_DEV) {
      //window.webContents.openDevTools({ mode: "detach" });
    }

    window.show()
  })

  window.on('close', () => {
    for (const window of BrowserWindow.getAllWindows()) {
      window.destroy()
    }
  })

  return window
}
