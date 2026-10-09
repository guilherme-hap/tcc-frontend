import { useId, type ReactNode } from 'react'
import { GLASS } from './classes'

interface PanelProps {
  title: string
  description?: ReactNode
  aside?: ReactNode
  children: ReactNode
}

export function Panel({ title, description, aside, children }: PanelProps) {
  const titleId = useId()

  return (
    <section aria-labelledby={titleId} className={`flex min-w-0 flex-col border-border ${GLASS}`}>
      <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2 border-b border-border px-5 py-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h2
            id={titleId}
            className="font-display text-base font-semibold tracking-[-0.01em] text-ink"
          >
            {title}
          </h2>
          {description ? <p className="max-w-[72ch] text-ink-secondary">{description}</p> : null}
        </div>
        {aside ? <div className="flex flex-wrap items-center gap-2">{aside}</div> : null}
      </header>
      <div className="flex-1 p-5">{children}</div>
    </section>
  )
}
