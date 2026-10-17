import { formatNumber } from '../../utils/format'

interface ScoreValueProps {
  score: number | null
}

export function ScoreValue({ score }: ScoreValueProps) {
  if (score === null) return <span className="text-sm text-ink-muted">Sem nota</span>

  return <span className="num text-lg leading-6 text-ink">{formatNumber(score)}</span>
}
