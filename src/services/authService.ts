import type { AuthResponse, Credentials } from '../types'
import { api, handleError } from './api'

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
