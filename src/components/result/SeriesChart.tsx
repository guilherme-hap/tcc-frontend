import { useState } from 'react'
import type { IPerformanceSeriesPoint } from '../../types'
import { formatCount, formatMilliseconds, formatNumber } from '../../utils/format'

const LATENCY_HEIGHT = 100

interface Slot {
  second: number
  point: IPerformanceSeriesPoint | undefined
}

function buildSlots(points: IPerformanceSeriesPoint[], minSlots: number): Slot[] {
  const count = Math.max(minSlots, ...points.map((point) => point.second), 1)
  return Array.from({ length: count }, (_, index) => ({
    second: index + 1,
    point: points.find((point) => point.second === index + 1),
  }))
}

function latencySegments(slots: Slot[], scale: number): string[] {
  const segments: string[][] = [[]]

  slots.forEach(({ point }, index) => {
    if (point?.meanLatency == null) {
      if (segments[segments.length - 1].length > 0) segments.push([])
      return
    }
    const y = LATENCY_HEIGHT - (point.meanLatency / scale) * LATENCY_HEIGHT
    segments[segments.length - 1].push(`${index + 0.5},${y}`)
  })

  return segments
    .filter((segment) => segment.length > 0)
    .map((segment) => (segment.length === 1 ? [segment[0], segment[0]] : segment).join(' '))
}

function describePoint({ second, point }: Slot): string {
  if (!point) return `Segundo ${formatNumber(second)}: sem dados`
  return [
    `Segundo ${formatNumber(second)}: ${formatCount(point.responses, 'resposta', 'respostas')}`,
    point.meanLatency === null
      ? 'sem latência medida'
      : `latência média ${formatMilliseconds(point.meanLatency)}`,
    formatCount(point.errors, 'erro', 'erros'),
  ].join(' · ')
}

function describeSeries(maxResponses: number, latencies: number[], errors: number): string {
  const latency =
    latencies.length > 0
      ? `, latência média de ${formatMilliseconds(Math.min(...latencies))} a ${formatMilliseconds(Math.max(...latencies))}`
      : ''
  return `Série por segundo: até ${formatNumber(maxResponses)} respostas por segundo${latency}, ${formatCount(errors, 'erro', 'erros')}.`
}

interface HitColumnsProps {
  slots: Slot[]
  hovered: number | null
  onHover: (index: number) => void
}

function HitColumns({ slots, hovered, onHover }: HitColumnsProps) {
  return (
    <div className="absolute inset-0 flex gap-px">
      {slots.map((slot, index) => (
        <span
          key={slot.second}
          onMouseEnter={() => onHover(index)}
          className={`flex-1 rounded-xs ${hovered === index ? 'bg-ink/8' : ''}`}
        />
      ))}
    </div>
  )
}

interface SeriesChartProps {
  points: IPerformanceSeriesPoint[]
  minSlots?: number
  targetLatency?: number
}

