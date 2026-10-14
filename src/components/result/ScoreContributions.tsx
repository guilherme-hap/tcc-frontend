import { formatNumber } from '../../utils/format'
import type { ScorePart } from '../../utils/scoreParts'
import { ScoreMeter } from './ScoreMeter'

interface ScoreContributionsProps {
  parts: ScorePart[]
  activeId: string | null
  onActiveChange: (id: string | null) => void
  className?: string
}

export function ScoreContributions({
  parts,
  activeId,
  onActiveChange,
  className = '',
}: ScoreContributionsProps) {
  return (
    <ul className={`grid grid-cols-1 items-start gap-x-8 gap-y-1 ${className}`}>
      {parts.map((part) => (
        <li
          key={part.id}
          onMouseEnter={() => onActiveChange(part.id)}
          onMouseLeave={() => onActiveChange(null)}
          className={`-mx-3 grid grid-cols-[1fr_auto] items-baseline gap-x-3 gap-y-1.5 rounded-md border px-3 py-2.5 transition-colors duration-150 ${activeId === part.id ? 'border-border-hover bg-surface-raised' : 'border-transparent'}`}
        >
          <span className="min-w-0 font-medium text-ink">{part.label}</span>
          <span className="font-mono text-[13px] text-ink-secondary tabular-nums">
            <span className="font-semibold text-ink">{formatNumber(part.points)}</span> de{' '}
            {formatNumber(part.maxPoints)}
          </span>
          <div className="col-span-2">
            <ScoreMeter label={`Nota de ${part.label.toLowerCase()}`} score={part.score} />
          </div>
          {part.detail ? (
            <span className="col-span-2 text-[13px] text-ink-secondary">{part.detail}</span>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
