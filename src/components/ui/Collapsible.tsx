import { useState, type ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { Icon } from './Icon'
import { FOCUS_RING } from './classes'

interface CollapsibleProps {
  title: string
  aside?: ReactNode
  className?: string
  children: ReactNode
}

export function Collapsible({ title, aside, className = '', children }: CollapsibleProps) {
  const [open, setOpen] = useState(false)

  return (
    <details
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className={`group min-w-0 ${className}`}
    >
      <summary
        className={`flex w-fit max-w-full cursor-pointer list-none items-center gap-2 rounded-sm text-sm font-medium text-ink-secondary hover:text-ink max-lg:min-h-11 ${FOCUS_RING} [&::-webkit-details-marker]:hidden`}
      >
        <Icon
          icon={ChevronRight}
          size={14}
          className="transition-transform duration-150 group-open:rotate-90"
        />
        <span>{title}</span>
        {aside ? <span className="font-normal">{aside}</span> : null}
      </summary>
      {open ? <div className="pt-3">{children}</div> : null}
    </details>
  )
}
