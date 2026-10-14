import type { EvaluationRecord, IScorePart, PillarName } from '../../types'
import { groupByRule } from '../../utils/contractRules'
import { formatCount, formatNumber } from '../../utils/format'
import { SEVERITY_LABELS, SEVERITY_ORDER, STEP_STATUS_LABELS } from '../../utils/labels'
import { describeStatuses } from '../../utils/scoreParts'
import { findStep, isStepUnfinished } from '../../utils/steps'

export function hasPillarResult(evaluation: EvaluationRecord, pillar: PillarName): boolean {
  if (pillar === 'contract') return evaluation.spectralResult !== null
  if (pillar === 'performance') return evaluation.performanceResults !== null
  return evaluation.securityResult !== null
}

export function hasPillarFailed(evaluation: EvaluationRecord, pillar: PillarName): boolean {
  return isStepUnfinished(findStep(evaluation, pillar))
}

export function pillarPart(
  evaluation: EvaluationRecord,
  pillar: PillarName,
): IScorePart | undefined {
  return evaluation.scoreBreakdown?.final?.find((part) => part.id === pillar)
}

export function pillarStateLabel(
  evaluation: EvaluationRecord,
  pillar: PillarName,
  isActive: boolean,
): string {
  const step = findStep(evaluation, pillar)
  if (step && step.status !== 'COMPLETED' && (isActive || isStepUnfinished(step))) {
    return STEP_STATUS_LABELS[step.status]
  }
  return isActive ? 'Calculando' : 'Sem resultado'
}

export function pillarHeadline(evaluation: EvaluationRecord, pillar: PillarName): string | null {
  const { spectralResult, performanceResults, securityResult } = evaluation

  if (pillar === 'contract') {
    return spectralResult
      ? formatCount(spectralResult.summary.violatedRules, 'regra violada', 'regras violadas')
      : null
  }
  if (pillar === 'performance') {
    if (!performanceResults) return null
    const targets = evaluation.targets?.length ?? performanceResults.length
    return formatCount(targets, 'endpoint', 'endpoints')
  }
  if (!securityResult) return null

  const pending = securityResult.filter((check) => check.status !== 'pass').length
  return formatCount(pending, 'pendência', 'pendências')
}

export function pillarDetail(evaluation: EvaluationRecord, pillar: PillarName): string | null {
  const { spectralResult, performanceResults, securityResult } = evaluation

  if (pillar === 'contract') {
    if (!spectralResult) return null

    const groups = groupByRule(spectralResult)
    const applicable = formatCount(
      spectralResult.summary.evaluatedRules,
      'regra aplicável',
      'regras aplicáveis',
    )
    const bySeverity = SEVERITY_ORDER.map((severity) => ({
      severity,
      count: groups.filter((group) => group.severity === severity).length,
    }))
      .filter(({ count }) => count > 0)
      .map(({ severity, count }) => `${SEVERITY_LABELS[severity]}: ${formatNumber(count)}`)
      .join(' · ')

    return `${applicable} · ${bySeverity || 'nenhuma violada'}`
  }

  if (pillar === 'performance') {
    if (!performanceResults) return null

    const measured = performanceResults.filter((target) => target.result?.score != null).length
    const requests = performanceResults.reduce(
      (total, target) => total + (target.result?.totalRequests ?? 0),
      0,
    )
    const endpoints = formatCount(
      evaluation.targets?.length ?? performanceResults.length,
      'endpoint medido',
      'endpoints medidos',
    )

    return `${formatNumber(measured)} de ${endpoints} · ${formatCount(requests, 'requisição', 'requisições')}`
  }

  if (!securityResult) return null

  const checks = formatCount(securityResult.length, 'verificação', 'verificações')
  return `${checks} · ${describeStatuses(securityResult)}`
}
