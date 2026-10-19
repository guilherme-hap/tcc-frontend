import { useId } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts'
import type { IPerformanceSeriesPoint } from '../../types'
import {
  AXIS_LINE,
  AXIS_TICK,
  BAR_CURSOR,
  CHART_MARGIN,
  CHART_MARGIN_OPEN,
  CHART_TEXT,
  ERROR_COLOR,
  GRID_STROKE,
  LINE_CURSOR,
  PERFORMANCE_COLOR,
  REFERENCE_COLOR,
  Y_AXIS_WIDTH,
} from '../../utils/chart'
import { formatCount, formatMilliseconds, formatNumber } from '../../utils/format'
import { FOCUS_RING } from '../ui/classes'
import { InfoTip } from '../ui/InfoTip'
import { ChartTooltip } from './ChartTooltip'

interface Row {
  second: number
  responses: number | undefined
  latency: number | null
  errors: number | undefined
}

function buildRows(points: IPerformanceSeriesPoint[], minSlots: number): Row[] {
  const count = Math.max(minSlots, ...points.map((point) => point.second), 1)
  const bySecond = new Map(points.map((point) => [point.second, point]))

  return Array.from({ length: count }, (_, index) => {
    const point = bySecond.get(index + 1)
    return {
      second: index + 1,
      responses: point?.responses,
      latency: point?.meanLatency ?? null,
      errors: point?.errors,
    }
  })
}

function describeSeries(maxResponses: number, latencies: number[], errors: number): string {
  const latency =
    latencies.length > 0
      ? `, latência média de ${formatMilliseconds(Math.min(...latencies))} a ${formatMilliseconds(Math.max(...latencies))}`
      : ''
  return `Série por segundo: até ${formatNumber(maxResponses)} respostas por segundo${latency}, ${formatCount(errors, 'erro', 'erros')}.`
}

function SecondReadout({ active, label, rows }: TooltipContentProps & { rows: Row[] }) {
  const row = active ? rows.find((item) => item.second === Number(label)) : undefined
  if (!row || row.responses === undefined) return null

  return (
    <ChartTooltip
      title={`Segundo ${formatNumber(row.second)}`}
      rows={[
        { label: 'Respostas', value: formatNumber(row.responses) },
        {
          label: 'Latência média',
          value: row.latency === null ? 'sem latência medida' : formatMilliseconds(row.latency),
        },
        {
          label: 'Erros',
          value: formatNumber(row.errors ?? 0),
          tone: row.errors ? 'error' : undefined,
        },
      ]}
    />
  )
}

const HIDDEN_TOOLTIP = () => null

interface PanelHeaderProps {
  title: string
  value: string
  error?: boolean
}

function PanelHeader({ title, value, error = false }: PanelHeaderProps) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-xs text-ink-secondary">
      <span>{title}</span>
      <span className={`font-mono tabular-nums ${error ? 'text-error' : ''}`}>{value}</span>
    </div>
  )
}

interface SeriesChartProps {
  points: IPerformanceSeriesPoint[]
  minSlots?: number
  targetLatency?: number
}

