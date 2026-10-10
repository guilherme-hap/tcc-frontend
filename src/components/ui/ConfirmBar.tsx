import { useEffect, useRef } from 'react'
import { Trash2, TriangleAlert } from 'lucide-react'
import { Button } from './Button'
import { Icon } from './Icon'

interface ConfirmBarProps {
  title: string
  description: string
  confirmLabel: string
  pending?: boolean
  error?: string | null
  className?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmBar({
  title,
  description,
  confirmLabel,
  pending = false,
  error = null,
  className = '',
  onConfirm,
  onCancel,
}: ConfirmBarProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    cancelRef.current?.focus()
  }, [])

  return (
    <div
      role="alertdialog"
      aria-label={title}
      onKeyDown={(event) => {
        if (event.key !== 'Escape') return
        event.stopPropagation()
        onCancel()
      }}
      className={`flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-error/40 bg-error-dim px-5 py-3 ${className}`}
    >
      <div className="flex min-w-0 flex-[1_1_20rem] items-start gap-3">
        <span className="flex h-5 items-center text-error">
          <Icon icon={TriangleAlert} />
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <p className="font-medium wrap-anywhere text-error">{title}</p>
          <p className="text-ink">{description}</p>
          {error ? (
            <p role="alert" className="text-error">
              {error}
            </p>
          ) : null}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button ref={cancelRef} disabled={pending} onClick={onCancel}>
          Cancelar
        </Button>
        <Button variant="danger" icon={Trash2} loading={pending} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </div>
  )
}
