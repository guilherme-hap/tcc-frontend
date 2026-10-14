import type { ILatencySummary } from '../../types'
import { formatMilliseconds, formatNumber } from '../../utils/format'

interface Percentile {
  key: 'p50' | 'p95' | 'p99' | 'max'
  label: string
  minSample?: number
}

const PERCENTILES: Percentile[] = [
  { key: 'p50', label: 'p50' },
  { key: 'p95', label: 'p95', minSample: 20 },
  { key: 'p99', label: 'p99', minSample: 100 },
  { key: 'max', label: 'Máx.' },
]

const P99_9_MIN_SAMPLE = 1000

interface LatencyPercentilesProps {
  latency: ILatencySummary
}

export function LatencyPercentiles({ latency }: LatencyPercentilesProps) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {PERCENTILES.map(({ key, label, minSample }) => {
          const value = latency[key]

          return (
            <div
              key={key}
              className="flex min-w-0 flex-col gap-1 rounded-md border border-border bg-surface-raised px-3 py-2.5"
            >
              <dt className="font-mono text-xs text-ink-secondary">{label}</dt>
              {value === null ? (
                <dd className="flex flex-col">
                  <span className="text-[13px] font-medium text-ink-secondary">
                    Amostra insuficiente
                  </span>
                  <span className="text-xs text-ink-muted">
                    menos de {formatNumber(minSample ?? 0)} respostas medidas
                  </span>
                </dd>
              ) : (
                <dd className="num text-2xl leading-7 text-ink">{formatMilliseconds(value)}</dd>
              )}
            </div>
          )
        })}
      </dl>
      <p className="font-mono text-xs text-ink-secondary">
        mín. {formatMilliseconds(latency.min)} · média {formatMilliseconds(latency.mean)} · p99,9{' '}
        {latency.p99_9 === null
          ? `amostra insuficiente (menos de ${formatNumber(P99_9_MIN_SAMPLE)})`
          : formatMilliseconds(latency.p99_9)}
      </p>
    </div>
  )
}
