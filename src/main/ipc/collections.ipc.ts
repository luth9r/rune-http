import { ipcMain } from 'electron'
import Store from 'electron-store'
import type { Collection } from '@/types'

const store = new Store<{ collections: Collection[] }>({
  name: 'rune-collections',
  defaults: { collections: [] },
})

export const COLLECTIONS_CHANNELS = {
  GET_ALL: 'collections:get-all',
  SAVE_ALL: 'collections:save-all',
} as const

export function registerCollectionsIpc(): void {
  ipcMain.handle(COLLECTIONS_CHANNELS.GET_ALL, () => {
    return store.get('collections')
  })

  ipcMain.handle(
    COLLECTIONS_CHANNELS.SAVE_ALL,
    (_event, collections: Collection[]) => {
      store.set('collections', collections)
      return true
    }
  )
}
