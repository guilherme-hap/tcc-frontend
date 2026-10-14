import { useQuery } from '@tanstack/react-query'
import { listSpecOperations } from '../services'
import type { ISpecOperations } from '../types'

const STALE_TIME_MS = 5 * 60_000

export interface UseSpecOperationsResult {
  spec: ISpecOperations | undefined
  isFetching: boolean
  error: string | null
  refetch: () => void
}

export function useSpecOperations(openApiUrl: string | null): UseSpecOperationsResult {
  const query = useQuery<ISpecOperations, Error>({
    queryKey: ['spec-operations', openApiUrl],
    queryFn: () => listSpecOperations(openApiUrl!),
    enabled: openApiUrl !== null,
    staleTime: STALE_TIME_MS,
    retry: false,
  })

  return {
    spec: openApiUrl === null ? undefined : query.data,
    isFetching: query.isFetching,
    error: openApiUrl === null ? null : (query.error?.message ?? null),
    refetch: () => void query.refetch(),
  }
}
