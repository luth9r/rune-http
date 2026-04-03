import { useState, useEffect, useCallback, useMemo } from 'react'
import { Info, Save, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CodeEditor } from 'renderer/components/shared/CodeEditor'
import { useEnvStore } from '@/features/environments/environments.store'
import { useTranslation } from '@/i18n'
import './env-editor.css'

export function EnvEditor() {
  const { t } = useTranslation()
  const { environments, activeEnvId, saveEnvironment, updateDraft } =
    useEnvStore()

  const activeEnv = useMemo(
    () => environments.find(e => e.id === activeEnvId) || null,
    [environments, activeEnvId]
  )

  const [localValue, setLocalValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  // Load draft or initial value
  useEffect(() => {
    if (activeEnv) {
      const initialValue =
        activeEnv.draftValue ?? JSON.stringify(activeEnv.variables, null, 2)
      setLocalValue(initialValue)

      // Calculate initial dirty state
      const original = JSON.stringify(activeEnv.variables, null, 2)
      setIsDirty(initialValue !== original)

      // Validate initial value
      try {
        JSON.parse(initialValue)
        setError(null)
      } catch {
        setError(t('env.invalid_json'))
      }
    }
  }, [activeEnvId, activeEnv?.id]) // Only reset when ID changes or mount

  const handleEditorChange = useCallback(
    (value: string) => {
      setLocalValue(value)

      if (!activeEnv) return

      const original = JSON.stringify(activeEnv.variables, null, 2)
      const currentlyDirty = value !== original
      setIsDirty(currentlyDirty)

      // Persist draft to store
      updateDraft(activeEnv.id, currentlyDirty ? value : null)

      try {
        JSON.parse(value)
        setError(null)
      } catch {
        setError(t('env.invalid_json'))
      }
    },
    [activeEnv, updateDraft]
  )

  const handleSave = useCallback(() => {
    if (!activeEnv || error) return
    try {
      const parsed = JSON.parse(localValue)
      const formatted = JSON.stringify(parsed, null, 2)
      saveEnvironment(activeEnv.id, parsed)
      setLocalValue(formatted)
      setIsDirty(false)
      setError(null)
    } catch {
      setError(t('env.invalid_json'))
    }
  }, [activeEnv, localValue, error, saveEnvironment, t])

  // Cmd/Ctrl+S
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleSave])

  const canSave = isDirty && !error

  if (!activeEnv) {
    return (
      <div className="env-editor-empty">
        <Globe className="env-editor-empty-icon" size={40} />
        <span className="env-editor-empty-text">
          {t('env.select_hint')}
        </span>
      </div>
    )
  }

  return (
    <main className="env-editor-main">
      <div className="env-editor-header">
        <div className="env-editor-header-left">
          <div className="env-editor-name">{activeEnv.name}</div>
          <div className="env-editor-hint">
            {t('env.json_hint')}
          </div>
        </div>

        <div className="env-editor-header-right">
          {error && (
            <div className="env-editor-error-badge">
              <Info size={13} />
              {error}
            </div>
          )}
          {isDirty && !error && (
            <div className="env-editor-dirty-badge">{t('env.unsaved_changes')}</div>
          )}
          <Button
            className="env-editor-save-btn"
            disabled={!canSave}
            onClick={handleSave}
            size="sm"
            variant="primary"
          >
            <Save size={13} />
            {t('env.save')}
          </Button>
        </div>
      </div>

      <div className="env-editor-editor-wrap">
        <CodeEditor
          bodyType="json"
          onChange={handleEditorChange}
          value={localValue}
        />
      </div>
    </main>
  )
}
