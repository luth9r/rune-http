import React from 'react'
import {
  Plus,
  ChevronRight,
  ChevronDown,
  Edit2,
  Trash2,
  MoreVertical,
} from 'lucide-react'
import { SidebarItemBase } from 'renderer/components/Sidebar/components/SidebarLayout'
import { Button } from '@/components/ui/button'
import type { CollectionItem } from '@/types'
import {
  ContextMenu,
  type ContextMenuItem,
} from '@/components/shared/ContextMenu'
import { cn } from '@/lib/utils'

interface SidebarItemProps {
  item: CollectionItem | any
  isDragging?: boolean
  isDropTarget?: boolean
  onClick?: () => void
  onRemove?: () => void
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
  onRename,
  onAddRequest,
  onToggle,
  level = 0,
}: SidebarItemProps) {
  const [contextMenu, setContextMenu] = React.useState<{
    x: number
    y: number
  } | null>(null)
  const [isRenaming, setIsRenaming] = React.useState(false)
  const [tempName, setTempName] = React.useState(item.name)
  const isCollection = item.type === 'collection'

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

  const menuItems: ContextMenuItem[] = [
    {
      label: 'Rename',
      icon: <Edit2 size={14} />,
      onClick: () => setIsRenaming(true),
    },
    {
      label: 'Delete',
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
