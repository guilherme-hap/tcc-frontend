import { useQuery } from '@tanstack/react-query'
import { getEvaluation } from '../services'
import type { EvaluationRecord, EvaluationStatus } from '../types'

const POLLING_INTERVAL_MS = 2000

const ACTIVE_STATUSES: EvaluationStatus[] = ['PENDING', 'RUNNING']

function isStatusActive(status: EvaluationStatus): boolean {
  return ACTIVE_STATUSES.includes(status)
}

export interface UseEvaluationPollingResult {
  evaluation: EvaluationRecord | undefined
  isLoading: boolean
  isPolling: boolean
  error: string | null
}

export function useEvaluationPolling(
  evaluationId: string | undefined,
): UseEvaluationPollingResult {
  const query = useQuery<EvaluationRecord, Error>({
    queryKey: ['evaluation', evaluationId],
    queryFn: () => getEvaluation(evaluationId!),
    enabled: !!evaluationId,
    refetchIntervalInBackground: false,
    refetchInterval: (queryState) => {
      const hasError = queryState.state.status === 'error'
      if (hasError) return false

      const latestStatus = queryState.state.data?.status
      if (!latestStatus) return POLLING_INTERVAL_MS

      return isStatusActive(latestStatus) ? POLLING_INTERVAL_MS : false
    },
  })

  const currentStatus = query.data?.status
  const isPolling = !!currentStatus && isStatusActive(currentStatus)

  return {
    evaluation: query.data,
    isLoading: query.isLoading,
    isPolling,
    error: query.error?.message ?? null,
  }
}
