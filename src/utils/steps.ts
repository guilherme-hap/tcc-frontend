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

export function stepsWithError(evaluation: EvaluationRecord): IEvaluationStep[] {
  return (evaluation.steps ?? []).filter((step) => step.error)
}

export function groupByStage(steps: IEvaluationStep[]): StepStage[] {
  const stages = [...new Set(steps.map((step) => step.stage))].sort((a, b) => a - b)
  return stages.map((stage) => ({ stage, steps: steps.filter((step) => step.stage === stage) }))
}

export function performanceProgress(evaluation: EvaluationRecord): IStepProgress | undefined {
  const step = findStep(evaluation, 'performance')
  return step?.status === 'RUNNING' ? step.progress : undefined
}

export function stepDuration({ startedAt, finishedAt }: IEvaluationStep, now: number): number | null {
  if (!startedAt) return null
  const end = finishedAt ? Date.parse(finishedAt) : now
  return Math.max(0, end - Date.parse(startedAt))
}

export function liveElapsedSeconds(
  progress: IStepProgress,
  receivedAt: number,
  now: number,
): number {
  if (progress.phase !== 'RUNNING') return 0
  const sinceReceived = receivedAt > 0 ? Math.max(0, now - receivedAt) / 1000 : 0
  return Math.min(progress.expectedDurationSeconds, progress.elapsedSeconds + sinceReceived)
}
