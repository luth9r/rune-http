export type ShortcutModifiers = {
  control?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
}

export function parseShortcut(shortcut: string): { key: string; modifiers: ShortcutModifiers } {
  const parts = shortcut.split('+')
  const key = parts.pop() || ''
  const modifiers: ShortcutModifiers = {}

  parts.forEach(part => {
    const p = part.toLowerCase()
    if (p === 'ctrl' || p === 'control' || p === 'commandorcontrol') {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      if (isMac) modifiers.meta = true
      else modifiers.control = true
    } else if (p === 'shift') {
      modifiers.shift = true
    } else if (p === 'alt') {
      modifiers.alt = true
    } else if (p === 'meta' || p === 'command') {
      modifiers.meta = true
    }
  })

  return { key, modifiers }
}

export function matchShortcut(e: KeyboardEvent | React.KeyboardEvent, shortcut: string): boolean {
  if (!shortcut) return false
  const { key, modifiers } = parseShortcut(shortcut)

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
  
  // Normalize key comparison
  // e.code is usually 'KeyN', 'Digit1', 'Enter', 'Backslash'
  // shortcut key might be 'N', '1', 'Enter', '\', 'Enter'
  
  let eventKey = e.key.toUpperCase()
  if (e.code.startsWith('Key')) {
    eventKey = e.code.replace('Key', '')
  } else if (e.code.startsWith('Digit')) {
    eventKey = e.code.replace('Digit', '')
  } else if (e.code === 'Backslash') {
    eventKey = '\\'
  }

  const targetKey = key.toUpperCase()
  
  const mMatch = 
    !!e.ctrlKey === !!modifiers.control &&
    !!e.shiftKey === !!modifiers.shift &&
    !!e.altKey === !!modifiers.alt &&
    !!e.metaKey === !!modifiers.meta

  return mMatch && eventKey === targetKey
}

export function formatShortcut(shortcut: string): string {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
  return shortcut
    .replace('CommandOrControl', isMac ? '⌘' : 'Ctrl')
    .replace('Control', isMac ? '⌃' : 'Ctrl')
    .replace('Alt', isMac ? '⌥' : 'Alt')
    .replace('Shift', isMac ? '⇧' : 'Shift')
    .replace('Meta', '⌘')
}
