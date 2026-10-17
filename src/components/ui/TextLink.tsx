import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Link, type To } from 'react-router-dom'
import { Icon } from './Icon'
import { TEXT_LINK } from './classes'

type TextLinkTone = 'accent' | 'muted'

interface TextLinkProps {
  to: To
  state?: unknown
  tone?: TextLinkTone
  inline?: boolean
  leadingIcon?: LucideIcon
  trailingIcon?: LucideIcon
  label?: string
  className?: string
  children: ReactNode
}

const TONE_CLASSES: Record<TextLinkTone, string> = {
  accent: 'text-accent-ink',
  muted: 'text-ink-secondary',
}

export function TextLink({
  to,
  state,
  tone = 'accent',
  inline = false,
  leadingIcon,
  trailingIcon,
  label,
  className = '',
  children,
}: TextLinkProps) {
  return (
    <Link
      to={to}
      state={state}
      aria-label={label}
      className={`${TEXT_LINK} ${inline ? '' : 'inline-flex items-center gap-1.5 text-sm max-lg:min-h-11'} ${TONE_CLASSES[tone]} ${className}`}
    >
      {leadingIcon ? <Icon icon={leadingIcon} /> : null}
      {children}
      {trailingIcon ? <Icon icon={trailingIcon} size={14} /> : null}
    </Link>
  )
}
