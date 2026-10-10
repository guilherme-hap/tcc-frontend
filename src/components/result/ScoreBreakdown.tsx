import { useState } from 'react'
import { formatNumber } from '../../utils/format'
import type { ScorePart } from '../../utils/scoreParts'
import { ScoreMeter } from './ScoreMeter'
import { SegmentedScoreRing } from './SegmentedScoreRing'

interface ScoreBreakdownProps {
  title: string
  description: string
  label: string
  score: number
  parts: ScorePart[]
}

export function ScoreBreakdown({ title, description, label, score, parts }: ScoreBreakdownProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  return (
    <div className="flex flex-col items-center gap-5 lg:flex-row lg:gap-8">
      <SegmentedScoreRing
        label={label}
        score={score}
        parts={parts}
        activeId={activeId}
        onActiveChange={setActiveId}
        size={160}
        showLabels
      />
      <div className="flex min-w-0 flex-1 flex-col gap-3 max-lg:w-full">
        <div className="flex flex-col gap-1">
          <h3 className="font-medium text-ink">{title}</h3>
          <p className="max-w-[72ch] text-ink-secondary">{description}</p>
        </div>
        <ul className="grid grid-cols-1 items-start gap-x-8 gap-y-1 lg:grid-cols-2">
          {parts.map((part) => (
            <li
              key={part.id}
              onMouseEnter={() => setActiveId(part.id)}
              onMouseLeave={() => setActiveId(null)}
              className={`-mx-3 grid grid-cols-[1fr_auto] items-baseline gap-x-3 gap-y-1.5 rounded-md border px-3 py-2.5 transition-colors duration-150 ${activeId === part.id ? 'border-border-hover bg-glass-raised' : 'border-transparent'}`}
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
      </div>
    </div>
  )
}
