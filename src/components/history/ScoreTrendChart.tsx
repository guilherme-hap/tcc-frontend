import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts'
import type { EvaluationListItem, EvaluationType } from '../../types'
import {
  AXIS_LINE,
  AXIS_TICK,
  CHART_TEXT,
  formatAxisInstant,
  GRID_STROKE,
  LINE_CURSOR,
  TREND_COLORS,
} from '../../utils/chart'
import { formatCount, formatDateTime, formatNumber } from '../../utils/format'
import { TYPE_LABELS } from '../../utils/labels'
import { ChartTooltip } from '../result/ChartTooltip'

const SCORE_AXIS_WIDTH = 32
const SCORE_AXIS_TICKS = [0, 50, 100]
const TREND_MARGIN = { top: 8, right: 8, bottom: 0, left: 0 }
const TIME_PADDING = { left: 28, right: 28 }
const TIME_TICK_COUNT = 3
const TIME_DOMAIN: [string, string] = ['dataMin', 'dataMax']
const URL_PREFIX = /^https?:\/\//
const URL_HEAD = 26
const URL_TAIL = 16

interface TrendPoint {
  time: number
  score: number
  openApiUrl: string
}

interface ScoreTrendChartProps {
  items: EvaluationListItem[]
  type: EvaluationType
}

function toPoints(items: EvaluationListItem[]): TrendPoint[] {
  return items.flatMap((item) =>
    item.finalScore === null
      ? []
      : [
          {
            time: new Date(item.createdAt).getTime(),
            score: item.finalScore,
            openApiUrl: item.openApiUrl,
          },
        ],
  )
}

function shortenUrl(url: string): string {
  const bare = url.replace(URL_PREFIX, '')
  return bare.length <= URL_HEAD + URL_TAIL + 1
    ? bare
    : `${bare.slice(0, URL_HEAD)}…${bare.slice(-URL_TAIL)}`
}

function evenTicks(first: number, last: number): number[] {
  return Array.from(
    { length: TIME_TICK_COUNT },
    (_, index) => first + ((last - first) * index) / (TIME_TICK_COUNT - 1),
  )
}

function describeTrend(points: TrendPoint[], type: EvaluationType): string {
  const scores = points.map((point) => point.score)
  const latest = points[points.length - 1]
  return `Nota do tipo ${TYPE_LABELS[type]} ao longo do tempo, de 0 a 100: ${formatCount(points.length, 'avaliação', 'avaliações')}, de ${formatDateTime(new Date(points[0].time).toISOString())} a ${formatDateTime(new Date(latest.time).toISOString())}, notas de ${formatNumber(Math.min(...scores))} a ${formatNumber(Math.max(...scores))}, a mais recente ${formatNumber(latest.score)}.`
}

function TrendReadout({
  active,
  payload,
  type,
}: TooltipContentProps & { type: EvaluationType }) {
  const point = active ? (payload?.[0]?.payload as TrendPoint | undefined) : undefined
  if (!point) return null

  return (
    <ChartTooltip
      title={formatDateTime(new Date(point.time).toISOString())}
      rows={[
        { label: 'Tipo', value: TYPE_LABELS[type] },
        { label: 'Nota', value: formatNumber(point.score) },
        { label: 'Especificação', value: shortenUrl(point.openApiUrl) },
      ]}
    />
  )
}

export function ScoreTrendChart({ items, type }: ScoreTrendChartProps) {
  const points = toPoints(items)
  const color = TREND_COLORS[type]
  const first = points[0].time
  const last = points[points.length - 1].time
  const span = last - first

  return (
    <div
      role="img"
      aria-label={describeTrend(points, type)}
      className={`h-56 min-w-0 ${CHART_TEXT}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={TREND_MARGIN}>
          <CartesianGrid vertical={false} stroke={GRID_STROKE} />
          <XAxis
            dataKey="time"
            type="number"
            scale="time"
            domain={TIME_DOMAIN}
            ticks={evenTicks(first, last)}
            tickFormatter={(value: number) => formatAxisInstant(value, span)}
            padding={TIME_PADDING}
            tickLine={false}
            axisLine={AXIS_LINE}
            tick={AXIS_TICK}
          />
          <YAxis
            domain={[0, 100]}
            ticks={SCORE_AXIS_TICKS}
            width={SCORE_AXIS_WIDTH}
            tickLine={false}
            axisLine={false}
            tick={AXIS_TICK}
          />
          <Tooltip
            cursor={LINE_CURSOR}
            isAnimationActive={false}
            content={(props) => <TrendReadout {...props} type={type} />}
          />
          <Line
            dataKey="score"
            type="linear"
            stroke={color}
            strokeWidth={2}
            dot={{ r: 3, fill: color, stroke: 'var(--surface)', strokeWidth: 1 }}
            activeDot={{ r: 5, fill: color, stroke: 'var(--surface)', strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
