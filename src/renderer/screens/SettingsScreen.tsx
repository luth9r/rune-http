import React, { useCallback, useEffect } from 'react'
import { Folder, Type, Palette } from 'lucide-react'
import { useSettingsStore } from '@/features/settings/settings.store'
import { Button } from '../components/ui/button'
import { Select } from '../components/ui/select'
import { NumberInput } from '../components/ui/NumberInput'
import './settings-screen.css'

export function SettingsScreen() {
  const {
    theme,
    fontSize,
    fontFamily,
    monoFontFamily,
    showScaleIndicator,
    zoomLevel,
    dataStoragePath,
    setTheme,
    setFontSize,
    setFontFamily,
    setMonoFontFamily,
    setShowScaleIndicator,
    setZoomLevel,
    setDataStoragePath,
  } = useSettingsStore()

  const [systemFonts, setSystemFonts] = React.useState<string[]>([])

  useEffect(() => {
    window.api.utils.getSystemFonts().then((fonts: string[]) => {
      setSystemFonts(fonts)
    })
  }, [])

  const handleSelectDir = useCallback(async () => {
    const path = await window.api.utils.selectDirectory()
    if (path) {
      setDataStoragePath(path)
    }
  }, [setDataStoragePath])

  const handleResetDir = useCallback(() => {
    setDataStoragePath(null)
  }, [setDataStoragePath])

  return (
    <div className="settings-root">
      <header className="settings-header">
        <h1 className="settings-title">Settings</h1>
      </header>

      <div className="settings-content">
        {/* Appearance Section */}
        <section className="settings-section">
          <div className="settings-section-header">
            <Type size={18} />
            <h2 className="settings-section-title">Appearance</h2>
          </div>

          <div className="settings-field">
            <div className="settings-field-info">
              <label className="settings-label">Font Size</label>
              <span className="settings-description">
                Global font size for the application.
              </span>
            </div>
            <NumberInput
              max={24}
              min={8}
              onChange={setFontSize}
              size="sm"
              unit="px"
              value={fontSize}
            />
          </div>

          <div className="settings-field">
            <div className="settings-field-info">
              <label className="settings-label">App Zoom</label>
              <span className="settings-description">
                Overall interface scale.
              </span>
            </div>
            <NumberInput
              max={2.0}
              min={0.5}
              onChange={setZoomLevel}
              size="sm"
              step={0.05}
              unit="x"
              value={zoomLevel}
            />
          </div>

          <div className="settings-field">
            <div className="settings-field-info">
              <label className="settings-label">UI Font Family</label>
              <span className="settings-description">
                System font for labels, buttons, and menus.
              </span>
            </div>
            <Select
              onChange={setFontFamily}
              options={[
                {
                  label: 'Sans Serif (Inter)',
                  value: "'Inter', sans-serif",
                  style: { fontFamily: "'Inter', sans-serif" },
                },
                {
                  label: 'System Default',
                  value: 'system-ui, sans-serif',
                  style: { fontFamily: 'system-ui, sans-serif' },
                },
                ...systemFonts.map(f => ({
                  label: f,
                  value: f,
                  style: { fontFamily: `'${f}', sans-serif` },
                })),
              ]}
              value={fontFamily}
            />
          </div>

          <div className="settings-field">
            <div className="settings-field-info">
              <label className="settings-label">Monospace Font Family</label>
              <span className="settings-description">
                Used for code editors and JSON views.
              </span>
            </div>
            <Select
              onChange={setMonoFontFamily}
              options={[
                {
                  label: 'JetBrains Mono',
                  value: "'JetBrains Mono', monospace",
                  style: { fontFamily: "'JetBrains Mono', monospace" },
                },
                {
                  label: 'Fira Code',
                  value: "'Fira Code', monospace",
                  style: { fontFamily: "'Fira Code', monospace" },
                },
                {
                  label: 'Cascadia Code',
                  value: "'Cascadia Code', monospace",
                  style: { fontFamily: "'Cascadia Code', monospace" },
                },
                {
                  label: 'System Monospace',
                  value: 'monospace',
                  style: { fontFamily: 'monospace' },
                },
                ...systemFonts
                  .filter(f => f.toLowerCase().includes('mono'))
                  .map(f => ({
                    label: f,
                    value: f,
                    style: { fontFamily: `'${f}', monospace` },
                  })),
              ]}
              value={monoFontFamily}
            />
          </div>

          <div className="settings-field">
            <div className="settings-field-info">
              <label className="settings-label">UI Feedback Indicator</label>
              <span className="settings-description">
                Show zoom level and panel dimensions while adjusting.
              </span>
            </div>
            <input
              checked={showScaleIndicator}
              className="settings-checkbox"
              onChange={e => setShowScaleIndicator(e.target.checked)}
              type="checkbox"
            />
          </div>
        </section>

        {/* Theme Section */}
        <section className="settings-section">
          <div className="settings-section-header">
            <Palette size={18} />
            <h2 className="settings-section-title">Theme</h2>
          </div>
          <div className="settings-field">
            <div className="settings-field-info">
              <label className="settings-label">Current Theme</label>
              <span className="settings-description">
                Switch between available themes.
              </span>
            </div>
            <Select
              onChange={val => setTheme(val as any)}
              options={[
                { label: 'EndeavourOS (Dark)', value: 'dark' },
                { label: 'Arch Linux', value: 'arch' },
                { label: 'Light (Coming Soon)', value: 'light' },
              ]}
              value={theme}
            />
          </div>
        </section>

        {/* Data Section */}
        <section className="settings-section">
          <div className="settings-section-header">
            <Folder size={18} />
            <h2 className="settings-section-title">Data Management</h2>
          </div>
          <div className="settings-field">
            <div className="settings-field-info">
              <label className="settings-label">Storage Location</label>
              <span className="settings-description">
                Where your collections and request history are saved.
              </span>
            </div>
            <div className="settings-storage-controls">
              <div className="settings-path-display">
                {dataStoragePath || 'Default (App Data)'}
              </div>
              <div className="settings-action-buttons">
                <Button onClick={handleSelectDir} size="sm">
                  Change
                </Button>
                {dataStoragePath && (
                  <Button onClick={handleResetDir} size="sm" variant="ghost">
                    Reset
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
