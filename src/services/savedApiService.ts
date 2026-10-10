import type { SavedApi, SavedApiInput, SavedApiUpdate } from '../types'
import { api, handleError } from './api'

const BASE_PATH = '/api/user/apis'

export async function listSavedApis(): Promise<SavedApi[]> {
  try {
    const { data } = await api.get<SavedApi[]>(BASE_PATH)
    return data
  } catch (err) {
    handleError(err)
  }
}

export async function createSavedApi(input: SavedApiInput): Promise<SavedApi> {
  try {
    const { data } = await api.post<SavedApi>(BASE_PATH, input)
    return data
  } catch (err) {
    handleError(err)
  }
}

export async function updateSavedApi({
  id,
  changes,
}: {
  id: string
  changes: SavedApiUpdate
}): Promise<SavedApi> {
  try {
    const { data } = await api.put<SavedApi>(`${BASE_PATH}/${id}`, changes)
    return data
  } catch (err) {
    handleError(err)
  }
}

export async function deleteSavedApi(id: string): Promise<void> {
  try {
    await api.delete(`${BASE_PATH}/${id}`)
  } catch (err) {
    handleError(err)
  }
}
