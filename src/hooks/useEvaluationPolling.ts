import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getEvaluation, getEvaluationProgress } from '../services'
import type {
  EvaluationProgress,
  EvaluationRecord,
  EvaluationStepStatus,
  IEvaluationStep,
  IPerformanceSeriesPoint,
  IStepProgress,
} from '../types'
import { isStatusActive } from '../utils/status'
import { useSession } from './useSession'

const LIVE_PROGRESS_INTERVAL_MS = 1000
const WAITING_PROGRESS_INTERVAL_MS = 2500
const RETRY_INTERVAL_MS = 2000
const SETTLED_STEP_STATUSES: EvaluationStepStatus[] = ['COMPLETED', 'FAILED', 'SKIPPED']

export interface LiveSeries {
  targetIndex: number
  run: number
  points: IPerformanceSeriesPoint[]
}

interface TrackedProgress extends EvaluationProgress {
  liveSeries: LiveSeries | null
  refreshDue: boolean
  tickAt: number
}

export interface UseEvaluationPollingResult {
  evaluation: EvaluationRecord | undefined
  liveSeries: LiveSeries | null
  progressTickAt: number
  isLoading: boolean
  isPaused: boolean
  isPolling: boolean
  isFetching: boolean
  error: string | null
  refetch: () => void
}

function performanceProgress(steps: IEvaluationStep[] | null | undefined): IStepProgress | undefined {
  return steps?.find((step) => step.pillar === 'performance')?.progress
}

function accumulateSeries(
  previous: LiveSeries | null | undefined,
  progress: IStepProgress | undefined,
): LiveSeries | null {
  if (!progress) return null

  const sameTest = previous?.targetIndex === progress.targetIndex && previous.run === progress.run
  const points = sameTest ? previous.points : []
  const { lastSecond } = progress
  if (!lastSecond) return { targetIndex: progress.targetIndex, run: progress.run, points }

  return {
    targetIndex: progress.targetIndex,
    run: progress.run,
    points: [...points.filter((point) => point.second !== lastSecond.second), lastSecond].sort(
      (a, b) => a.second - b.second,
    ),
  }
}

function isSameTick(before: IStepProgress | undefined, after: IStepProgress | undefined): boolean {
  return (
    before !== undefined &&
    after !== undefined &&
    before.targetIndex === after.targetIndex &&
    before.run === after.run &&
    before.phase === after.phase &&
    before.elapsedSeconds === after.elapsedSeconds
  )
}

function needsRefresh(
  previousSteps: IEvaluationStep[] | null | undefined,
  next: EvaluationProgress,
): boolean {
  if (!isStatusActive(next.status)) return true

  const settled = (next.steps ?? []).some((step) => {
    const before = previousSteps?.find((item) => item.pillar === step.pillar)
    return SETTLED_STEP_STATUSES.includes(step.status) && before?.status !== step.status
  })
  if (settled) return true

  const before = performanceProgress(previousSteps)
  const after = performanceProgress(next.steps)
  return (
    before !== undefined &&
    after !== undefined &&
    (before.targetIndex !== after.targetIndex || before.run !== after.run)
  )
}

function mergeProgress(
  record: EvaluationRecord,
  progress: TrackedProgress | undefined,
): EvaluationRecord {
  if (!progress || !isStatusActive(record.status)) return record
  if (Date.parse(progress.updatedAt) < Date.parse(record.updatedAt)) return record

  return {
    ...record,
    steps: progress.steps,
    status: isStatusActive(progress.status) ? progress.status : record.status,
  }
}

export function useEvaluationPolling(
  evaluationId: string | undefined,
): UseEvaluationPollingResult {
  const { user } = useSession()
  const queryClient = useQueryClient()
  const evaluationKey = ['evaluation', evaluationId, user?.id]
  const progressKey = ['evaluation-progress', evaluationId, user?.id]

  const query = useQuery<EvaluationRecord, Error>({
    queryKey: evaluationKey,
    queryFn: () => getEvaluation(evaluationId!),
    enabled: !!evaluationId,
    refetchIntervalInBackground: false,
    refetchInterval: (queryState) => {
      const { data, status } = queryState.state
      return status === 'error' && data && isStatusActive(data.status) ? RETRY_INTERVAL_MS : false
    },
  })

  const record = query.data
  const tracking = !!record && isStatusActive(record.status)

  const progressQuery = useQuery<TrackedProgress, Error>({
    queryKey: progressKey,
    queryFn: async () => {
      const next = await getEvaluationProgress(evaluationId!)
      const previous = queryClient.getQueryData<TrackedProgress>(progressKey)
      const baseline =
        previous?.steps ?? queryClient.getQueryData<EvaluationRecord>(evaluationKey)?.steps

      const sameTick = isSameTick(performanceProgress(previous?.steps), performanceProgress(next.steps))

      return {
        ...next,
        liveSeries: accumulateSeries(previous?.liveSeries, performanceProgress(next.steps)),
        refreshDue: needsRefresh(baseline, next),
        tickAt: sameTick && previous ? previous.tickAt : Date.now(),
      }
    },
    enabled: tracking,
    refetchIntervalInBackground: false,
    refetchInterval: (queryState) => {
      const { data } = queryState.state
      if (data && !isStatusActive(data.status)) return false
      return performanceProgress(data?.steps)?.phase === 'RUNNING'
        ? LIVE_PROGRESS_INTERVAL_MS
        : WAITING_PROGRESS_INTERVAL_MS
    },
  })

  const progress = tracking ? progressQuery.data : undefined
  const { refetch } = query

  useEffect(() => {
    if (progress?.refreshDue) void refetch()
  }, [progress, refetch])

  const evaluation = record ? mergeProgress(record, progress) : undefined
  const isPolling = !!evaluation && isStatusActive(evaluation.status)
  const error = query.error ?? (tracking ? progressQuery.error : null)

  return {
    evaluation,
    liveSeries: isPolling ? (progress?.liveSeries ?? null) : null,
    progressTickAt: progress?.tickAt ?? 0,
    isLoading: query.isPending,
    isPaused: query.isPaused,
    isPolling,
    isFetching: query.isFetching,
    error: error?.message ?? null,
    refetch: () => void query.refetch(),
  }
}
