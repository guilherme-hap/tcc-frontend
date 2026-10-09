import type { ISpectralCatalogRule } from '../types'
import { api, handleError } from './api'

export async function getSpectralRules(): Promise<ISpectralCatalogRule[]> {
  try {
    const { data } = await api.get<ISpectralCatalogRule[]>('/api/rules')
    return data
  } catch (err) {
    handleError(err)
  }
}
