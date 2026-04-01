import type React from 'react'

export function DropLine({ indent = 24 }: { indent?: number }) {
  return (
    <div
      className="sidebar-drop-line"
      style={{ '--indent': `${indent}px` } as React.CSSProperties}
    >
      <div className="sidebar-drop-line-inner" />
      <div className="sidebar-drop-line-dot" />
    </div>
  )
}
