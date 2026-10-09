import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Icon } from './Icon'

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'error' | 'data'

interface BadgeProps {
  tone?: BadgeTone
  mono?: boolean
  icon?: LucideIcon
  spin?: boolean
  children: ReactNode
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: 'border-border bg-glass text-ink-secondary',
  accent: 'border-accent-ink/30 bg-accent-dim text-accent-ink',
  success: 'border-success/30 bg-success-dim text-success',
  warning: 'border-warning/30 bg-warning-dim text-warning',
  error: 'border-error/30 bg-error-dim text-error',
  data: 'border-data-cyan/30 bg-data-dim text-data-cyan',
}

export function Badge({ tone = 'neutral', mono = false, icon, spin = false, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex h-5.5 items-center gap-1.5 rounded-sm border px-2 text-xs font-medium whitespace-nowrap ${mono ? 'font-mono' : ''} ${TONE_CLASSES[tone]}`}
    >
      {icon ? (
        <Icon
          icon={icon}
          size={12}
          className={spin ? 'animate-spin motion-reduce:animate-none' : ''}
        />
      ) : null}
      {children}
    </span>
  )
}
