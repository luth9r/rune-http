import type React from 'react'
import { cn } from '@/lib/utils'

interface ResizerProps {
  onMouseDown: (e: React.MouseEvent) => void
  direction?: 'horizontal' | 'vertical'
  className?: string
}

export function Resizer({
  onMouseDown,
  direction = 'horizontal',
  className,
}: ResizerProps) {
  return (
    <div
      className={cn(
        'resizer-handle',
        direction === 'horizontal' ? 'resizer-h' : 'resizer-v',
        className
      )}
      onMouseDown={onMouseDown}
    />
  )
}
