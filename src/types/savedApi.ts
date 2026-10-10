import type { ILoadTestOptions } from './evaluation'

export interface SavedApiDefaults {
  rulesConfig?: Record<string, boolean>
  loadTestOptions?: ILoadTestOptions
}

export interface SavedApi {
  id: string
  name: string
  openApiUrl: string
  apiBaseUrl: string | null
  defaultSettings: SavedApiDefaults | null
  createdAt: string
  updatedAt: string
}

export interface SavedApiInput {
  name: string
  openApiUrl: string
  apiBaseUrl?: string
  defaultSettings?: SavedApiDefaults
}

export interface SavedApiUpdate {
  name?: string
  openApiUrl?: string
  apiBaseUrl?: string | null
  defaultSettings?: SavedApiDefaults | null
}
