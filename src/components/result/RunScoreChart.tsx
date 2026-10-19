import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts'
import type { IDispersion } from '../../types'
import {
  AXIS_LINE,
  AXIS_TICK,
  BAR_CURSOR,
  CHART_TEXT,
  GRID_STROKE,
  PERFORMANCE_COLOR,
  SCORE_TIE_EPSILON,
} from '../../utils/chart'
import { formatNumber } from '../../utils/format'
import { ChartTooltip } from './ChartTooltip'

const SCORE_AXIS_TICKS = [0, 50, 100]
const SCORE_MARGIN = { top: 28, right: 8, bottom: 0, left: 0 }

interface RunScoreChartProps {
  scores: (number | null)[]
  reference: number | undefined
  dispersion: IDispersion | null
}

interface ScoreDatum {
  run: number
  score: number
  measured: boolean
}

interface LabelBox {
  x?: number | string
  y?: number | string
  width?: number | string
  index?: number
}

function describeScores(scores: (number | null)[]): string {
  const list = scores
    .map((score, index) => `Execução ${index + 1}: ${score === null ? 'não medida' : formatNumber(score)}`)
    .join('; ')
  return `Nota do pilar por execução, de 0 a 100. ${list}.`
}

function ScoreReadout({ active, label, rows }: TooltipContentProps & { rows: ScoreDatum[] }) {
  const row = active ? rows.find((item) => item.run === Number(label)) : undefined
  if (!row) return null

  return (
    <ChartTooltip
      title={`Execução ${formatNumber(row.run)}`}
      rows={[{ label: 'Nota', value: row.measured ? formatNumber(row.score) : 'não medida' }]}
    />
  )
}

export function RunScoreChart({ scores, reference, dispersion }: RunScoreChartProps) {
  const rows: ScoreDatum[] = scores.map((score, index) => ({
    run: index + 1,
    score: score ?? 0,
    measured: score !== null,
  }))
  const band =
    reference !== undefined && dispersion && dispersion.stddev >= SCORE_TIE_EPSILON
      ? {
          low: Math.max(0, reference - dispersion.stddev),
          high: Math.min(100, reference + dispersion.stddev),
        }
      : null

  return (
    <figure className="flex min-w-0 flex-col gap-3">
      <div role="img" aria-label={describeScores(scores)} className={`h-48 min-w-0 ${CHART_TEXT}`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={SCORE_MARGIN} barCategoryGap="22%">
            <CartesianGrid vertical={false} stroke={GRID_STROKE} />
            <XAxis
              dataKey="run"
              height={44}
              tickLine={false}
              axisLine={AXIS_LINE}
              tick={AXIS_TICK}
              label={{ value: 'Execução', position: 'insideBottom', fill: AXIS_TICK.fill }}
            />
            <YAxis hide domain={[0, 100]} ticks={SCORE_AXIS_TICKS} />
            <Tooltip
              cursor={BAR_CURSOR}
              isAnimationActive={false}
              content={(props) => <ScoreReadout {...props} rows={rows} />}
            />
            {band ? (
              <ReferenceArea y1={band.low} y2={band.high} fill="var(--ink)" fillOpacity={0.1} />
            ) : null}
            {reference !== undefined ? (
              <ReferenceLine y={reference} stroke="var(--ink)" strokeDasharray="4 3" />
            ) : null}
            <Bar
              dataKey="score"
              fill={PERFORMANCE_COLOR}
              radius={[2, 2, 0, 0]}
              maxBarSize={72}
              minPointSize={2}
              isAnimationActive={false}
            >
              <LabelList
                dataKey="score"
                content={(props) => {
                  const { x, y, width, index } = props as unknown as LabelBox
                  const datum = rows[index ?? 0]
                  if (!datum) return null
                  const cx = Number(x) + Number(width) / 2
                  return datum.measured ? (
                    <text
                      x={cx}
                      y={Number(y) - 6}
                      textAnchor="middle"
                      className="num fill-ink text-base"
                    >
                      {formatNumber(datum.score)}
                    </text>
                  ) : (
                    <text
                      x={cx}
                      y={Number(y) - 6}
                      textAnchor="middle"
                      className="fill-ink-secondary text-xs"
                    >
                      não medida
                    </text>
                  )
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-ink-secondary">
        <span>Escala de 0 a 100</span>
        {reference !== undefined ? (
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="w-4 border-t border-dashed border-ink" />
            <span>
              Nota do pilar <span className="font-mono text-ink tabular-nums">{formatNumber(reference)}</span>
            </span>
          </span>
        ) : null}
        {band ? (
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="h-2 w-4 rounded-xs bg-ink/10" />
            ± 1 desvio padrão
          </span>
        ) : null}
      </figcaption>
    </figure>
  )
}
