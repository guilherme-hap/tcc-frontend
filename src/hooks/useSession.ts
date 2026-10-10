import { useSyncExternalStore } from 'react'
import { getSessionState, subscribeToSession } from '../services'
import type { AuthUser } from '../types'

export interface UseSessionResult {
  user: AuthUser | null
  expired: boolean
}

export function useSession(): UseSessionResult {
  const { session, expired } = useSyncExternalStore(subscribeToSession, getSessionState)

  return { user: session?.user ?? null, expired }
}
