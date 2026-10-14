import type { ButtonHTMLAttributes } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Icon } from './Icon'
import { FOCUS_RING } from './classes'

type IconButtonVariant = 'ghost' | 'outline'

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  icon: LucideIcon
  label: string
  variant?: IconButtonVariant
}

const VARIANT_CLASSES: Record<IconButtonVariant, string> = {
  ghost:
    'text-ink-secondary hover:bg-surface-raised hover:text-ink disabled:hover:bg-transparent disabled:hover:text-ink-secondary',
  outline: 'border border-border bg-surface-raised text-ink hover:border-border-hover',
}

export function IconButton({
  icon,
  label,
  variant = 'ghost',
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={`inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${VARIANT_CLASSES[variant]} ${FOCUS_RING}`}
      {...props}
    >
      <Icon icon={icon} />
    </button>
  )
}
