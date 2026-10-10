import { useQuery } from '@tanstack/react-query'
import { getEvaluation } from '../services'
import type { EvaluationRecord } from '../types'
import { isStatusActive } from '../utils/status'
import { useSession } from './useSession'

const POLLING_INTERVAL_MS = 2000

export interface UseEvaluationPollingResult {
  evaluation: EvaluationRecord | undefined
  isLoading: boolean
  isPolling: boolean
  error: string | null
}

export function useEvaluationPolling(
  evaluationId: string | undefined,
): UseEvaluationPollingResult {
  const { user } = useSession()
  const query = useQuery<EvaluationRecord, Error>({
    queryKey: ['evaluation', evaluationId, user?.id],
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
