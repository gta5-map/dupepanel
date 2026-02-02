import { type ReactNode, useEffect, useCallback } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleEscape])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div
        className="
          relative z-10 w-full max-w-lg
          bg-surface rounded-t-2xl md:rounded-2xl
          shadow-xl
          max-h-[90vh] overflow-y-auto
          animate-in slide-in-from-bottom md:slide-in-from-bottom-0 md:fade-in duration-200
        "
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Handle bar for mobile */}
        <div className="flex justify-center pt-3 md:hidden">
          <div className="w-12 h-1.5 bg-text-secondary/30 rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-text-secondary/10">
            <h2
              id="modal-title"
              className="text-lg font-semibold text-text-primary"
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-text-secondary/10 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
