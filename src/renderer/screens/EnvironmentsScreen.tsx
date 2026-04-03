import { useState, useCallback } from 'react'
import { ChevronRight } from 'lucide-react'
import { useEnvStore } from '@/features/environments/environments.store'
import { useSettingsStore } from '@/features/settings/settings.store'
import { EnvSidebar } from '@/components/Environments/EnvSidebar'
import { EnvEditor } from '@/components/Environments/EnvEditor'
import { ConfirmDeleteModal } from '@/components/shared/modals/ConfirmDeleteModal'
import { useTranslation } from '@/i18n'
import type { Environment } from '@/types'

export function EnvironmentsScreen() {
  const { t } = useTranslation()
  const { removeEnvironment } = useEnvStore()
  const { sidebarVisible, setSidebarVisible } = useSettingsStore()
  const [envToDelete, setEnvToDelete] = useState<Environment | null>(null)

  const handleDeleteConfirm = useCallback(() => {
    if (envToDelete) {
      removeEnvironment(envToDelete.id)
      setEnvToDelete(null)
    }
  }, [envToDelete, removeEnvironment])

  return (
    <div style={s.root}>
      {!sidebarVisible && (
        <button
          className="expand-panel-btn expand-panel-btn-left"
          onClick={() => setSidebarVisible(true)}
          title="Show Sidebar"
        >
          <ChevronRight size={20} />
        </button>
      )}

      {sidebarVisible && <EnvSidebar onDelete={setEnvToDelete} />}
      <EnvEditor />

      <ConfirmDeleteModal
        isOpen={!!envToDelete}
        itemName={envToDelete?.name || ''}
        onClose={() => setEnvToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title={`${t('sidebar.delete')} ${t('sidebar.environment_item') || 'Environment'}`}
      />
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    background: 'var(--eos-bg)',
    color: 'var(--eos-text)',
  },
}
