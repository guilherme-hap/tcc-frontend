import { formatNumber } from '../../utils/format'

interface PillarScoreProps {
  score: number | undefined
}

export function PillarScore({ score }: PillarScoreProps) {
  if (score === undefined) return null

  return (
    <p className="inline-flex items-baseline gap-2 text-[13px] text-ink-secondary">
      Nota
      <span className="num text-2xl leading-6 text-ink">
        {formatNumber(score)}
      </span>
    </p>
  )
}
