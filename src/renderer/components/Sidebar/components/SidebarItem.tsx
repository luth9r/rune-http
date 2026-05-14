import React from 'react'
import {
  Plus,
  ChevronRight,
  ChevronDown,
  Edit2,
  Trash2,
  MoreVertical,
  Copy,
  Download,
  Upload,
} from 'lucide-react'
import { SidebarItemBase } from 'renderer/components/Sidebar/components/SidebarLayout'
import { Button } from '@/components/ui/button'
import { useCollectionsStore } from '@/features/collections/collections.store'
import type { CollectionItem, HttpRequest } from '@/types'
import { v4 as uuid } from 'uuid'
import { detectAndImport } from '@/features/collections/importers'
import {
  ContextMenu,
  type ContextMenuItem,
} from '@/components/shared/ContextMenu'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/i18n'
import { getUniqueName } from '@/utils/naming'

interface SidebarItemProps {
  item: CollectionItem | any
  isDragging?: boolean
  isDropTarget?: boolean
  onClick?: () => void
  onRemove?: () => void
  onDuplicate?: () => void
  onExport?: () => void
  onRename?: (newName: string) => void
  onAddRequest?: () => void
  onToggle?: () => void
  level?: number
}

export function SidebarItem({
  item,
  isDragging,
  isDropTarget,
  onClick,
  onRemove,
  onDuplicate,
  onExport,
  onRename,
  onAddRequest,
  onToggle,
  level = 0,
}: SidebarItemProps) {
  const { t } = useTranslation()
  const { importIntoCollection, collections } = useCollectionsStore()
  const [contextMenu, setContextMenu] = React.useState<{
    x: number
    y: number
  } | null>(null)
  const [isRenaming, setIsRenaming] = React.useState(false)
  const [tempName, setTempName] = React.useState(item.name)
  const isCollection = item.type === 'collection'
  const collectionId = level === 0 ? item.id : (item as any).collectionId

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }

  const handleCommitRename = () => {
    if (tempName.trim() && tempName !== item.name) {
      onRename?.(tempName.trim())
    }
    setIsRenaming(false)
  }

  const handleImportToCollection = async () => {
    try {
      const path = await window.api.utils.selectFile()
      if (!path) return

      const content = await window.api.utils.readFile(path)
      const result = detectAndImport(content)
      if (!result) return

      if (result.type === 'request') {
        const request = result.data as HttpRequest
        const requestId = uuid()

        // Find existing names in this collection
        const col = collections.find(c => c.id === item.id)
        const existingNames = col?.items.map(i => i.name) || []
        const uniqueName = getUniqueName(request.name || 'Imported Request', existingNames)

        importIntoCollection(item.id, [
          {
            id: requestId,
            type: 'request',
            name: uniqueName,
            request: { ...request, id: requestId, name: uniqueName },
          },
        ])
      } else {
      }
    } catch (e) {
    }
  }

  const menuItems: ContextMenuItem[] = [
    {
      label: t('sidebar.rename'),
      icon: <Edit2 size={14} />,
      onClick: () => setIsRenaming(true),
    },
    {
      label: t('sidebar.duplicate'),
      icon: <Copy size={14} />,
      onClick: () => onDuplicate?.(),
    },
    ...(isCollection ? ([
      {
        label: t('sidebar.import'),
        icon: <Upload size={14} />,
        onClick: handleImportToCollection,
      }
    ] as ContextMenuItem[]) : []),
    {
      label: t('sidebar.export'),
      icon: <Download size={14} />,
      onClick: () => onExport?.(),
    },
    {
      type: 'separator',
    },
    {
      label: t('sidebar.delete'),
      icon: <Trash2 size={14} />,
      onClick: () => onRemove?.(),
      variant: 'danger',
    },
  ]

  if (isRenaming) {
    return (
      <div
        className="sidebar-item is-renaming"
        style={{ '--level': level } as React.CSSProperties}
      >
        <input
          autoFocus
          className="sidebar-inline-input"
          onBlur={handleCommitRename}
          onChange={e => setTempName(e.target.value)}
          onClick={e => e.stopPropagation()}
          onKeyDown={e => {
            if (e.key === 'Enter') handleCommitRename()
            if (e.key === 'Escape') {
              setTempName(item.name)
              setIsRenaming(false)
            }
          }}
          onPointerDown={e => e.stopPropagation()}
          value={tempName}
        />
      </div>
    )
  }

  return (
    <>
      <SidebarItemBase
        className={cn(
          'sidebar-item-row',
          isCollection ? 'is-collection' : 'is-request',
          isDropTarget && 'is-drop-target'
        )}
        isActive={isDropTarget}
        onClick={isCollection ? onToggle : onClick}
        onContextMenu={handleContextMenu}
        style={{ '--level': level } as React.CSSProperties}
      >
        <div className="sidebar-item-content">
          {isCollection && (
            <div
              className="sidebar-item-chevron"
              onClick={e => {
                e.stopPropagation()
                onToggle?.()
              }}
            >
              {item.isOpen ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </div>
          )}

          {!isCollection && (
            <span
              className="sidebar-item-method"
              data-method={item.request?.method || 'GET'}
            >
              {item.request?.method}
            </span>
          )}

          <span className="sidebar-item-name">{item.name}</span>
        </div>

        <div className="sidebar-item-actions">
          {isCollection && (
            <Button
              onClick={e => {
                e.stopPropagation()
                onAddRequest?.()
              }}
              size="sm"
              variant="icon"
            >
              <Plus size={14} />
            </Button>
          )}
          <Button
            onClick={e => {
              e.stopPropagation()
              handleContextMenu(e)
            }}
            size="sm"
            variant="icon"
          >
            <MoreVertical size={14} />
          </Button>
        </div>
      </SidebarItemBase>

      {contextMenu && (
        <ContextMenu
          items={menuItems}
          onClose={() => setContextMenu(null)}
          x={contextMenu.x}
          y={contextMenu.y}
        />
      )}
    </>
  )
}
