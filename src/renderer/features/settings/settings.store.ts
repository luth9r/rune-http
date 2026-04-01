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
  setTheme: (theme: SettingsState['theme']) => void
  setFontSize: (size: number) => void
  setFontFamily: (family: string) => void
  setMonoFontFamily: (family: string) => void
  setShowScaleIndicator: (show: boolean) => void
  setZoomLevel: (zoom: number) => void
  setResizingValue: (value: string | null) => void
  setDataStoragePath: (path: string | null) => void
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

      setTheme: theme =>
        set(state => {
          state.theme = theme
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
