import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { listEvaluations } from '../services'
import type { EvaluationListPage, EvaluationListQuery } from '../types'
import { isStatusActive } from '../utils/status'
import { useSession } from './useSession'

export const EVALUATION_HISTORY_KEY = 'evaluation-history'

const REFRESH_INTERVAL_MS = 5000

export interface UseEvaluationHistoryResult {
  history: EvaluationListPage | undefined
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
  refetch: () => void
}

export function useEvaluationHistory(query: EvaluationListQuery): UseEvaluationHistoryResult {
  const { user } = useSession()
  const result = useQuery<EvaluationListPage, Error>({
    queryKey: [EVALUATION_HISTORY_KEY, user?.id, query],
    queryFn: () => listEvaluations(query),
    enabled: user !== null,
    placeholderData: keepPreviousData,
    refetchIntervalInBackground: false,
    refetchInterval: (queryState) =>
      queryState.state.data?.items.some((item) => isStatusActive(item.status))
        ? REFRESH_INTERVAL_MS
        : false,
  })

  return {
    history: result.data,
    isLoading: result.isLoading,
    isRefreshing: result.isPlaceholderData,
    error: result.error?.message ?? null,
    refetch: () => void result.refetch(),
  }
}
