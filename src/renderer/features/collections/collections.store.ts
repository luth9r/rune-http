import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { v4 as uuid } from 'uuid'
import type { Collection, CollectionItem, DropPosition } from '@/types'
import type { HttpRequest } from '@/types'
import { electronStorage } from 'renderer/lib/electronStorage'
import { useTabsStore } from '../tabs/tabs.store'

interface CollectionsState {
  collections: Collection[]
  addCollection: (name: string) => void
  removeCollection: (id: string) => void
  renameCollection: (id: string, name: string) => void
  toggleCollection: (id: string) => void
  addRequest: (collectionId: string, request: Omit<HttpRequest, 'id'>) => string
  renameItem: (collectionId: string, itemId: string, newName: string) => void
  moveItem: (
    itemId: string,
    targetId: string,
    position: DropPosition
  ) => void
  removeItem: (collectionId: string, itemId: string) => void
  updateRequest: (
    collectionId: string,
    itemId: string,
    patch: Partial<HttpRequest>
  ) => void
}

export const useCollectionsStore = create<CollectionsState>()(
  persist(
    immer(set => ({
      collections: [],

      addCollection: name =>
        set(state => {
          state.collections.push({
            id: uuid(),
            name,
            items: [],
            isOpen: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })
        }),

      removeCollection: id =>
        set(state => {
          state.collections = state.collections.filter(c => c.id !== id)
        }),

      renameCollection: (id, name) =>
        set(state => {
          const col = state.collections.find(c => c.id === id)
          if (col) {
            col.name = name
            col.updatedAt = Date.now()
          }
        }),

      toggleCollection: id =>
        set(state => {
          const col = state.collections.find(c => c.id === id)
          if (col) col.isOpen = !col.isOpen
        }),

      addRequest: (collectionId, request) => {
        const itemId = uuid()
        set(state => {
          const col = state.collections.find(c => c.id === collectionId)
          if (!col) return
          col.items.push({
            id: itemId,
            type: 'request',
            name: request.name || 'New Request',
            request: { ...request, id: itemId },
          })
          col.updatedAt = Date.now()
        })
        return itemId
      },

      renameItem: (collectionId, itemId, newName) =>
        set(state => {
          const col = state.collections.find(c => c.id === collectionId)
          if (!col) return
          const item = col.items.find(i => i.id === itemId)
          if (item) {
            item.name = newName
            if (item.request) item.request.name = newName
            useTabsStore
              .getState()
              .updateTabByRequestId(itemId, { name: newName })
          }
        }),

      moveItem: (itemId, targetId, position) =>
        set(state => {
          const activeColIdx = state.collections.findIndex(c => c.id === itemId)
          if (activeColIdx !== -1) {
            let targetColIdx = state.collections.findIndex(
              c => c.id === targetId
            )

            if (targetColIdx === -1) {
              targetColIdx = state.collections.findIndex(c =>
                c.items.some(i => i.id === targetId)
              )
            }

            if (targetColIdx !== -1 && activeColIdx !== targetColIdx) {
              const [movedCol] = state.collections.splice(activeColIdx, 1)
              const finalTargetIdx = state.collections.findIndex(
                c =>
                  c.id === state.collections[targetColIdx]?.id ||
                  c.id === targetId
              )
              const insertIdx =
                position === 'after' ? finalTargetIdx + 1 : finalTargetIdx
              state.collections.splice(insertIdx, 0, movedCol)
            }
            return
          }

          let movedItem: CollectionItem | null = null

          for (const col of state.collections) {
            const idx = col.items.findIndex(i => i.id === itemId)
            if (idx !== -1) {
              ;[movedItem] = col.items.splice(idx, 1)
              col.updatedAt = Date.now()
              break
            }
          }

          if (!movedItem) return

          for (const col of state.collections) {
            if (col.id === targetId) {
              if (position === 'after') col.items.push(movedItem)
              else col.items.unshift(movedItem)
              col.updatedAt = Date.now()
              return
            }

            const targetIdx = col.items.findIndex(i => i.id === targetId)
            if (targetIdx !== -1) {
              const insertIdx = position === 'after' ? targetIdx + 1 : targetIdx
              col.items.splice(insertIdx, 0, movedItem)
              col.updatedAt = Date.now()
              return
            }
          }
        }),

      removeItem: (collectionId, itemId) =>
        set(state => {
          const col = state.collections.find(c => c.id === collectionId)
          if (!col) return
          col.items = col.items.filter(i => i.id !== itemId)
          col.updatedAt = Date.now()
        }),

      updateRequest: (collectionId, itemId, patch) =>
        set(state => {
          const col = state.collections.find(c => c.id === collectionId)
          if (!col) return
          const item = col.items.find(i => i.id === itemId)
          if (item?.request) Object.assign(item.request, patch)
        }),
    })),
    {
      name: 'rune-collections',
      storage: createJSONStorage(() => electronStorage),
      onRehydrateStorage: () => {
        console.log('Hydration starting...')
        return (_state, error) => {
          if (error) console.error('Hydration error', error)
          else console.log('Hydration finished')
        }
      },
    }
  )
)
