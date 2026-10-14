import type { ISpecOperations } from '../types'
import { api, handleError } from './api'

export async function listSpecOperations(openApiUrl: string): Promise<ISpecOperations> {
  try {
    const { data } = await api.post<ISpecOperations>('/api/specs/operations', { openApiUrl })
    return data
  } catch (err) {
    handleError(err)
  }
}
