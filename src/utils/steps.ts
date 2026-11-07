import type {
  EvaluationRecord,
  EvaluationStepStatus,
  IEvaluationStep,
  IStepProgress,
  PillarName,
} from '../types'

const UNFINISHED_STATUSES: EvaluationStepStatus[] = ['FAILED', 'SKIPPED', 'INTERRUPTED']

export interface StepStage {
  stage: number
  steps: IEvaluationStep[]
}

export function findStep(
  evaluation: EvaluationRecord,
  pillar: PillarName,
): IEvaluationStep | undefined {
  return evaluation.steps?.find((step) => step.pillar === pillar)
}

export function isStepUnfinished(step: IEvaluationStep | undefined): boolean {
  return step !== undefined && UNFINISHED_STATUSES.includes(step.status)
}

export function isStepWaiting(step: IEvaluationStep): boolean {
  return Boolean(step.queuedAt) && !step.startedAt && (step.status === 'PENDING' || step.status === 'RUNNING')
}

export function isWaitingForLoadTest(evaluation: EvaluationRecord): boolean {
  if (evaluation.status !== 'RUNNING') return false
  const steps = evaluation.steps ?? []
  const working = steps.some((step) => step.startedAt && !step.finishedAt && step.status === 'RUNNING')
  return !working && steps.some(isStepWaiting)
}

export interface WorkAndWait {
  workMs: number
  waitMs: number
}

export function workAndWait(evaluation: EvaluationRecord): WorkAndWait | null {
  const { startedAt, finishedAt, steps } = evaluation
  if (!startedAt || !finishedAt || !steps?.some((step) => step.queuedAt)) return null

  const intervals = steps
    .filter((step) => step.startedAt && step.finishedAt)
    .map((step) => [Date.parse(step.startedAt!), Date.parse(step.finishedAt!)] as const)
    .sort((a, b) => a[0] - b[0])
  let workMs = 0
  let cursor = -Infinity
  for (const [start, end] of intervals) {
    const from = Math.max(start, cursor)
    if (end > from) workMs += end - from
    cursor = Math.max(cursor, end)
  }
  const totalMs = Math.max(0, Date.parse(finishedAt) - Date.parse(startedAt))
  return { workMs, waitMs: Math.max(0, totalMs - workMs) }
}

export const ALL_PILLARS_FAILED_CODE = 'EVALUATION_PILLARS_FAILED'

export function stepsWithError(evaluation: EvaluationRecord): IEvaluationStep[] {
  return (evaluation.steps ?? []).filter((step) => step.error)
}

export function noticeListsStepErrors(evaluation: EvaluationRecord): boolean {
  if (stepsWithError(evaluation).length === 0) return false
  return (
    evaluation.status === 'PARTIAL' ||
    (evaluation.status === 'FAILED' && evaluation.errorCode === ALL_PILLARS_FAILED_CODE)
  )
}

export function groupByStage(steps: IEvaluationStep[]): StepStage[] {
  const stages = [...new Set(steps.map((step) => step.stage))].sort((a, b) => a - b)
  return stages.map((stage) => ({ stage, steps: steps.filter((step) => step.stage === stage) }))
}

export function performanceProgress(evaluation: EvaluationRecord): IStepProgress | undefined {
  const step = findStep(evaluation, 'performance')
  return step?.status === 'RUNNING' ? step.progress : undefined
}

export function stepDuration(
  { startedAt, finishedAt }: IEvaluationStep,
  now: number,
): number | null {
  if (!startedAt) return null
  const end = finishedAt ? Date.parse(finishedAt) : now
  return Math.max(0, end - Date.parse(startedAt))
}

export function liveElapsedSeconds(
  progress: IStepProgress,
  tickAt: number,
  now: number,
): number {
  if (progress.phase !== 'RUNNING') return 0
  const sinceTick = tickAt > 0 ? Math.min(1, Math.max(0, now - tickAt) / 1000) : 0
  return Math.min(progress.expectedDurationSeconds, progress.elapsedSeconds + sinceTick)
}
