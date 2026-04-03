import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { electronStorage } from 'renderer/lib/electronStorage'

interface SettingsState {
  theme: 'dark' | 'light' | 'system' | 'arch'
  fontSize: number
  fontFamily: string
  monoFontFamily: string
  showScaleIndicator: boolean
  zoomLevel: number
  resizingValue: string | null
  dataStoragePath: string | null
  language: 'en' | 'ua'
  sidebarVisible: boolean
  responsePanelVisible: boolean
  shortcuts: Record<string, string>
  setTheme: (theme: SettingsState['theme']) => void
  setLanguage: (lang: SettingsState['language']) => void
  setFontSize: (size: number) => void
  setFontFamily: (family: string) => void
  setMonoFontFamily: (family: string) => void
  setShowScaleIndicator: (show: boolean) => void
  setZoomLevel: (zoom: number) => void
  setResizingValue: (value: string | null) => void
  setDataStoragePath: (path: string | null) => void
  setSidebarVisible: (visible: boolean) => void
  setResponsePanelVisible: (visible: boolean) => void
  setShortcut: (action: string, shortcut: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    immer(set => ({
      theme: 'dark',
      fontSize: 13,
      fontFamily: "'Inter', sans-serif",
      monoFontFamily: "'JetBrains Mono', monospace",
      showScaleIndicator: true,
      zoomLevel: 1.0,
      resizingValue: null,
      dataStoragePath: null,
      language: 'en',

      setTheme: theme =>
        set(state => {
          state.theme = theme
        }),

      setLanguage: lang =>
        set(state => {
          state.language = lang
        }),

      setFontSize: size =>
        set(state => {
          state.fontSize = size
        }),

      setFontFamily: family =>
        set(state => {
          state.fontFamily = family
        }),

      setMonoFontFamily: family =>
        set(state => {
          state.monoFontFamily = family
        }),

      setShowScaleIndicator: show =>
        set(state => {
          state.showScaleIndicator = show
        }),

      setZoomLevel: zoom =>
        set(state => {
          state.zoomLevel = zoom
        }),

      setResizingValue: value =>
        set(state => {
          state.resizingValue = value
        }),

      setDataStoragePath: path =>
        set(state => {
          state.dataStoragePath = path
        }),

      sidebarVisible: true,
      responsePanelVisible: true,
      shortcuts: {
        toggleSidebar: 'CommandOrControl+\\',
        toggleResponsePanel: 'CommandOrControl+J',
        sendRequest: 'CommandOrControl+Enter',
        saveRequest: 'CommandOrControl+S',
        newTab: 'CommandOrControl+N',
        closeTab: 'CommandOrControl+W',
        focusSearch: 'CommandOrControl+F',
      },

      setSidebarVisible: visible =>
        set(state => {
          state.sidebarVisible = visible
        }),

      setResponsePanelVisible: visible =>
        set(state => {
          state.responsePanelVisible = visible
        }),

      setShortcut: (action, shortcut) =>
        set(state => {
          state.shortcuts[action] = shortcut
        }),
    })),
    {
      name: 'rune-settings',
      storage: createJSONStorage(() => electronStorage),
      // Don't persist resizingValue
      partialize: state => {
        const { resizingValue: _, ...rest } = state
        return rest
      },
    }
  )
)
