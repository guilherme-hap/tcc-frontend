import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { Icon } from './Icon'
import { GLASS } from './classes'

interface DisclosureProps {
  title: string
  aside?: ReactNode
  open?: boolean
  onToggle?: (open: boolean) => void
  children: ReactNode
}

export function Disclosure({ title, aside, open, onToggle, children }: DisclosureProps) {
  return (
    <details
      open={open}
      onToggle={onToggle ? (event) => onToggle(event.currentTarget.open) : undefined}
      className={`group min-w-0 border-border ${GLASS}`}
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-card px-5 py-4 font-display text-base font-semibold tracking-[-0.01em] text-ink focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus [&::-webkit-details-marker]:hidden">
        <Icon
          icon={ChevronRight}
          className="text-ink-secondary transition-transform duration-150 group-open:rotate-90"
        />
        <span className="min-w-0 flex-1">{title}</span>
        {aside ? (
          <span className="text-right font-body text-[13px] font-normal tracking-normal text-ink-secondary">
            {aside}
          </span>
        ) : null}
      </summary>
      <div className="border-t border-border p-5">{children}</div>
    </details>
  )
}
