import { useQuery } from '@tanstack/react-query'
import { listCustomRules } from '../services'
import type { CustomRule } from '../types'
import { useSession } from './useSession'

export const CUSTOM_RULES_KEY = 'custom-rules'

export interface UseCustomRulesResult {
  ruleSets: CustomRule[] | undefined
  isLoading: boolean
  error: string | null
}

export function useCustomRules(): UseCustomRulesResult {
  const { user } = useSession()
  const query = useQuery<CustomRule[], Error>({
    queryKey: [CUSTOM_RULES_KEY, user?.id],
    queryFn: listCustomRules,
    enabled: user !== null,
  })

  return {
    ruleSets: query.data,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
  }
}
