import type { ReactNode } from 'react'
import { CircleX, TriangleAlert } from 'lucide-react'
import type { IAutocannonRunResult, IPerformanceRun, IScoringParameters } from '../../types'
import { formatMilliseconds, formatNumber } from '../../utils/format'
import { Icon } from '../ui/Icon'
import { ApdexBar, ApdexLegend } from './ApdexZones'
import { LazyRunLatencyChart } from './LazyCharts'

const GRID =
  '@3xl:grid-cols-[4.5rem_minmax(0,1.3fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]'

type Thresholds = NonNullable<NonNullable<IScoringParameters['performance']>['thresholds']>

interface MeterProps {
  value: number
  max: number
  limit?: number
  over?: boolean
}

function Meter({ value, max, limit, over = false }: MeterProps) {
  return (
    <span aria-hidden="true" className="relative block h-2 min-w-0 flex-1 rounded-xs bg-idle">
      <span
        className={`absolute inset-y-0 left-0 rounded-xs ${over ? 'bg-warning' : 'bg-pillar-performance'}`}
        style={{ width: `${Math.max(1, Math.min(100, (value / max) * 100))}%` }}
      />
      {limit !== undefined ? (
        <span
          className="absolute -inset-y-1 w-0.5 -translate-x-1/2 bg-ink"
          style={{ left: `${Math.min(100, (limit / max) * 100)}%` }}
        />
      ) : null}
    </span>
  )
}

interface CellProps {
  label: string
  children: ReactNode
}

function Cell({ label, children }: CellProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-xs text-ink-secondary @3xl:sr-only">{label}</span>
      {children}
    </div>
  )
}

interface ScaleSet {
  p50: number
  cpu: number
  eventLoop: number
}

function buildScales(runs: IPerformanceRun[], thresholds: Thresholds | undefined): ScaleSet {
  const results = runs.flatMap(({ result }) => (result ? [result] : []))
  const p50 = Math.max(1, ...results.map((result) => result.latency?.p50 ?? 0))
  const cpu = Math.max(
    0.05,
    (thresholds?.maxCpuUsage ?? 0) * 1.25,
    ...results.map((result) => result.saturation.cpuUsage * 1.1),
  )
  const eventLoop = Math.max(
    1,
    (thresholds?.maxEventLoopDelayMs ?? 0) * 1.25,
    ...results.map((result) => result.saturation.eventLoopDelayP99Ms * 1.1),
  )
  return { p50: p50 * 1.1, cpu, eventLoop }
}

interface MeasuredRowProps {
  result: IAutocannonRunResult
  mean: number | null
  scales: ScaleSet
  thresholds: Thresholds | undefined
}

function MeasuredCells({ result, mean, scales, thresholds }: MeasuredRowProps) {
  const { saturation } = result
  const cpuOver = thresholds !== undefined && saturation.cpuUsage > thresholds.maxCpuUsage
  const loopOver =
    thresholds !== undefined && saturation.eventLoopDelayP99Ms > thresholds.maxEventLoopDelayMs

  return (
    <>
      <Cell label="Nota (Apdex × 100), marca na média">
        {result.score === null ? (
          <span className="text-sm text-ink-secondary">Não medido</span>
        ) : (
          <div className="flex h-6 items-center gap-3">
            <Meter value={result.score} max={100} limit={mean ?? undefined} />
            <span className="num w-14 shrink-0 text-right text-xl leading-6 text-ink">
              {formatNumber(result.score)}
            </span>
          </div>
        )}
      </Cell>
      <Cell label="Zonas do Apdex">
        {result.sampleSize > 0 ? (
          <div className="flex flex-col gap-0.5">
            <div className="flex h-6 items-center">
              <div className="min-w-0 flex-1">
                <ApdexBar result={result} />
              </div>
            </div>
            <span className="font-mono text-xs text-ink-secondary tabular-nums">
              {result.frustrated > 0
                ? `${formatNumber(result.frustrated)} frustradas`
                : 'Nenhuma frustrada'}
            </span>
          </div>
        ) : (
          <span className="text-sm text-ink-secondary">Sem amostra</span>
        )}
      </Cell>
      <Cell label="p50">
        {result.latency ? (
          <div className="flex h-6 items-center gap-3">
            <Meter value={result.latency.p50} max={scales.p50} />
            <span className="w-[4.5rem] shrink-0 text-right font-mono text-sm whitespace-nowrap text-ink tabular-nums">
              {formatMilliseconds(result.latency.p50)}
            </span>
          </div>
        ) : (
          <span className="text-sm text-ink-secondary">Sem resposta</span>
        )}
      </Cell>
      <Cell label="CPU do gerador (núcleos), marca no limiar">
        <div className="flex h-6 items-center gap-3">
          <Meter value={saturation.cpuUsage} max={scales.cpu} limit={thresholds?.maxCpuUsage} over={cpuOver} />
          <span className="w-[4.5rem] shrink-0 text-right font-mono text-sm whitespace-nowrap text-ink tabular-nums">
            {formatNumber(saturation.cpuUsage, 2)}
          </span>
        </div>
      </Cell>
      <Cell label="Event loop p99, marca no limiar">
        <div className="flex h-6 items-center gap-3">
          <Meter
            value={saturation.eventLoopDelayP99Ms}
            max={scales.eventLoop}
            limit={thresholds?.maxEventLoopDelayMs}
            over={loopOver}
          />
          <span className="w-[4.5rem] shrink-0 text-right font-mono text-sm whitespace-nowrap text-ink tabular-nums">
            {formatNumber(saturation.eventLoopDelayP99Ms, 1)} ms
          </span>
        </div>
      </Cell>
    </>
  )
}

