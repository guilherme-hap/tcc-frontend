import type { AuthResponse, Credentials } from '../types'
import { api, handleError } from './api'
import { endSession, getSessionState } from './session'

export async function login(credentials: Credentials): Promise<AuthResponse> {
  try {
    const { data } = await api.post<AuthResponse>('/api/auth/login', credentials)
    return data
  } catch (err) {
    handleError(err)
  }
}

export async function register(credentials: Credentials): Promise<AuthResponse> {
  try {
    const { data } = await api.post<AuthResponse>('/api/auth/register', credentials)
    return data
  } catch (err) {
    handleError(err)
  }
}

export function logout(): void {
  const token = getSessionState().session?.token
  endSession()
  if (!token) return

  void api
    .post('/api/auth/logout', null, { headers: { Authorization: `Bearer ${token}` } })
    .catch(() => undefined)
}
