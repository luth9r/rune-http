import { useState, useCallback, useEffect, useRef } from 'react'
import { useSettingsStore } from '@/features/settings/settings.store'

interface UseResizableProps {
  persistenceKey: string
  initialSize: number
  minSize: number
  maxSize: number
  direction?: 'horizontal' | 'vertical'
  reverse?: boolean // If true, dragging left increases size (for right-aligned panels)
  silent?: boolean // If true, don't update global resizingValue store
}

export function useResizable({
  persistenceKey,
  initialSize,
  minSize,
  maxSize,
  direction = 'horizontal',
  reverse = false,
  silent = false,
}: UseResizableProps) {
  const [size, setSize] = useState(() => {
    const saved = localStorage.getItem(persistenceKey)
    const parsed = saved ? parseInt(saved, 10) : initialSize
    // Ensure initial size respects min/max
    return Math.max(minSize, Math.min(maxSize, parsed))
  })

  const { setResizingValue } = useSettingsStore()
  const [isResizing, setIsResizing] = useState(false)
  const startPos = useRef(0)
  const startSize = useRef(0)

  const startResizing = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setIsResizing(true)
      startPos.current = direction === 'horizontal' ? e.clientX : e.clientY
      startSize.current = size
    },
    [direction, size]
  )

  const stopResizing = useCallback(() => {
    setIsResizing(false)
    if (!silent) setResizingValue(null)
  }, [setResizingValue, silent])

  const resize = useCallback(
    (e: MouseEvent) => {
      if (isResizing) {
        const currentPos = direction === 'horizontal' ? e.clientX : e.clientY
        const delta = currentPos - startPos.current
        const newSize = reverse
          ? startSize.current - delta
          : startSize.current + delta
        const boundedSize = Math.max(minSize, Math.min(maxSize, newSize))

        setSize(boundedSize)
        if (!silent) setResizingValue(`${boundedSize}px`)
      }
    },
    [isResizing, minSize, maxSize, direction, reverse, setResizingValue, silent]
  )

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize)
      window.addEventListener('mouseup', stopResizing)
      document.body.style.cursor =
        direction === 'horizontal' ? 'col-resize' : 'row-resize'
      document.body.style.userSelect = 'none'
    } else {
      window.removeEventListener('mousemove', resize)
      window.removeEventListener('mouseup', stopResizing)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      localStorage.setItem(persistenceKey, size.toString())
    }

    return () => {
      window.removeEventListener('mousemove', resize)
      window.removeEventListener('mouseup', stopResizing)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing, resize, stopResizing, persistenceKey, size, direction])

  return {
    size,
    isResizing,
    startResizing,
  }
}
