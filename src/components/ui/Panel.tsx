import { useId, type ReactNode } from 'react'
import { CARD } from './classes'
import { InfoTip } from './InfoTip'

interface PanelProps {
  title: string
  description?: ReactNode
  info?: ReactNode
  aside?: ReactNode
  flush?: boolean
  className?: string
  children: ReactNode
}

export function Panel({
  title,
  description,
  info,
  aside,
  flush = false,
  className = '',
  children,
}: PanelProps) {
  const titleId = useId()

  return (
    <section aria-labelledby={titleId} className={`flex min-w-0 flex-col border-border ${CARD} ${className}`}>
      <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2 border-b border-border px-5 py-4">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <h2
              id={titleId}
              className="font-display text-base font-semibold tracking-[-0.01em] text-ink"
            >
              {title}
            </h2>
            {info ? <InfoTip label={title}>{info}</InfoTip> : null}
          </div>
          {description ? <p className="max-w-[60ch] text-ink-secondary">{description}</p> : null}
        </div>
        {aside ? <div className="flex flex-wrap items-center gap-2">{aside}</div> : null}
      </header>
      <div className={flush ? 'flex flex-1 flex-col' : 'flex-1 p-5'}>{children}</div>
    </section>
  )
}
