import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Link, type To } from 'react-router-dom'
import { Icon } from './Icon'
import {
  BUTTON_BASE,
  BUTTON_SIZES,
  BUTTON_VARIANTS,
  type ButtonSize,
  type ButtonVariant,
} from './classes'

interface LinkButtonProps {
  to: To
  state?: unknown
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: LucideIcon
  label?: string
  className?: string
  children: ReactNode
}

export function LinkButton({
  to,
  state,
  variant = 'secondary',
  size = 'md',
  icon,
  label,
  className = '',
  children,
}: LinkButtonProps) {
  return (
    <Link
      to={to}
      state={state}
      aria-label={label}
      className={`${BUTTON_BASE} ${BUTTON_SIZES[size]} ${BUTTON_VARIANTS[variant]} ${className}`}
    >
      {icon ? <Icon icon={icon} /> : null}
      {children}
    </Link>
  )
}
