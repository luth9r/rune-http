import { Modal } from 'renderer/components/ui/modal'
import { Button } from '@/components/ui/button'
interface ConfirmDeleteProps {
  isOpen: boolean
  title: string
  itemName: string
  onClose: () => void
  onConfirm: () => void
}

export function ConfirmDeleteModal({
  isOpen,
  title,
  itemName,
  onClose,
  onConfirm,
}: ConfirmDeleteProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="modal-text">
        Are you sure you want to delete <strong>{itemName}</strong>? This action
        cannot be undone.
      </p>
      <div className="modal-footer">
        <Button onClick={onClose} variant="ghost">
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="danger">
          Delete
        </Button>
      </div>
    </Modal>
  )
}
