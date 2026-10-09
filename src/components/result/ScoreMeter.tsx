import { formatNumber } from '../../utils/format'

interface ScoreMeterProps {
  label: string
  score: number
}

export function ScoreMeter({ label, score }: ScoreMeterProps) {
  const clamped = Math.min(100, Math.max(0, score))

  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      aria-valuetext={`${formatNumber(clamped)} de 100`}
      className="h-1.5 w-full overflow-hidden rounded-full bg-glass-raised"
    >
      <div
        className="h-full rounded-full bg-linear-to-r from-accent to-accent-ink"
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
