import { useState, useCallback } from 'react'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { useCollectionsStore } from '@/features/collections/collections.store'
import { useTabsStore } from '@/features/tabs/tabs.store'
import { SidebarItem } from './SidebarItem'
import { DropLine } from './DropLine'
import { exportCollection, exportRequest } from '@/features/collections/exporters'
import type { DropIndicator } from './types'

interface DraggableRowProps {
  id: string
  type: 'collection' | 'request'
  item: any
  collectionId?: string
  dropIndicator: DropIndicator
  onRemove?: () => void
}

export function DraggableRow({
  id,
  type,
  item,
  collectionId,
  dropIndicator,
  onRemove,
}: DraggableRowProps) {
  const {
    removeItem,
    addRequest,
    toggleCollection,
    renameCollection,
    renameItem,
    duplicateCollection,
    duplicateRequest,
  } = useCollectionsStore()
  const { openTab } = useTabsStore()
  const [_hovered, _setHovered] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    isDragging,
  } = useDraggable({
    id,
    data: { type, item, collectionId },
  })

  const { setNodeRef: setDropRef } = useDroppable({
    id,
    data: { type, item, collectionId },
  })

  const setNodeRef = useCallback(
    (node: HTMLElement | null) => {
      setDragRef(node)
      setDropRef(node)
    },
    [setDragRef, setDropRef]
  )

  const isCollection = type === 'collection'
  const isDropTarget =
    dropIndicator?.type === 'collection' && dropIndicator.id === id
  const showBefore = dropIndicator?.type === 'before' && dropIndicator.id === id
  const showAfter = dropIndicator?.type === 'after' && dropIndicator.id === id

  return (
    <>
      {showBefore && <DropLine indent={isCollection ? 12 : 24} />}
      <div ref={setNodeRef} {...attributes} {...listeners}>
        <SidebarItem
          isDragging={isDragging}
          isDropTarget={isDropTarget}
          item={isCollection ? { ...item, type: 'collection' } : item}
          level={isCollection ? 0 : 1}
          onAddRequest={
            isCollection
              ? () =>
                addRequest(item.id, {
                  name: 'New Request',
                  method: 'GET',
                  url: '',
                  headers: [],
                  params: [],
                  body: '',
                  bodyType: 'none',
                  auth: { type: 'none' },
                })
              : undefined
          }
          onClick={() =>
            !isCollection &&
            item.request &&
            openTab({ requestId: item.id, collectionId, ...item.request })
          }
          onRemove={onRemove}
          onDuplicate={() => {
            if (isCollection) duplicateCollection(item.id)
            else if (collectionId) duplicateRequest(collectionId, item.id)
          }}
          onExport={() => {
            try {
              const content = isCollection
                ? exportCollection(item)
                : exportRequest(item)

              if (!content) {
                return
              }

              const fileName = `${item.name || 'export'}.json`
              window.api.utils.saveFile(content, fileName)
            } catch (err) {
            }
          }}
          onRename={newName => {
            if (isCollection) renameCollection(item.id, newName)
            else if (collectionId) renameItem(collectionId, item.id, newName)
          }}
          onToggle={isCollection ? () => toggleCollection(item.id) : undefined}
        />
      </div>
      {showAfter && <DropLine indent={isCollection ? 12 : 24} />}
    </>
  )
}
