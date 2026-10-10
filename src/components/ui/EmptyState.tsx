import { useId, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Icon } from './Icon'
import { GLASS, ICON_TILE } from './classes'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  const titleId = useId()

  return (
    <section
      aria-labelledby={titleId}
      className={`flex flex-col items-center gap-4 border-border px-6 py-16 text-center ${GLASS}`}
    >
      <span aria-hidden="true" className={ICON_TILE}>
        <Icon icon={icon} size={18} />
      </span>
      <div className="flex flex-col gap-1.5">
        <h2
          id={titleId}
          className="font-display text-base font-semibold tracking-[-0.01em] text-ink"
        >
          {title}
        </h2>
        <p className="max-w-[52ch] text-ink-secondary">{description}</p>
      </div>
      {action}
    </section>
  )
}
