import { useId, type ReactNode } from 'react'
import { CARD, OVERLINE } from './classes'
import { InfoTip } from './InfoTip'

interface BlockProps {
  title: string
  info?: ReactNode
  aside?: ReactNode
  flush?: boolean
  className?: string
  children: ReactNode
}

export function Block({ title, info, aside, flush = false, className = '', children }: BlockProps) {
  const titleId = useId()

  return (
    <section
      aria-labelledby={titleId}
      className={`flex min-w-0 flex-col border-border ${CARD} ${className}`}
    >
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 pt-4 pb-3">
        <div className="flex items-center gap-1.5">
          <h2 id={titleId} className={OVERLINE}>
            {title}
          </h2>
          {info ? <InfoTip label={title}>{info}</InfoTip> : null}
        </div>
        {aside ? <div className="flex flex-wrap items-center gap-x-4 gap-y-1">{aside}</div> : null}
      </header>
      <div className={flush ? 'flex flex-1 flex-col' : 'flex-1 px-4 pb-4'}>{children}</div>
    </section>
  )
}
