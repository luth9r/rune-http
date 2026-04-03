import React, { useCallback, useEffect } from 'react'
import { Folder, Type, Palette, Languages, Keyboard, RotateCcw } from 'lucide-react'
import { useSettingsStore } from '@/features/settings/settings.store'
import { useTranslation } from '@/i18n'
import { Button } from '../components/ui/button'
import { Select } from '../components/ui/select'
import { NumberInput } from '../components/ui/NumberInput'
import { formatShortcut } from '../utils/shortcuts'
import './settings-screen.css'

function ShortcutRecorder({
  action,
  currentShortcut,
  onSave,
}: {
  action: string
  currentShortcut: string
  onSave: (shortcut: string) => void
}) {
  const { t } = useTranslation()
  const [isRecording, setIsRecording] = React.useState(false)
  const [recordedKeys, setRecordedKeys] = React.useState<string[]>([])
  const recorderRef = React.useRef<HTMLDivElement>(null)

  const handleKeyDown = React.useCallback(
    (e: KeyboardEvent) => {
      if (!isRecording) return
      e.preventDefault()
      e.stopPropagation()

      const keys: string[] = []
      if (e.ctrlKey) keys.push('Control')
      if (e.shiftKey) keys.push('Shift')
      if (e.altKey) keys.push('Alt')
      if (e.metaKey) keys.push('Meta')

      // Key code normalization
      let key = e.key.toUpperCase()
      if (e.code.startsWith('Key')) {
        key = e.code.replace('Key', '')
      } else if (e.code.startsWith('Digit')) {
        key = e.code.replace('Digit', '')
      } else if (e.code === 'Backslash') {
        key = '\\'
      }

      // Avoid adding only modifiers
      const isModifier = ['CONTROL', 'SHIFT', 'ALT', 'META'].includes(key)
      if (!isModifier && !keys.includes(key)) {
        keys.push(key)
      }

      setRecordedKeys(keys)

      // Auto-save if a non-modifier key is pressed
      if (!isModifier && keys.length > 0) {
        // Special case: replace Meta/Control with CommandOrControl if it's the primary modifier
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
        const finalKeys = keys.map(k => {
          if (isMac && k === 'Meta') return 'CommandOrControl'
          if (!isMac && k === 'Control') return 'CommandOrControl'
          return k
        })

        onSave(finalKeys.join('+'))
        setIsRecording(false)
      }
    },
    [isRecording, onSave]
  )

  React.useEffect(() => {
    if (isRecording) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isRecording, handleKeyDown])

  return (
    <div className="shortcut-recorder-container">
      <div
        className={`shortcut-recorder-box ${isRecording ? 'recording' : ''}`}
        onClick={() => {
          setIsRecording(true)
          setRecordedKeys([])
        }}
        ref={recorderRef}
      >
        {isRecording
          ? recordedKeys.length > 0
            ? recordedKeys.join(' + ')
            : t('settings.shortcut_press_keys')
          : formatShortcut(currentShortcut)}
      </div>
      {isRecording && (
        <Button onClick={() => setIsRecording(false)} size="sm" variant="ghost">
          {t('common.cancel')}
        </Button>
      )}
    </div>
  )
}

