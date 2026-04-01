import { useState } from 'react'
import { useZoom } from '@/hooks/useZoom'
import { useShortcuts } from 'renderer/hooks/useShortcuts'
import { useTabsStore, selectActiveTab } from '@/features/tabs/tabs.store'
import { ActivityBar } from '@/components/ActivityBar'
import { SaveRequestModal } from '@/components/shared/modals/SaveRequestModal'

import { HttpScreen } from './HttpScreen'
import { EnvironmentsScreen } from './EnvironmentsScreen'
import { SettingsScreen } from './SettingsScreen'
import { FontScaleIndicator } from '../components/shared/ScaleIndicator'
import { useSettingsStore } from '../features/settings/settings.store'
import { useEffect } from 'react'
import './screens.css'

export function MainScreen() {
  useShortcuts()
  useZoom()

  const { fontSize, fontFamily, monoFontFamily, theme } = useSettingsStore()

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--user-font-size', `${fontSize}px`)

    // Ensure fonts are quoted if they contain spaces and have fallbacks
    const quote = (f: string) =>
      f.startsWith("'") || f.startsWith('"') ? f : `'${f}'`

    root.style.setProperty(
      '--user-font-sans',
      `${quote(fontFamily)}, sans-serif`
    )
    root.style.setProperty(
      '--user-font-mono',
      `${quote(monoFontFamily)}, monospace`
    )

    // Apply theme class
    if (theme === 'arch') {
      document.body.classList.add('theme-arch')
    } else {
      document.body.classList.remove('theme-arch')
    }
  }, [fontSize, fontFamily, monoFontFamily, theme])

  const [currentView, setView] = useState<
    'explorer' | 'env' | 'database' | 'settings'
  >('explorer')

  const activeTab = useTabsStore(selectActiveTab)
  const isSaveModalOpen = useTabsStore(s => s.isSaveModalOpen)
  const setSaveModalOpen = useTabsStore(s => s.setSaveModalOpen)

  return (
    <main className="screen-root">
      <ActivityBar currentView={currentView} setView={setView} />

      {currentView === 'explorer' && <HttpScreen />}
      {currentView === 'env' && <EnvironmentsScreen />}
      {currentView === 'database' && (
        <div className="screen-coming-soon">Database Coming Soon</div>
      )}
      {currentView === 'settings' && <SettingsScreen />}

      {isSaveModalOpen && activeTab && (
        <SaveRequestModal
          isOpen={isSaveModalOpen}
          onClose={() => setSaveModalOpen(false)}
          tabId={activeTab.id}
        />
      )}
      <FontScaleIndicator />
    </main>
  )
}
