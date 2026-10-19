import { useQuery } from '@tanstack/react-query'
import { listEvaluations } from '../services'
import type { EvaluationListItem, EvaluationListPage, EvaluationType } from '../types'
import { toHistoryQuery, type HistoryFilters } from '../components/history/useHistoryFilters'
import { EVALUATION_HISTORY_KEY } from './useEvaluationHistory'
import { useSession } from './useSession'

export const TREND_LIMIT = 100

export interface UseScoreTrendResult {
  items: EvaluationListItem[]
  total: number
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useScoreTrend(filters: HistoryFilters, type: EvaluationType | null): UseScoreTrendResult {
  const { user } = useSession()
  const query = {
    ...toHistoryQuery({ ...filters, type, status: null }, 1),
    limit: TREND_LIMIT,
    status: ['COMPLETED' as const],
  }
  const result = useQuery<EvaluationListPage, Error>({
    queryKey: [EVALUATION_HISTORY_KEY, user?.id, 'trend', query],
    queryFn: () => listEvaluations(query),
    enabled: user !== null && type !== null,
  })

  return {
    items: result.data
      ? result.data.items.filter((item) => item.finalScore !== null).reverse()
      : [],
    total: result.data?.total ?? 0,
    isLoading: result.isLoading,
    error: result.error?.message ?? null,
    refetch: () => void result.refetch(),
  }
}
