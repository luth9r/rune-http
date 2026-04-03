import { Modal } from 'renderer/components/ui/modal'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/i18n'
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
  const { t } = useTranslation()
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="modal-text">
        {t('common.delete_confirm')} <strong>{itemName}</strong>? {t('common.delete_warning')}
      </p>
      <div className="modal-footer">
        <Button onClick={onClose} variant="ghost">
          {t('common.cancel')}
        </Button>
        <Button onClick={onConfirm} variant="danger">
          {t('sidebar.delete') || 'Delete'}
        </Button>
      </div>
    </Modal>
  )
}