export function SeriesChart({ points, minSlots = 0, targetLatency }: SeriesChartProps) {
  const [hovered, setHovered] = useState<number | null>(null)
  const slots = buildSlots(points, minSlots)
  const maxResponses = Math.max(1, ...points.map((point) => point.responses))
  const latencies = points.flatMap((point) =>
    point.meanLatency === null ? [] : [point.meanLatency],
  )
  const latencyScale = Math.max(1, ...latencies) * 1.1
  const totalErrors = points.reduce((sum, point) => sum + point.errors, 0)
  const target = targetLatency !== undefined && targetLatency <= latencyScale ? targetLatency : null
  const targetY = target === null ? 0 : LATENCY_HEIGHT - (target / latencyScale) * LATENCY_HEIGHT
  const readout =
    hovered !== null && slots[hovered]
      ? describePoint(slots[hovered])
      : points.length > 0
        ? `${formatCount(points.length, 'segundo medido', 'segundos medidos')}. Passe o cursor sobre o gráfico para ver cada segundo.`
        : 'Aguardando o primeiro segundo do teste.'

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <p aria-hidden="true" className="min-h-5 font-mono text-xs text-ink-secondary">
        {readout}
      </p>
      <div
        role="img"
        aria-label={describeSeries(maxResponses, latencies, totalErrors)}
        onMouseLeave={() => setHovered(null)}
        className="flex min-w-0 flex-col gap-3"
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-3 text-xs text-ink-secondary">
            <span>Respostas por segundo</span>
            <span className="font-mono tabular-nums">máx. {formatNumber(maxResponses)}</span>
          </div>
          <div className="relative flex h-20 items-end gap-px border-b border-border">
            {slots.map(({ second, point }) => (
              <span key={second} className="flex h-full flex-1 items-end">
                {point && point.responses > 0 ? (
                  <span
                    className="w-full rounded-t-xs bg-pillar-performance"
                    style={{ height: `${Math.max(2, (point.responses / maxResponses) * 100)}%` }}
                  />
                ) : null}
              </span>
            ))}
            <HitColumns slots={slots} hovered={hovered} onHover={setHovered} />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-3 text-xs text-ink-secondary">
            <span>Latência média por segundo</span>
            <span className="font-mono tabular-nums">
              {latencies.length > 0 ? `máx. ${formatMilliseconds(Math.max(...latencies))}` : '—'}
            </span>
          </div>
          <div className="relative h-16 border-b border-border">
            <svg
              viewBox={`0 0 ${slots.length} ${LATENCY_HEIGHT}`}
              preserveAspectRatio="none"
              className="absolute inset-0 size-full overflow-visible"
            >
              {target !== null ? (
                <line
                  x1={0}
                  x2={slots.length}
                  y1={targetY}
                  y2={targetY}
                  vectorEffect="non-scaling-stroke"
                  strokeDasharray="4 3"
                  className="stroke-ink-secondary"
                  strokeWidth={1}
                />
              ) : null}
              {latencySegments(slots, latencyScale).map((segment) => (
                <polyline
                  key={segment}
                  points={segment}
                  fill="none"
                  vectorEffect="non-scaling-stroke"
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  className="stroke-pillar-performance"
                />
              ))}
            </svg>
            <HitColumns slots={slots} hovered={hovered} onHover={setHovered} />
          </div>
          {target !== null ? (
            <span className="inline-flex items-center gap-2 text-xs text-ink-secondary">
              <span aria-hidden="true" className="w-4 border-t border-dashed border-ink-secondary" />
              <span className="font-mono">T = {formatMilliseconds(target)}</span>
            </span>
          ) : null}
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-3 text-xs text-ink-secondary">
            <span>Erros por segundo (5xx e falhas de conexão)</span>
            <span className={`font-mono tabular-nums ${totalErrors > 0 ? 'text-error' : ''}`}>
              {formatCount(totalErrors, 'erro', 'erros')}
            </span>
          </div>
          <div className="relative flex h-2.5 gap-px">
            {slots.map(({ second, point }) => (
              <span
                key={second}
                className={`flex-1 rounded-xs ${point && point.errors > 0 ? 'bg-error' : 'bg-idle'}`}
              />
            ))}
            <HitColumns slots={slots} hovered={hovered} onHover={setHovered} />
          </div>
        </div>

        <div className="flex justify-between font-mono text-xs text-ink-muted tabular-nums">
          <span>1 s</span>
          <span>{formatNumber(slots.length)} s</span>
        </div>
      </div>

      {points.length > 0 ? (
        <details className="group text-sm">
          <summary className="cursor-pointer text-ink-secondary hover:text-ink max-lg:flex max-lg:min-h-11 max-lg:items-center">
            Ver os dados por segundo
          </summary>
          <div className="relative mt-2 max-h-60 overflow-auto rounded-md border border-border">
            <table className="w-full border-collapse font-mono text-xs tabular-nums">
              <thead className="sticky top-0 bg-surface-raised text-ink-secondary">
                <tr>
                  <th scope="col" className="px-3 py-1.5 text-left font-semibold">Segundo</th>
                  <th scope="col" className="px-3 py-1.5 text-right font-semibold">Respostas</th>
                  <th scope="col" className="px-3 py-1.5 text-right font-semibold">Latência média</th>
                  <th scope="col" className="px-3 py-1.5 text-right font-semibold">Erros</th>
                </tr>
              </thead>
              <tbody>
                {points.map((point) => (
                  <tr key={point.second} className="border-t border-border text-ink">
                    <td className="px-3 py-1.5">{formatNumber(point.second)}</td>
                    <td className="px-3 py-1.5 text-right">{formatNumber(point.responses)}</td>
                    <td className="px-3 py-1.5 text-right">
                      {point.meanLatency === null ? '—' : formatMilliseconds(point.meanLatency)}
                    </td>
                    <td className={`px-3 py-1.5 text-right ${point.errors > 0 ? 'text-error' : ''}`}>
                      {formatNumber(point.errors)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      ) : null}
    </div>
  )
}