function describeExcess(result: IAutocannonRunResult, thresholds: Thresholds | undefined): string {
  const { cpuUsage, eventLoopDelayP99Ms } = result.saturation
  const over: string[] = []
  if (thresholds && cpuUsage > thresholds.maxCpuUsage) over.push('CPU')
  if (thresholds && eventLoopDelayP99Ms > thresholds.maxEventLoopDelayMs) over.push('event loop')
  return over.length > 0
    ? `${over.join(' e ')} do gerador acima do limiar`
    : 'o gerador passou de um limiar de saturação'
}

interface RunsChartProps {
  runs: IPerformanceRun[]
  mean: number | null
  targetLatency: number
  thresholds: Thresholds | undefined
}

export function RunsChart({ runs, mean, targetLatency, thresholds }: RunsChartProps) {
  const scales = buildScales(runs, thresholds)

  return (
    <section
      aria-label="Execuções do teste de carga"
      className="@container flex min-w-0 flex-col gap-4"
    >
      <ApdexLegend />

      <div className="flex min-w-0 flex-col gap-3">
        <div
          aria-hidden="true"
          className={`hidden gap-x-5 text-xs text-ink-secondary @3xl:grid ${GRID}`}
        >
          <span>Execução</span>
          <span>Nota (marca na média)</span>
          <span>Zonas do Apdex</span>
          <span>p50</span>
          <span>CPU do gerador (marca no limiar)</span>
          <span>Event loop p99 (marca no limiar)</span>
        </div>
        <ol className="flex flex-col">
          {runs.map(({ run, result, error }) => (
            <li
              key={run}
              className={`grid grid-cols-1 gap-x-5 gap-y-3 border-t border-border py-3 first:border-t-0 @xl:grid-cols-2 @3xl:items-start ${GRID}`}
            >
              <span className="font-medium text-ink @3xl:hidden">Execução {formatNumber(run)}</span>
              <span className="num hidden text-xl leading-6 text-ink @3xl:block">
                <span className="sr-only">Execução </span>
                {formatNumber(run)}
              </span>
              {result ? (
                <>
                  <MeasuredCells result={result} mean={mean} scales={scales} thresholds={thresholds} />
                  {result.saturation.exceeded ? (
                    <p className="flex items-start gap-2 text-sm text-warning @xl:col-span-2 @3xl:col-span-full">
                      <Icon icon={TriangleAlert} size={14} className="mt-1 shrink-0" />
                      O gerador de carga pode ter limitado a medição: {describeExcess(result, thresholds)}. A nota não foi alterada.
                    </p>
                  ) : null}
                </>
              ) : (
                <p
                  role="alert"
                  className="flex items-start gap-2 text-sm text-error @xl:col-span-2 @3xl:col-span-5"
                >
                  <Icon icon={CircleX} size={14} className="mt-1 shrink-0" />
                  A execução falhou e conta como nota 0: {error ?? 'erro desconhecido'}
                </p>
              )}
            </li>
          ))}
        </ol>
      </div>

      {runs.length > 1 ? <LazyRunLatencyChart runs={runs} targetLatency={targetLatency} /> : null}

    </section>
  )
}
