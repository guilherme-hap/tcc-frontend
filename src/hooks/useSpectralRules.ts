import { useQuery } from '@tanstack/react-query'
import { getSpectralRules } from '../services'
import type { ISpectralCatalogRule } from '../types'

export interface UseSpectralRulesResult {
  rules: ISpectralCatalogRule[] | undefined
  isLoading: boolean
  error: string | null
}

export function useSpectralRules(): UseSpectralRulesResult {
  const query = useQuery<ISpectralCatalogRule[], Error>({
    queryKey: ['spectral-rules'],
    queryFn: getSpectralRules,
    staleTime: Infinity,
  })

  return {
    rules: query.data,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
  }
}
