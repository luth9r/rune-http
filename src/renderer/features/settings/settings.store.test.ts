import { describe, it, expect, beforeEach } from 'vitest'
import { useSettingsStore } from './settings.store'

describe('settings store', () => {
  beforeEach(() => {
    useSettingsStore.setState({
      theme: 'dark',
      fontSize: 13,
      language: 'en',
      sidebarVisible: true,
      responsePanelVisible: true,
      zoomLevel: 1.0,
      shortcuts: {
        toggleSidebar: 'CommandOrControl+\\',
      }
    })
  })

  it('sets theme', () => {
    useSettingsStore.getState().setTheme('light')
    expect(useSettingsStore.getState().theme).toBe('light')
  })

  it('sets language', () => {
    useSettingsStore.getState().setLanguage('ua')
    expect(useSettingsStore.getState().language).toBe('ua')
  })

  it('sets font size', () => {
    useSettingsStore.getState().setFontSize(16)
    expect(useSettingsStore.getState().fontSize).toBe(16)
  })

  it('sets zoom level and rounds it', () => {
    useSettingsStore.getState().setZoomLevel(1.23456)
    expect(useSettingsStore.getState().zoomLevel).toBe(1.23)
  })

  it('sets sidebar visibility', () => {
    useSettingsStore.getState().setSidebarVisible(false)
    expect(useSettingsStore.getState().sidebarVisible).toBe(false)
  })

  it('sets font family', () => {
    useSettingsStore.getState().setFontFamily('Roboto')
    expect(useSettingsStore.getState().fontFamily).toBe('Roboto')
  })

  it('sets mono font family', () => {
    useSettingsStore.getState().setMonoFontFamily('Fira Code')
    expect(useSettingsStore.getState().monoFontFamily).toBe('Fira Code')
  })

  it('sets show scale indicator', () => {
    useSettingsStore.getState().setShowScaleIndicator(false)
    expect(useSettingsStore.getState().showScaleIndicator).toBe(false)
  })

  it('sets resizing value', () => {
    useSettingsStore.getState().setResizingValue('100px')
    expect(useSettingsStore.getState().resizingValue).toBe('100px')
  })

  it('sets response panel visibility', () => {
    useSettingsStore.getState().setResponsePanelVisible(false)
    expect(useSettingsStore.getState().responsePanelVisible).toBe(false)
  })

  it('sets shortcut', () => {
    useSettingsStore.getState().setShortcut('toggleSidebar', 'Ctrl+B')
    expect(useSettingsStore.getState().shortcuts.toggleSidebar).toBe('Ctrl+B')
  })
})
