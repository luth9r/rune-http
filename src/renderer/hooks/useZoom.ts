import { useEffect, useState } from 'react'

export function useZoom() {
  const [zoomLevel, setZoomLevel] = useState(() => {
    const saved = localStorage.getItem('rune-zoom')
    return saved ? parseFloat(saved) : 1.0
  })

  useEffect(() => {
    if (window.api?.webFrame) {
      window.api.webFrame.setZoomFactor(zoomLevel)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        let newZoom = zoomLevel

        if (e.key === '+' || e.key === '=') {
          e.preventDefault()
          newZoom = Math.min(zoomLevel + 0.1, 2.0)
        } else if (e.key === '-' || e.key === '_') {
          e.preventDefault()
          newZoom = Math.max(zoomLevel - 0.1, 0.5)
        } else if (e.key === '0') {
          e.preventDefault()
          newZoom = 1.0
        } else {
          return
        }

        if (newZoom !== zoomLevel) {
          setZoomLevel(newZoom)
          localStorage.setItem('rune-zoom', newZoom.toString())
          if (window.api?.webFrame) {
            window.api.webFrame.setZoomFactor(newZoom)
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [zoomLevel])

  return zoomLevel
}
