import type React from 'react'
import { useEffect, useState, useRef } from 'react'
import { useSettingsStore } from '@/features/settings/settings.store'
import './scale-indecator.css'

export function FontScaleIndicator() {
  const { zoomLevel, resizingValue, showScaleIndicator } = useSettingsStore()
  const [visible, setVisible] = useState(false)
  const [displayValue, setDisplayValue] = useState('')
  const [displayLabel, setDisplayLabel] = useState('')
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isFirstRender = useRef(true)

  // Handle Resizing Indicator (Immediate and persistent while resizing)
  useEffect(() => {
    if (!showScaleIndicator) return

    if (resizingValue) {
      setDisplayLabel('Width')
      setDisplayValue(resizingValue)
      setVisible(true)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    } else {
      // When resizing stops, hide after a short delay
      timeoutRef.current = setTimeout(() => {
        setVisible(false)
      }, 500)
    }
  }, [resizingValue, showScaleIndicator])

  // Handle Zoom Indicator (Briefly visible on change)
  useEffect(() => {
    if (!showScaleIndicator || resizingValue) return

    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    const zoomPercent = `${Math.round(zoomLevel * 100)}%`
    setDisplayLabel('Zoom')
    setDisplayValue(zoomPercent)
    setVisible(true)

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setVisible(false)
    }, 1500)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [zoomLevel, showScaleIndicator, resizingValue])

  if (!visible) return null

  return (
    <div style={styles.container}>
      <div style={styles.badge}>
        <span style={styles.label}>{displayLabel}</span>
        <span style={styles.value}>{displayValue}</span>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    bottom: 32,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 9999,
    pointerEvents: 'none',
  },
  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 14px',
    background: 'var(--eos-surface-2)',
    borderRadius: 20,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
    color: 'var(--eos-text)',
    backdropFilter: 'blur(8px)',
  },
  label: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    fontWeight: 700,
    color: 'var(--eos-muted)',
  },
  value: {
    fontSize: 14,
    fontWeight: 700,
    color: 'var(--eos-accent)',
    fontFamily: 'var(--font-mono)',
    minWidth: '45px',
    textAlign: 'center',
  },
}
