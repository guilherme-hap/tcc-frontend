import { formatNumber } from '../../utils/format'

interface PillarScoreProps {
  score: number | undefined
}

export function PillarScore({ score }: PillarScoreProps) {
  if (score === undefined) return null

  return (
    <p className="inline-flex items-baseline gap-2 text-[13px] text-ink-secondary">
      Nota
      <span className="font-mono text-xl leading-6 font-semibold text-ink tabular-nums">
        {formatNumber(score)}
      </span>
    </p>
  )
}
