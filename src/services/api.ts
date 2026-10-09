import axios, { AxiosError } from 'axios'
import type { ApiErrorBody } from '../types'
import { ApiError } from './apiError'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

export function handleError(err: unknown): never {
  if (err instanceof AxiosError) {
    if (!err.response) {
      throw new ApiError('Não foi possível conectar ao servidor do auditor.')
    }
    const data = err.response.data as Partial<ApiErrorBody> | undefined
    throw new ApiError(data?.error ?? err.message, data?.code ?? null, data?.issues ?? [])
  }
  throw err
}
