import type { EvaluationType } from '../types'
import { formatDate } from './format'

export const CHART_TEXT = 'font-mono [&_.recharts-text]:text-xs'

export const AXIS_TICK = { fill: 'var(--ink-muted)' }
export const AXIS_LINE = { stroke: 'var(--border-hover)' }
export const GRID_STROKE = 'var(--border)'
export const LINE_CURSOR = { stroke: 'var(--ink-secondary)', strokeWidth: 1 }
export const BAR_CURSOR = { fill: 'var(--ink)', fillOpacity: 0.08 }
export const PERFORMANCE_COLOR = 'var(--pillar-performance)'
export const ERROR_COLOR = 'var(--error)'
export const REFERENCE_COLOR = 'var(--ink-secondary)'
export const Y_AXIS_WIDTH = 76
export const CHART_MARGIN = { top: 8, right: 16, bottom: 0, left: 0 }
export const CHART_MARGIN_OPEN = { top: 8, right: 16, bottom: 12, left: 0 }

export function runOpacity(index: number, count: number): number {
  return count <= 1 ? 1 : 0.3 + (0.7 * index) / (count - 1)
}

const RUN_DASHES = [undefined, '7 3', '2 3']

export function runDash(index: number): string | undefined {
  return RUN_DASHES[index % RUN_DASHES.length]
}

export const SCORE_TIE_EPSILON = 0.005

export function scoresTie(scores: (number | null | undefined)[]): boolean {
  const measured = scores.filter((score): score is number => typeof score === 'number')
  if (measured.length < 2 || measured.length < scores.length) return false
  return Math.max(...measured) - Math.min(...measured) < SCORE_TIE_EPSILON
}

export const TREND_COLORS: Record<EvaluationType, string> = {
  contract: 'var(--pillar-contract)',
  performance: 'var(--pillar-performance)',
  security: 'var(--pillar-security)',
  full: 'var(--measure)',
}

const MILLISECONDS_PER_DAY = 86_400_000
const SHORT_DATE_SPAN_DAYS = 180

export function formatAxisInstant(milliseconds: number, spanMilliseconds: number): string {
  const date = new Date(milliseconds)
  if (spanMilliseconds < MILLISECONDS_PER_DAY) {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }
  if (spanMilliseconds < SHORT_DATE_SPAN_DAYS * MILLISECONDS_PER_DAY) {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }
  return formatDate(date)
}