export function SettingsScreen() {
  const { t } = useTranslation()
  const {
    theme,
    fontSize,
    fontFamily,
    monoFontFamily,
    showScaleIndicator,
    zoomLevel,
    dataStoragePath,
    language,
    shortcuts,
    setTheme,
    setFontSize,
    setFontFamily,
    setMonoFontFamily,
    setShowScaleIndicator,
    setZoomLevel,
    setDataStoragePath,
    setLanguage,
    setShortcut,
  } = useSettingsStore()

  const [activeTab, setActiveTab] = React.useState<'general' | 'shortcuts'>(
    'general'
  )
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

  const defaultShortcuts: Record<string, string> = {
    toggleSidebar: 'CommandOrControl+\\',
    toggleResponsePanel: 'CommandOrControl+J',
    sendRequest: 'CommandOrControl+Enter',
    saveRequest: 'CommandOrControl+S',
    newTab: 'CommandOrControl+N',
    closeTab: 'CommandOrControl+W',
    focusSearch: 'CommandOrControl+F',
  }

  return (
    <div className="settings-root">
      <aside className="settings-sidebar">
        <div className="settings-nav-header">
          <h2 className="settings-nav-title">{t('settings.title')}</h2>
        </div>
        <nav className="settings-nav-list">
          <div
            className={`settings-nav-item ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <Palette size={16} />
            {t('settings.general')}
          </div>
          <div
            className={`settings-nav-item ${activeTab === 'shortcuts' ? 'active' : ''}`}
            onClick={() => setActiveTab('shortcuts')}
          >
            <Keyboard size={16} />
            {t('settings.shortcuts_tab')}
          </div>
        </nav>
      </aside>

      <main className="settings-main">
        <header className="settings-header">
          <h1 className="settings-section-title">
            {activeTab === 'general'
              ? t('settings.general')
              : t('settings.shortcuts_tab')}
          </h1>
        </header>

        <div className="settings-content">
          {activeTab === 'general' && (
            <>
              {/* Appearance Section */}
              <section className="settings-section">
                <div className="settings-section-header">
                  <Type size={18} />
                  <h2 className="settings-section-title">
                    {t('settings.appearance')}
                  </h2>
                </div>

                <div className="settings-field">
                  <div className="settings-field-info">
                    <label className="settings-label">{t('settings.font_size')}</label>
                    <span className="settings-description">
                      {t('settings.font_size_desc')}
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
                    <label className="settings-label">{t('settings.zoom')}</label>
                    <span className="settings-description">
                      {t('settings.zoom_desc')}
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
                    <label className="settings-label">{t('settings.ui_font')}</label>
                    <span className="settings-description">
                      {t('settings.ui_font_desc')}
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
                    <label className="settings-label">{t('settings.mono_font')}</label>
                    <span className="settings-description">
                      {t('settings.mono_font_desc')}
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
                    <label className="settings-label">{t('settings.feedback')}</label>
                    <span className="settings-description">
                      {t('settings.feedback_desc')}
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

              {/* Language Section */}
              <section className="settings-section">
                <div className="settings-section-header">
                  <Languages size={18} />
                  <h2 className="settings-section-title">
                    {t('settings.language')}
                  </h2>
                </div>
                <div className="settings-field">
                  <div className="settings-field-info">
                    <label className="settings-label">
                      {t('settings.language_select')}
                    </label>
                    <span className="settings-description">
                      {t('settings.language_desc')}
                    </span>
                  </div>
                  <Select
                    onChange={val => setLanguage(val as any)}
                    options={[
                      { label: 'English', value: 'en' },
                      { label: 'Українська', value: 'ua' },
                    ]}
                    value={language}
                  />
                </div>
              </section>

              {/* Theme Section */}
              <section className="settings-section">
                <div className="settings-section-header">
                  <Palette size={18} />
                  <h2 className="settings-section-title">{t('settings.theme')}</h2>
                </div>
                <div className="settings-field">
                  <div className="settings-field-info">
                    <label className="settings-label">
                      {t('settings.theme_select')}
                    </label>
                    <span className="settings-description">
                      {t('settings.theme_desc')}
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
                  <h2 className="settings-section-title">
                    {t('settings.data_management')}
                  </h2>
                </div>
                <div className="settings-field">
                  <div className="settings-field-info">
                    <label className="settings-label">
                      {t('settings.storage_location')}
                    </label>
                    <span className="settings-description">
                      {t('settings.storage_location_desc')}
                    </span>
                  </div>
                  <div className="settings-storage-controls">
                    <div className="settings-path-display">
                      {dataStoragePath || t('settings.default_storage')}
                    </div>
                    <div className="settings-action-buttons">
                      <Button onClick={handleSelectDir} size="sm">
                        {t('settings.change')}
                      </Button>
                      {dataStoragePath && (
                        <Button onClick={handleResetDir} size="sm" variant="ghost">
                          {t('settings.reset')}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          {activeTab === 'shortcuts' && (
            <section className="settings-section">
              <div className="settings-section-header">
                <Keyboard size={18} />
                <h2 className="settings-section-title">{t('settings.shortcuts')}</h2>
              </div>
              <div className="shortcut-list">
                {Object.keys(shortcuts).map(action => (
                  <div className="shortcut-item" key={action}>
                    <div className="shortcut-info">
                      <span className="shortcut-label">
                        {t(`settings.shortcut_actions.${action}`)}
                      </span>
                    </div>
                    <div className="shortcut-recorder-container">
                      <ShortcutRecorder
                        action={action}
                        currentShortcut={shortcuts[action]}
                        onSave={val => setShortcut(action, val)}
                      />
                      <Button
                        onClick={() => setShortcut(action, defaultShortcuts[action])}
                        size="xs"
                        variant="ghost"
                      >
                        <RotateCcw size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  )
}
