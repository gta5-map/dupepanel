import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'primary'
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-text-secondary mb-6">{message}</p>
      <div className="flex gap-3">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={onClose}
        >
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant={variant}
          className="flex-1"
          onClick={handleConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
