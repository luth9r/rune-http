import { Modal } from 'renderer/components/ui/modal'
import { Button } from '@/components/ui/button'

interface ConfirmCloseProps {
  isOpen: boolean
  tabName: string
  onClose: () => void
  onDiscard: () => void
  onSave: () => void
}

export function ConfirmCloseModal({
  isOpen,
  tabName,
  onClose,
  onDiscard,
  onSave,
}: ConfirmCloseProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Unsaved Changes">
      <p className="modal-text">
        Request <strong>{tabName || 'New Request'}</strong> has unsaved changes.
        Do you want to save them?
      </p>
      <div className="modal-footer">
        <Button onClick={onDiscard} variant="ghost-danger">
          Don't Save
        </Button>
        <Button onClick={onSave} variant="primary">
          Save Changes
        </Button>
      </div>
    </Modal>
  )
}