export function SeriesChart({ points, minSlots = 0, targetLatency }: SeriesChartProps) {
  const syncId = useId()
  const rows = buildRows(points, minSlots)
  const maxResponses = Math.max(1, ...points.map((point) => point.responses))
  const latencies = points.flatMap((point) =>
    point.meanLatency === null ? [] : [point.meanLatency],
  )
  const peakLatency = Math.max(1, ...latencies)
  const totalErrors = points.reduce((sum, point) => sum + point.errors, 0)
  const showTarget = targetLatency !== undefined && targetLatency <= peakLatency * 1.1
  const xAxis = (visible: boolean) => (
    <XAxis
      dataKey="second"
      scale="band"
      hide={!visible}
      tickLine={false}
      axisLine={AXIS_LINE}
      tick={AXIS_TICK}
      interval="preserveStartEnd"
      minTickGap={28}
      tickFormatter={(value: number) => `${formatNumber(value)} s`}
    />
  )

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <p className="flex items-center gap-1.5 text-xs text-ink-secondary">
        {points.length > 0
          ? `${formatCount(points.length, 'segundo medido', 'segundos medidos')}.`
          : 'Aguardando o primeiro segundo do teste.'}
        {points.length > 0 ? (
          <InfoTip label="Série por segundo">
            Toque ou passe o cursor sobre o gráfico para ver cada segundo.
          </InfoTip>
        ) : null}
      </p>
      <div
        role="img"
        aria-label={describeSeries(maxResponses, latencies, totalErrors)}
        className={`flex min-w-0 flex-col gap-3 ${CHART_TEXT}`}
      >
        <div className="flex flex-col gap-1">
          <PanelHeader title="Respostas por segundo" value={`máx. ${formatNumber(maxResponses)}`} />
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} syncId={syncId} margin={CHART_MARGIN_OPEN} barCategoryGap="12%">
                <CartesianGrid vertical={false} stroke={GRID_STROKE} />
                {xAxis(false)}
                <YAxis
                  domain={[0, 'auto']}
                  tickCount={3}
                  interval={0}
                  allowDecimals={false}
                  width={Y_AXIS_WIDTH}
                  tickLine={false}
                  axisLine={false}
                  tick={AXIS_TICK}
                  tickFormatter={(value: number) => formatNumber(value)}
                />
                <Tooltip
                  cursor={BAR_CURSOR}
                  isAnimationActive={false}
                  content={(props) => <SecondReadout {...props} rows={rows} />}
                />
                <Bar
                  dataKey="responses"
                  fill={PERFORMANCE_COLOR}
                  radius={[2, 2, 0, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <PanelHeader
            title="Latência média por segundo"
            value={latencies.length > 0 ? `máx. ${formatMilliseconds(peakLatency)}` : '—'}
          />
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rows} syncId={syncId} margin={CHART_MARGIN_OPEN}>
                <CartesianGrid vertical={false} stroke={GRID_STROKE} />
                {xAxis(false)}
                <YAxis
                  domain={[0, 'auto']}
                  tickCount={3}
                  interval={0}
                  width={Y_AXIS_WIDTH}
                  tickLine={false}
                  axisLine={false}
                  tick={AXIS_TICK}
                  tickFormatter={(value: number) => (value === 0 ? '0' : formatMilliseconds(value))}
                />
                <Tooltip cursor={LINE_CURSOR} isAnimationActive={false} content={HIDDEN_TOOLTIP} />
                {showTarget ? (
                  <ReferenceLine
                    y={targetLatency}
                    stroke={REFERENCE_COLOR}
                    strokeDasharray="4 3"
                    label={{
                      value: `T = ${formatMilliseconds(targetLatency)}`,
                      position: 'insideTopRight',
                      fill: REFERENCE_COLOR,
                    }}
                  />
                ) : null}
                <Line
                  dataKey="latency"
                  type="monotone"
                  stroke={PERFORMANCE_COLOR}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 3, fill: PERFORMANCE_COLOR, stroke: 'var(--surface)' }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <PanelHeader
            title="Erros por segundo (5xx e falhas de conexão)"
            value={formatCount(totalErrors, 'erro', 'erros')}
            error={totalErrors > 0}
          />
          <div className="h-20">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} syncId={syncId} margin={CHART_MARGIN} barCategoryGap="12%">
                <CartesianGrid vertical={false} stroke={GRID_STROKE} />
                {xAxis(true)}
                <YAxis
                  domain={[0, 'auto']}
                  tickCount={2}
                  allowDecimals={false}
                  width={Y_AXIS_WIDTH}
                  tickLine={false}
                  axisLine={false}
                  tick={AXIS_TICK}
                  tickFormatter={(value: number) => formatNumber(value)}
                />
                <Tooltip cursor={BAR_CURSOR} isAnimationActive={false} content={HIDDEN_TOOLTIP} />
                <Bar
                  dataKey="errors"
                  fill={ERROR_COLOR}
                  radius={[2, 2, 0, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {points.length > 0 ? (
        <details className="group text-sm">
          <summary
            className={`w-fit cursor-pointer rounded-sm text-ink-secondary hover:text-ink max-lg:flex max-lg:min-h-11 max-lg:items-center ${FOCUS_RING}`}
          >
            Ver os dados por segundo
          </summary>
          <div
            role="region"
            aria-label="Dados por segundo"
            tabIndex={0}
            className={`relative mt-2 max-h-60 overflow-auto rounded-md border border-border ${FOCUS_RING}`}
          >
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
