import { Modal } from 'renderer/components/ui/modal'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/i18n'

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
  const { t } = useTranslation()
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('modal.close_unsaved_title')}>
      <p className="modal-text">
        {t('modal.close_unsaved_desc').replace('{{name}}', tabName || t('common.new_request'))}
      </p>
      <div className="modal-footer">
        <Button onClick={onDiscard} variant="ghost-danger">
          {t('modal.close_unsaved_discard')}
        </Button>
        <Button onClick={onSave} variant="primary">
          {t('modal.close_unsaved_save')}
        </Button>
      </div>
    </Modal>
  )
}
