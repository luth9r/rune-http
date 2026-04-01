import type React from 'react'
import { useState, useCallback } from 'react'
import { useEnvStore } from '@/features/environments/environments.store'
import { EnvSidebar } from '@/components/Environments/EnvSidebar'
import { EnvEditor } from '@/components/Environments/EnvEditor'
import { ConfirmDeleteModal } from '@/components/shared/modals/ConfirmDeleteModal'
import type { Environment } from '@/types'

export function EnvironmentsScreen() {
  const { removeEnvironment } = useEnvStore()
  const [envToDelete, setEnvToDelete] = useState<Environment | null>(null)

  const handleDeleteConfirm = useCallback(() => {
    if (envToDelete) {
      removeEnvironment(envToDelete.id)
      setEnvToDelete(null)
    }
  }, [envToDelete, removeEnvironment])

  return (
    <div style={s.root}>
      <EnvSidebar onDelete={setEnvToDelete} />
      <EnvEditor />

      <ConfirmDeleteModal
        isOpen={!!envToDelete}
        itemName={envToDelete?.name || ''}
        onClose={() => setEnvToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Environment"
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
