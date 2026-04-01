import { useState } from 'react'
import { X } from 'lucide-react'
import { useTabsStore } from '@/features/tabs/tabs.store'
import { Button } from '@/components/ui/button'
import { useSortable } from '@dnd-kit/sortable'
import type { Tab } from '@/types'
import '../tab-bar.css'
import { cn } from 'renderer/lib/utils'

interface TabItemProps {
  tab: Tab
  isActive: boolean
  onClose: () => void
}

export function TabItem({ tab, isActive, onClose }: TabItemProps) {
  const { setActiveTab } = useTabsStore()
  const [hovered, setHovered] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.id })

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        'tab-item',
        isActive && 'tab-item-active',
        hovered && !isActive && 'tab-item-hover',
        isDragging && 'tab-item-dragging'
      )}
      onClick={() => setActiveTab(tab.id)}
      onMouseDown={e => {
        if (e.button === 1) onClose()
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="tab-item-method" data-method={tab.method}>
        {tab.method}
      </span>

      <span className="tab-item-name">{tab.name || 'New Request'}</span>

      <div className="tab-item-actions">
        {tab.isDirty && <span className="tab-item-dirty-dot" />}
        {(hovered || isActive) && (
          <Button
            className="tab-item-close"
            onClick={e => {
              e.stopPropagation()
              onClose()
            }}
            onPointerDown={e => e.stopPropagation()}
            size="sm"
            variant="ghost-danger"
          >
            <X size={12} />
          </Button>
        )}
        {!(hovered || isActive) && <div className="tab-item-spacer" />}
      </div>
    </div>
  )
}
