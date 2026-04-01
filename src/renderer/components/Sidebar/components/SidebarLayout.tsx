import React from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

import { Resizer } from '@/components/ui/Resizer'

// ─── Sidebar Root ─────────────────────────────────────────────────────────────
export function SidebarRoot({
  children,
  className,
  style,
  onResizeMouseDown,
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  onResizeMouseDown?: (e: React.MouseEvent) => void
}) {
  return (
    <aside className={cn('sidebar-root', className)} style={style}>
      <div className="sidebar-main">{children}</div>
      {onResizeMouseDown && (
        <Resizer className="sidebar-resizer" onMouseDown={onResizeMouseDown} />
      )}
    </aside>
  )
}

// ─── Sidebar Header ───────────────────────────────────────────────────────────
interface SidebarHeaderProps {
  title: string
  onAdd?: () => void
  children?: React.ReactNode
}

export function SidebarHeader({ title, onAdd, children }: SidebarHeaderProps) {
  return (
    <div className="sidebar-header">
      {children || (
        <>
          <span className="sidebar-title">{title}</span>
          {onAdd && (
            <Button onClick={onAdd} size="xs" variant="icon">
              <Plus size={14} />
            </Button>
          )}
        </>
      )}
    </div>
  )
}

// ─── Sidebar List ─────────────────────────────────────────────────────────────
export function SidebarList({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('sidebar-list', className)}>{children}</div>
}

// ─── Sidebar Input ────────────────────────────────────────────────────────────
export function SidebarInput({
  value,
  onChange,
  onCommit,
  onCancel,
  placeholder,
}: any) {
  return (
    <div className="sidebar-input-wrap">
      <input
        autoFocus
        className="sidebar-inline-input"
        onBlur={() => (!value.trim() ? onCancel() : onCommit())}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') onCommit()
          if (e.key === 'Escape') onCancel()
        }}
        placeholder={placeholder}
        value={value}
      />
    </div>
  )
}

// ─── Sidebar Item Base ────────────────────────────────────────────────────────
interface SidebarItemBaseProps {
  children: React.ReactNode
  isActive?: boolean
  isDragging?: boolean
  onClick?: () => void
  onContextMenu?: React.MouseEventHandler<HTMLDivElement>
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>
  className?: string
  style?: React.CSSProperties
}

export const SidebarItemBase = React.forwardRef<
  HTMLDivElement,
  SidebarItemBaseProps
>(
  (
    {
      children,
      isActive,
      isDragging,
      onClick,
      onContextMenu,
      onMouseEnter,
      onMouseLeave,
      className,
      style,
    },
    ref
  ) => {
    return (
      <div
        className={cn(
          'sidebar-item',
          isActive && 'is-active',
          isDragging && 'is-dragging',
          className
        )}
        onClick={onClick}
        onContextMenu={onContextMenu}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onClick?.()}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        ref={ref}
        role="button"
        style={style}
        tabIndex={0}
      >
        {children}
      </div>
    )
  }
)

SidebarItemBase.displayName = 'SidebarItemBase'
