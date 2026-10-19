import {
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
import type { IPerformanceRun } from '../../types'
import {
  AXIS_LINE,
  AXIS_TICK,
  CHART_MARGIN,
  CHART_TEXT,
  GRID_STROKE,
  LINE_CURSOR,
  PERFORMANCE_COLOR,
  REFERENCE_COLOR,
  Y_AXIS_WIDTH,
  runDash,
  runOpacity,
} from '../../utils/chart'
import { formatMilliseconds, formatNumber } from '../../utils/format'
import { ChartTooltip } from './ChartTooltip'

interface RunLine {
  run: number
  key: string
  opacity: number
  dash: string | undefined
}

type Row = { second: number } & Record<string, number | null>

function buildLines(runs: IPerformanceRun[]): RunLine[] {
  const measured = runs.filter(({ result }) => result && result.series.length > 0)

  return measured.map(({ run }, index) => ({
    run,
    key: `run${run}`,
    opacity: runOpacity(index, measured.length),
    dash: runDash(index),
  }))
}

function buildRows(runs: IPerformanceRun[], lines: RunLine[]): Row[] {
  const seconds = new Map<number, Row>()

  for (const line of lines) {
    const series = runs.find(({ run }) => run === line.run)?.result?.series ?? []
    for (const point of series) {
      const row = seconds.get(point.second) ?? ({ second: point.second } as Row)
      row[line.key] = point.meanLatency
      seconds.set(point.second, row)
    }
  }

  return [...seconds.values()].sort((a, b) => a.second - b.second)
}

function Swatch({ line }: { line: RunLine }) {
  return (
    <svg aria-hidden="true" width="20" height="4" viewBox="0 0 20 4" className="shrink-0">
      <line
        x1="0"
        y1="2"
        x2="20"
        y2="2"
        stroke={PERFORMANCE_COLOR}
        strokeWidth="2"
        strokeOpacity={line.opacity}
        strokeDasharray={line.dash}
      />
    </svg>
  )
}

interface ReadoutProps extends TooltipContentProps {
  lines: RunLine[]
}

function Readout({ active, label, payload, lines }: ReadoutProps) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <ChartTooltip
      title={`Segundo ${formatNumber(Number(label))}`}
      rows={lines.map((line) => {
        const value = payload.find((item) => item.dataKey === line.key)?.value
        return {
          label: (
            <>
              <Swatch line={line} />
              Execução {formatNumber(line.run)}
            </>
          ),
          value: typeof value === 'number' ? formatMilliseconds(value) : '—',
        }
      })}
    />
  )
}

interface RunLatencyChartProps {
  runs: IPerformanceRun[]
  targetLatency: number
}

export function RunLatencyChart({ runs, targetLatency }: RunLatencyChartProps) {
  const lines = buildLines(runs)
  if (lines.length < 2) return null

  const rows = buildRows(runs, lines)
  const peak = Math.max(
    1,
    ...rows.flatMap((row) => lines.map((line) => row[line.key]).filter((v): v is number => v != null)),
  )
  const showTarget = targetLatency <= peak * 1.1

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <h5 className="text-sm font-medium text-ink">Latência média por segundo, uma linha por execução</h5>
      <div
        role="img"
        aria-label={`Latência média por segundo em ${lines.length} execuções, de 0 a ${formatMilliseconds(peak)}.`}
        className={`h-44 min-w-0 ${CHART_TEXT}`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={CHART_MARGIN}>
            <CartesianGrid vertical={false} stroke={GRID_STROKE} />
            <XAxis
              dataKey="second"
              type="number"
              domain={[1, 'dataMax']}
              allowDecimals={false}
              tickLine={false}
              axisLine={AXIS_LINE}
              tick={AXIS_TICK}
              tickFormatter={(value: number) => `${formatNumber(value)} s`}
            />
            <YAxis
              domain={[0, 'auto']}
              tickCount={4}
              width={Y_AXIS_WIDTH}
              tickLine={false}
              axisLine={false}
              tick={AXIS_TICK}
              tickFormatter={(value: number) => (value === 0 ? '0' : formatMilliseconds(value))}
            />
            <Tooltip
              cursor={LINE_CURSOR}
              content={(props) => <Readout {...props} lines={lines} />}
              isAnimationActive={false}
            />
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
            {lines.map((line) => (
              <Line
                key={line.key}
                dataKey={line.key}
                type="monotone"
                stroke={PERFORMANCE_COLOR}
                strokeOpacity={line.opacity}
                strokeDasharray={line.dash}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3, fill: PERFORMANCE_COLOR, stroke: 'var(--surface)' }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <ul className="flex flex-wrap items-center gap-x-5 gap-y-1 pl-19 text-xs text-ink-secondary">
        {lines.map((line) => (
          <li key={line.run} className="inline-flex items-center gap-2">
            <Swatch line={line} />
            Execução {formatNumber(line.run)}
          </li>
        ))}
      </ul>
    </div>
  )
}
