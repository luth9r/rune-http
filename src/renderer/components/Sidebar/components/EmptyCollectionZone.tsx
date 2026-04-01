import type React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'

export function EmptyCollectionZone({
  collectionId,
  isActive,
  style,
}: {
  collectionId: string
  isActive: boolean
  style?: React.CSSProperties
}) {
  const { setNodeRef } = useDroppable({
    id: `empty-${collectionId}`,
    data: { type: 'emptyCollection', collectionId },
  })

  return (
    <div
      className={cn('sidebar-empty-zone', isActive && 'is-active')}
      ref={setNodeRef}
      style={style}
    />
  )
}
