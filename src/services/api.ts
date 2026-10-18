import axios, { AxiosError } from 'axios'
import type { ApiErrorBody } from '../types'
import { ApiError } from './apiError'
import { expireSession, getSessionState } from './session'

const INVALID_TOKEN_CODE = 'AUTH_INVALID_TOKEN'
const AUTHORIZATION = 'Authorization'

const ERROR_MESSAGES: Record<string, string> = {
  [INVALID_TOKEN_CODE]: 'A sessão expirou. Entre de novo para continuar.',
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

function bearer(token: string): string {
  return `Bearer ${token}`
}

api.interceptors.request.use((config) => {
  const token = getSessionState().session?.token
  if (token) config.headers.set(AUTHORIZATION, bearer(token))
  return config
})

api.interceptors.response.use(undefined, async (error: unknown) => {
  if (!(error instanceof AxiosError) || !error.config || error.response?.status !== 401) {
    throw error
  }

  const { config } = error
  const body = error.response.data as Partial<ApiErrorBody> | undefined
  const sent = config.headers.get(AUTHORIZATION)
  if (body?.code !== INVALID_TOKEN_CODE || typeof sent !== 'string') throw error

  const current = getSessionState().session?.token
  if (current && sent === bearer(current)) expireSession()

  if (config.method?.toLowerCase() !== 'get') throw error

  config.headers.delete(AUTHORIZATION)
  return api.request(config)
})

export function handleError(err: unknown): never {
  if (err instanceof AxiosError) {
    if (!err.response) {
      throw new ApiError('Não foi possível conectar ao servidor do Specping.')
    }
    const data = err.response.data as Partial<ApiErrorBody> | undefined
    const code = data?.code ?? null
    const message = (code ? ERROR_MESSAGES[code] : undefined) ?? data?.error ?? err.message
    throw new ApiError(message, code, data?.issues ?? [])
  }
  throw err
}
