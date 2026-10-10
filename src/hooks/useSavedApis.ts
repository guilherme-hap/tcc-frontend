import { useQuery } from '@tanstack/react-query'
import { listSavedApis } from '../services'
import type { SavedApi } from '../types'
import { useSession } from './useSession'

export const SAVED_APIS_KEY = 'saved-apis'

export interface UseSavedApisResult {
  apis: SavedApi[] | undefined
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useSavedApis(): UseSavedApisResult {
  const { user } = useSession()
  const query = useQuery<SavedApi[], Error>({
    queryKey: [SAVED_APIS_KEY, user?.id],
    queryFn: listSavedApis,
    enabled: user !== null,
  })

  return {
    apis: query.data,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: () => void query.refetch(),
  }
}
