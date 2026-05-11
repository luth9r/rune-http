import React, { useCallback, useEffect, useState } from 'react'
import { Type, Palette, Languages, Keyboard, RotateCcw } from 'lucide-react'
import { useSettingsStore } from '@/features/settings/settings.store'
import { useTranslation } from '@/i18n'
import { Button } from '../components/ui/button'
import { Select } from '../components/ui/select'
import { NumberInput } from '../components/ui/NumberInput'
import { formatShortcut } from '../utils/shortcuts'

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

      let key = e.key.toUpperCase()
      if (e.code.startsWith('Key')) {
        key = e.code.replace('Key', '')
      } else if (e.code.startsWith('Digit')) {
        key = e.code.replace('Digit', '')
      } else if (e.code === 'Backslash') {
        key = '\\'
      }

      const isModifier = ['CONTROL', 'SHIFT', 'ALT', 'META'].includes(key)
      if (!isModifier && !keys.includes(key)) {
        keys.push(key)
      }

      setRecordedKeys(keys)

      if (!isModifier && keys.length > 0) {
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
    <div style={s.shortcutRecorderContainer}>
      <div
        onClick={() => {
          setIsRecording(true)
          setRecordedKeys([])
        }}
        ref={recorderRef}
        style={{
          ...s.shortcutRecorderBox,
          ...(isRecording ? s.shortcutRecorderBoxRecording : {}),
        }}
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
    language,
    shortcuts,
    setTheme,
    setFontSize,
    setFontFamily,
    setMonoFontFamily,
    setShowScaleIndicator,
    setZoomLevel,
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
    <div style={s.settingsRoot}>
      <aside style={s.settingsSidebar}>
        <div style={s.settingsNavHeader}>
          <h2 style={s.settingsNavTitle}>{t('settings.title')}</h2>
        </div>
        <nav style={s.settingsNavList}>
          <div
            onClick={() => setActiveTab('general')}
            style={{
              ...s.settingsNavItem,
              ...(activeTab === 'general' ? s.settingsNavItemActive : {}),
            }}
          >
            <Palette size={16} />
            {t('settings.general')}
          </div>
          <div
            onClick={() => setActiveTab('shortcuts')}
            style={{
              ...s.settingsNavItem,
              ...(activeTab === 'shortcuts' ? s.settingsNavItemActive : {}),
            }}
          >
            <Keyboard size={16} />
            {t('settings.shortcuts_tab')}
          </div>
        </nav>
      </aside>

      <main style={s.settingsMain}>
        <header style={s.settingsHeader}>
          <h1 style={s.settingsSectionTitle}>
            {activeTab === 'general'
              ? t('settings.general')
              : t('settings.shortcuts_tab')}
          </h1>
        </header>

        <div style={s.settingsContent}>
          {activeTab === 'general' && (
            <>
              {/* Appearance Section */}
              <section style={s.settingsSection}>
                <div style={s.settingsSectionHeader}>
                  <Type size={18} />
                  <h2 style={s.settingsSectionTitle}>
                    {t('settings.appearance')}
                  </h2>
                </div>

                <div style={s.settingsField}>
                  <div style={s.settingsFieldInfo}>
                    <label style={s.settingsLabel}>{t('settings.font_size')}</label>
                    <span style={s.settingsDescription}>
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

                <div style={s.settingsField}>
                  <div style={s.settingsFieldInfo}>
                    <label style={s.settingsLabel}>{t('settings.zoom')}</label>
                    <span style={s.settingsDescription}>
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

                <div style={s.settingsField}>
                  <div style={s.settingsFieldInfo}>
                    <label style={s.settingsLabel}>{t('settings.ui_font')}</label>
                    <span style={s.settingsDescription}>
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

                <div style={s.settingsField}>
                  <div style={s.settingsFieldInfo}>
                    <label style={s.settingsLabel}>{t('settings.mono_font')}</label>
                    <span style={s.settingsDescription}>
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

                <div style={s.settingsField}>
                  <div style={s.settingsFieldInfo}>
                    <label style={s.settingsLabel}>{t('settings.feedback')}</label>
                    <span style={s.settingsDescription}>
                      {t('settings.feedback_desc')}
                    </span>
                  </div>
                  <input
                    checked={showScaleIndicator}
                    onChange={e => setShowScaleIndicator(e.target.checked)}
                    style={s.settingsCheckbox}
                    type="checkbox"
                  />
                </div>
              </section>

              {/* Language Section */}
              <section style={s.settingsSection}>
                <div style={s.settingsSectionHeader}>
                  <Languages size={18} />
                  <h2 style={s.settingsSectionTitle}>
                    {t('settings.language')}
                  </h2>
                </div>
                <div style={s.settingsField}>
                  <div style={s.settingsFieldInfo}>
                    <label style={s.settingsLabel}>
                      {t('settings.language_select')}
                    </label>
                    <span style={s.settingsDescription}>
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
              <section style={s.settingsSection}>
                <div style={s.settingsSectionHeader}>
                  <Palette size={18} />
                  <h2 style={s.settingsSectionTitle}>{t('settings.theme')}</h2>
                </div>
                <div style={s.settingsField}>
                  <div style={s.settingsFieldInfo}>
                    <label style={s.settingsLabel}>
                      {t('settings.theme_select')}
                    </label>
                    <span style={s.settingsDescription}>
                      {t('settings.theme_desc')}
                    </span>
                  </div>
                  <Select
                    onChange={val => setTheme(val as any)}
                    options={[
                      { label: t('settings.theme_auto'), value: 'system' },
                      { label: 'EndeavourOS (Dark)', value: 'dark' },
                      { label: 'Arch Linux', value: 'arch' },
                      { label: t('settings.theme_light'), value: 'light' },
                    ]}
                    value={theme}
                  />
                </div>
              </section>
            </>
          )}

          {activeTab === 'shortcuts' && (
            <section style={s.settingsSection}>
              <div style={s.settingsSectionHeader}>
                <Keyboard size={18} />
                <h2 style={s.settingsSectionTitle}>{t('settings.shortcuts')}</h2>
              </div>
              <div style={s.shortcutList}>
                {Object.keys(shortcuts).map(action => (
                  <div style={s.shortcutItem} key={action}>
                    <div style={s.shortcutInfo}>
                      <span style={s.shortcutLabel}>
                        {t(`settings.shortcut_actions.${action}`)}
                      </span>
                    </div>
                    <div style={s.shortcutRecorderContainer}>
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

const s: Record<string, React.CSSProperties> = {
  settingsRoot: {
    display: 'flex',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    color: 'var(--eos-text)',
    background: 'var(--eos-bg)',
  },
  settingsSidebar: {
    display: 'flex',
    flexDirection: 'column',
    width: '200px',
    maxWidth: '240px',
    borderRight: '1px solid var(--eos-border)',
    background: 'var(--eos-surface)',
  },
  settingsNavHeader: {
    padding: '24px 20px',
  },
  settingsNavTitle: {
    margin: 0,
    fontSize: 'calc(var(--font-size-base) + 3px)',
    fontWeight: 600,
  },
  settingsNavList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '0 12px',
  },
  settingsNavItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 12px',
    fontSize: 'calc(var(--font-size-base) - 1px)',
    fontWeight: 500,
    color: 'var(--eos-muted)',
    cursor: 'pointer',
    borderRadius: '6px',
    transition: 'all 0.2s ease',
  },
  settingsNavItemActive: {
    color: 'var(--eos-accent)',
    background: 'var(--eos-accent-dim)',
  },
  settingsMain: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  },
  settingsHeader: {
    padding: '24px 32px',
    borderBottom: '1px solid var(--eos-border)',
  },
  settingsContent: {
    flex: 1,
    width: '100%',
    maxWidth: '800px',
    padding: '32px',
    margin: 0,
    overflowY: 'auto',
  },
  settingsSection: {
    marginBottom: '48px',
  },
  settingsSectionHeader: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    marginBottom: '24px',
    color: 'var(--eos-accent)',
  },
  settingsSectionTitle: {
    margin: 0,
    fontSize: 'calc(var(--font-size-base) + 5px)',
    fontWeight: 600,
  },
  settingsField: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 0',
    borderBottom: '1px solid var(--eos-border-2)',
  },
  settingsFieldInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  settingsLabel: {
    fontSize: 'calc(var(--font-size-base) + 1px)',
    fontWeight: 500,
  },
  settingsDescription: {
    fontSize: 'calc(var(--font-size-base) - 2px)',
    color: 'var(--eos-muted)',
  },
  settingsCheckbox: {
    width: '18px',
    height: '18px',
    accentColor: 'var(--eos-accent)',
    cursor: 'pointer',
  },
  shortcutList: {
    display: 'flex',
    flexDirection: 'column',
  },
  shortcutItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid var(--eos-border-2)',
  },
  shortcutInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
  },
  shortcutLabel: {
    fontWeight: 500,
    fontSize: 'calc(var(--font-size-base) + 0px)',
    color: 'var(--eos-text)',
  },
  shortcutRecorderContainer: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  shortcutRecorderBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '120px',
    height: '28px',
    padding: '0 12px',
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--eos-muted)',
    background: 'var(--eos-surface-2)',
    border: '1px solid var(--eos-border)',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  shortcutRecorderBoxRecording: {
    color: 'var(--white)',
    background: 'var(--eos-accent)',
    borderColor: 'var(--eos-accent)',
    boxShadow: '0 0 0 2px var(--eos-accent-20)',
  },
}
