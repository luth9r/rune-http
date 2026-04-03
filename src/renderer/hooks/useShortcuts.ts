import { useEffect } from 'react'
import { useTabsStore } from '@/features/tabs/tabs.store'
import { useHttpRequest } from './useHttpRequest'
import { useCollectionsStore } from '@/features/collections/collections.store'
import { useSettingsStore } from '@/features/settings/settings.store'
import { parseShortcut } from '../utils/shortcuts'

export function useShortcuts(currentView?: string) {
  const { tabs, activeTabId, setActiveTab, openTab, closeTab } = useTabsStore()
  const {
    shortcuts,
    sidebarVisible,
    setSidebarVisible,
    responsePanelVisible,
    setResponsePanelVisible,
  } = useSettingsStore()

  const { sendRequest } = useHttpRequest()
  const updateRequest = useCollectionsStore(s => s.updateRequest)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return

      // Helper to match shortcut
      const matches = (action: string) => {
        const shortcut = shortcuts[action]
        if (!shortcut) return false

        const { key, modifiers } = parseShortcut(shortcut)
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0

        const ctrlMatch = !!modifiers.control === (isMac ? false : e.ctrlKey)
        const metaMatch = !!modifiers.meta === (isMac ? e.metaKey : false)
        const altMatch = !!modifiers.alt === e.altKey
        const shiftMatch = !!modifiers.shift === e.shiftKey

        // For CommandOrControl
        const cmdOrCtrlMatch =
          shortcut.includes('CommandOrControl') &&
          (isMac ? e.metaKey : e.ctrlKey)

        const modifiersMatch = cmdOrCtrlMatch || (ctrlMatch && metaMatch && altMatch && shiftMatch)

        let eventKey = e.key.toUpperCase()
        if (e.code.startsWith('Key')) {
          eventKey = e.code.replace('Key', '')
        } else if (e.code.startsWith('Digit')) {
          eventKey = e.code.replace('Digit', '')
        } else if (e.code === 'Backslash') {
          eventKey = '\\'
        }

        return modifiersMatch && eventKey === key.toUpperCase()
      }

      const isSettings = currentView === 'settings'

      // Toggle Sidebar
      if (matches('toggleSidebar') && !isSettings) {
        e.preventDefault()
        setSidebarVisible(!sidebarVisible)
      }

      // Toggle Response Panel
      if (matches('toggleResponsePanel') && !isSettings) {
        e.preventDefault()
        setResponsePanelVisible(!responsePanelVisible)
      }

      // New Tab
      if (matches('newTab')) {
        e.preventDefault()
        openTab()
      }

      // Close Tab
      if (matches('closeTab')) {
        if (activeTabId) {
          e.preventDefault()
          closeTab(activeTabId)
        }
      }

      // Send Request
      if (matches('sendRequest')) {
        if (activeTabId) {
          e.preventDefault()
          sendRequest(activeTabId)
        }
      }

      // Save Request
      if (matches('saveRequest')) {
        e.preventDefault()
        const state = useTabsStore.getState()
        if (state.activeTabId) {
          state.saveTab(state.activeTabId, updateRequest)
        }
      }

      // Focus Search
      if (matches('focusSearch')) {
        e.preventDefault()
        document.getElementById('sidebar-search-input')?.focus()
      }

      // Alt + Digit (Switch Tabs 1-9) - Special case
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        if (e.code.startsWith('Digit')) {
          const digit = parseInt(e.code.replace('Digit', ''), 10)
          if (digit >= 1 && digit <= 9) {
            const targetTab = tabs[digit - 1]
            if (targetTab) {
              e.preventDefault()
              setActiveTab(targetTab.id)
            }
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    tabs,
    activeTabId,
    openTab,
    closeTab,
    setActiveTab,
    sendRequest,
    updateRequest,
    shortcuts,
    sidebarVisible,
    setSidebarVisible,
    responsePanelVisible,
    setResponsePanelVisible,
    currentView,
  ])
}
