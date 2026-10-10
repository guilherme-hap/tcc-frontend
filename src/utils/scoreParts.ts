import type { IScoreBreakdown, IScorePart, ISecurityCheckResult } from '../types'
import { formatNumber } from './format'
import {
  CHECK_STATUS_LABELS,
  CHECK_STATUS_ORDER,
  LAYER_LABELS,
  LAYER_SHORT_LABELS,
  PILLAR_LABELS,
} from './labels'

export interface ScorePart extends IScorePart {
  label: string
  ringLabel?: string
  detail?: string
}

const MIN_PARTS = 2

function weighted(parts: IScorePart[] | undefined): IScorePart[] | null {
  const kept = (parts ?? []).filter((part) => part.weight > 0)
  return kept.length >= MIN_PARTS ? kept : null
}

function labelOf(labels: Record<string, string>, id: string): string {
  return labels[id] ?? id
}

export function finalScoreParts(breakdown: IScoreBreakdown | null): ScorePart[] | null {
  const parts = weighted(breakdown?.final)
  return parts ? parts.map((part) => ({ ...part, label: labelOf(PILLAR_LABELS, part.id) })) : null
}

function describeStatuses(checks: ISecurityCheckResult[]): string {
  return CHECK_STATUS_ORDER.map((status) => ({
    status,
    count: checks.filter((check) => check.status === status).length,
  }))
    .filter(({ count }) => count > 0)
    .map(({ status, count }) => `${CHECK_STATUS_LABELS[status]}: ${formatNumber(count)}`)
    .join(' · ')
}

export function securityScoreParts(
  breakdown: IScoreBreakdown | null,
  checks: ISecurityCheckResult[],
): ScorePart[] | null {
  const parts = weighted(breakdown?.security)
  if (!parts) return null

  return parts.map((part) => ({
    ...part,
    label: labelOf(LAYER_LABELS, part.id),
    ringLabel: labelOf(LAYER_SHORT_LABELS, part.id),
    detail: describeStatuses(checks.filter((check) => check.layer === part.id)),
  }))
}
