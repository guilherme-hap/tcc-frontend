import { useState } from 'react'
import type { ScorePart } from '../../utils/scoreParts'
import { ScoreContributions } from './ScoreContributions'
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
    <div className="@container">
      <div className="flex flex-col items-center gap-5 @3xl:flex-row @3xl:gap-8">
        <SegmentedScoreRing
          label={label}
          score={score}
          parts={parts}
          activeId={activeId}
          onActiveChange={setActiveId}
          size={160}
          showLabels
        />
        <div className="flex w-full min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h3 className="font-medium text-ink">{title}</h3>
            <p className="max-w-[72ch] text-ink-secondary">{description}</p>
          </div>
          <ScoreContributions
            parts={parts}
            activeId={activeId}
            onActiveChange={setActiveId}
            className="@4xl:grid-cols-2"
          />
        </div>
      </div>
    </div>
  )
}
