import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import './context-menu.css'

export type ContextMenuItem = 
  | {
      label: string
      icon?: React.ReactNode
      onClick: () => void
      variant?: 'default' | 'danger'
      disabled?: boolean
      type?: 'item'
    }
  | {
      type: 'separator'
    }

interface ContextMenuProps {
  x: number
  y: number
  items: ContextMenuItem[]
  onClose: () => void
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x, y })

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect()
      let newX = x
      let newY = y

      if (x + rect.width > window.innerWidth) {
        newX = x - rect.width
      }
      if (y + rect.height > window.innerHeight) {
        newY = y - rect.height
      }

      if (newX !== x || newY !== y) {
        setPosition({ x: newX, y: newY })
      }
    }

    window.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [x, y, onClose])

  return createPortal(
    <div
      className="context-menu"
      ref={menuRef}
      style={{
        top: position.y,
        left: position.x,
      }}
    >
      {items.map((item, i) => {
        if (item.type === 'separator') {
          return <div className="context-menu-separator" key={i} />
        }
        return (
          <button
            className={cn(
              'context-menu-item',
              item.variant === 'danger' && 'context-menu-danger',
              item.disabled && 'context-menu-disabled'
            )}
            disabled={item.disabled}
            key={i}
            onClick={e => {
              e.stopPropagation()
              if (!item.disabled) {
                item.onClick()
                onClose()
              }
            }}
          >
            {item.icon && <span className="context-menu-icon">{item.icon}</span>}
            <span className="context-menu-label">{item.label}</span>
          </button>
        )
      })}
    </div>,
    document.body
  )
}
