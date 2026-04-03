import type React from 'react'
import { useState } from 'react'
import {
  Globe,
  ShieldCheck,
  Trash2,
  GripVertical,
  Edit2,
  MoreVertical,
  Check,
} from 'lucide-react'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { SidebarItemBase } from 'renderer/components/Sidebar/components/SidebarLayout'
import {
  GLOBAL_ENV_ID,
  GLOBAL_ENV_NAME,
} from '@/features/environments/environments.constants'
import { Button } from '@/components/ui/button'
import type { Environment, DropPosition } from '@/types'
import { ContextMenu } from 'renderer/components/shared/ContextMenu'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/i18n'
import './env-sidebar.css'

interface EnvSidebarItemProps {
  env: Environment
  isActive: boolean
  isActivated?: boolean
  isDragging?: boolean
  dropIndicator?: DropPosition | null
  onSelect: (id: string) => void
  onActivate?: (id: string | null) => void
  onDelete: (env: Environment) => void
  onRename: (id: string, name: string) => void
}

export function EnvSidebarItem({
  env,
  isActive,
  isActivated,
  isDragging,
  dropIndicator,
  onSelect,
  onActivate,
  onDelete,
  onRename,
}: EnvSidebarItemProps) {
  const { t } = useTranslation()
  const [_isHovered, setIsHovered] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(env.name)
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
  } | null>(null)

  const isGlobal = env.id === GLOBAL_ENV_ID || env.name === GLOBAL_ENV_NAME

  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
  } = useDraggable({
    id: env.id,
    data: { env },
    disabled: isGlobal,
  })

  const { setNodeRef: setDropRef } = useDroppable({
    id: env.id,
    data: { env },
    disabled: isGlobal,
  })

  const setRefs = (el: HTMLElement | null) => {
    if (isGlobal) return
    setDragRef(el)
    setDropRef(el)
  }

  const handleRename = () => {
    if (renameValue.trim() && renameValue !== env.name) {
      onRename(env.id, renameValue.trim())
    }
    setIsRenaming(false)
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }

  return (
    <div className="env-sidebar-item-root">
      {dropIndicator === 'before' && <div className="env-sidebar-drop-line" />}
      <SidebarItemBase
        isActive={isActive}
        isDragging={isDragging}
        onClick={() => !isRenaming && onSelect(env.id)}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        ref={setRefs}
      >
        <div className="env-sidebar-item-left">
          {!isGlobal && (
            <div {...listeners} {...attributes} className="env-sidebar-grip">
              <GripVertical color="var(--eos-muted)" size={12} />
            </div>
          )}
          <div
            className={cn(
              'env-sidebar-icon',
              isGlobal && 'is-global',
              isActivated && 'is-activated'
            )}
          >
            {isActivated ? (
              <Check color="var(--eos-success, #10b981)" size={13} strokeWidth={3} />
            ) : isGlobal ? (
              <Globe color="var(--eos-accent)" size={13} />
            ) : (
              <ShieldCheck color="var(--eos-muted)" size={13} />
            )}
          </div>
          {isRenaming ? (
            <input
              autoFocus
              className="env-sidebar-rename-input"
              onBlur={handleRename}
              onChange={e => setRenameValue(e.target.value)}
              onClick={e => e.stopPropagation()}
              onKeyDown={e => {
                if (e.key === 'Enter') handleRename()
                if (e.key === 'Escape') {
                  setRenameValue(env.name)
                  setIsRenaming(false)
                }
              }}
              value={renameValue}
            />
          ) : (
            <span
              className={cn(
                'env-sidebar-name',
                isActive ? 'is-active' : 'is-inactive'
              )}
              onDoubleClick={e => {
                if (isGlobal) return
                e.stopPropagation()
                setIsRenaming(true)
              }}
            >
              {isGlobal ? t('env.global') : env.name}
            </span>
          )}
        </div>

        <div className="env-sidebar-actions">
          <Button
            className="env-sidebar-more-btn"
            onClick={e => {
              e.stopPropagation()
              handleContextMenu(e)
            }}
            size="sm"
            variant="ghost"
          >
            <MoreVertical size={12} />
          </Button>
        </div>

        {contextMenu && (
          <ContextMenu
            items={[
              ...(!isGlobal
                ? ([
                    {
                      label: isActivated ? t('common.deactivate') : t('common.activate'),
                      icon: <Check size={14} />,
                      onClick: () => onActivate?.(isActivated ? null : env.id),
                    },
                    { type: 'separator' },
                  ] as const)
                : []),
              {
                label: t('sidebar.rename'),
                icon: <Edit2 size={14} />,
                onClick: () => setIsRenaming(true),
                disabled: isGlobal,
              },
              {
                label: t('sidebar.delete'),
                icon: <Trash2 size={14} />,
                onClick: () => onDelete(env),
                variant: 'danger',
                disabled: isGlobal,
              },
            ]}
            onClose={() => setContextMenu(null)}
            x={contextMenu.x}
            y={contextMenu.y}
          />
        )}
      </SidebarItemBase>
      {dropIndicator === 'after' && <div className="env-sidebar-drop-line" />}
    </div>
  )
}
