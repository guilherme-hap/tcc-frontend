import { useQuery } from '@tanstack/react-query'
import { getEvaluation } from '../services'
import type { EvaluationRecord } from '../types'
import { isStatusActive } from '../utils/status'
import { useSession } from './useSession'

const POLLING_INTERVAL_MS = 2000

export interface UseEvaluationPollingResult {
  evaluation: EvaluationRecord | undefined
  isLoading: boolean
  isPaused: boolean
  isPolling: boolean
  isFetching: boolean
  error: string | null
  refetch: () => void
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
      const { data, status } = queryState.state
      if (!data) return status === 'error' ? false : POLLING_INTERVAL_MS

      return isStatusActive(data.status) ? POLLING_INTERVAL_MS : false
    },
  })

  const currentStatus = query.data?.status
  const isPolling = !!currentStatus && isStatusActive(currentStatus)

  return {
    evaluation: query.data,
    isLoading: query.isPending,
    isPaused: query.isPaused,
    isPolling,
    isFetching: query.isFetching,
    error: query.error?.message ?? null,
    refetch: () => void query.refetch(),
  }
}
