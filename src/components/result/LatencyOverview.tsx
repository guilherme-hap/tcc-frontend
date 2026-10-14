import type { IPerformanceTargetResult } from '../../types'
import { FRUSTRATED_MULTIPLIER } from '../../utils/apdex'
import { formatMilliseconds } from '../../utils/format'
import { PILLAR_BG } from '../../utils/tones'
import { Badge } from '../ui/Badge'
import { CARD, OVERLINE } from '../ui/classes'

const TARGET_MARK = 'w-px bg-ink'
const FRUSTRATED_MARK = 'border-l border-dashed border-ink-secondary'

function formatPercentile(value: number | null): string {
  return value === null ? 'amostra insuficiente' : formatMilliseconds(value)
}

function share(value: number, max: number): string {
  return `${max > 0 ? Math.min(100, (value / max) * 100) : 0}%`
}

interface LatencyOverviewProps {
  results: IPerformanceTargetResult[]
  targetLatency: number | undefined
  className?: string
}

export function LatencyOverview({ results, targetLatency, className = '' }: LatencyOverviewProps) {
  const measured = results.flatMap((target) =>
    target.result?.latency
      ? [{ method: target.method, path: target.path, latency: target.result.latency }]
      : [],
  )

  if (measured.length === 0) return null

  const frustratedLatency =
    targetLatency === undefined ? undefined : targetLatency * FRUSTRATED_MULTIPLIER
  const scale = Math.max(
    frustratedLatency ?? 0,
    ...measured.map(({ latency }) => latency.p95 ?? latency.p50),
  )
  const thresholds =
    targetLatency === undefined
      ? ''
      : ` T = ${formatMilliseconds(targetLatency)}; 4T = ${formatMilliseconds(frustratedLatency ?? 0)}.`

  return (
    <section className={`flex min-w-0 flex-col gap-3 border-border p-4 ${CARD} ${className}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className={OVERLINE}>Latência por endpoint</h3>
        <Badge>Fora da nota</Badge>
      </div>
      <ul className="flex flex-col gap-3.5">
        {measured.map((target, index) => (
          <li key={index} className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <span className="flex min-w-0 items-center gap-2">
                <Badge mono>{target.method}</Badge>
                <span title={target.path} className="truncate font-mono text-xs text-ink">
                  {target.path}
                </span>
              </span>
              <span className="font-mono text-xs whitespace-nowrap text-ink tabular-nums">
                p50 {formatMilliseconds(target.latency.p50)}
                <span className="text-ink-secondary">
                  {' · p95 '}
                  {formatPercentile(target.latency.p95)}
                </span>
              </span>
            </div>
            <div
              role="img"
              aria-label={`Latência de ${target.method} ${target.path}: p50 ${formatMilliseconds(target.latency.p50)}; p95 ${formatPercentile(target.latency.p95)}.${thresholds}`}
              className="relative h-2.5 rounded-xs bg-idle"
            >
              {target.latency.p95 === null ? null : (
                <span
                  className={`absolute inset-y-0 left-0 rounded-xs opacity-35 ${PILLAR_BG.performance}`}
                  style={{ width: share(target.latency.p95, scale) }}
                />
              )}
              <span
                className={`relative block h-full min-w-1 rounded-xs ${PILLAR_BG.performance}`}
                style={{ width: share(target.latency.p50, scale) }}
              />
              {targetLatency === undefined || frustratedLatency === undefined ? null : (
                <>
                  <span
                    className={`absolute -inset-y-1 ${TARGET_MARK}`}
                    style={{ left: share(targetLatency, scale) }}
                  />
                  <span
                    className={`absolute -inset-y-1 ${FRUSTRATED_MARK}`}
                    style={{ left: share(frustratedLatency, scale) }}
                  />
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
      <ul className="flex flex-wrap gap-x-5 gap-y-1 border-t border-border pt-3 text-xs text-ink-secondary">
        <li className="inline-flex items-center gap-2">
          <span aria-hidden="true" className={`h-2.5 w-3 rounded-xs ${PILLAR_BG.performance}`} />
          p50 (mediana)
        </li>
        <li className="inline-flex items-center gap-2">
          <span
            aria-hidden="true"
            className={`h-2.5 w-3 rounded-xs opacity-35 ${PILLAR_BG.performance}`}
          />
          até o p95
        </li>
        {targetLatency === undefined || frustratedLatency === undefined ? null : (
          <>
            <li className="inline-flex items-center gap-2">
              <span aria-hidden="true" className={`h-3 ${TARGET_MARK}`} />
              <span>
                <span className="font-mono">T = {formatMilliseconds(targetLatency)}</span>, limite das
                satisfeitas
              </span>
            </li>
            <li className="inline-flex items-center gap-2">
              <span aria-hidden="true" className={`h-3 ${FRUSTRATED_MARK}`} />
              <span>
                <span className="font-mono">4T = {formatMilliseconds(frustratedLatency)}</span>,
                limite das toleradas
              </span>
            </li>
          </>
        )}
      </ul>
    </section>
  )
}
