import type { ILoadTestOptions, SavedApi, SavedApiDefaults } from '../types'

export function findSavedApisBySpec(
  apis: SavedApi[] | null | undefined,
  openApiUrl: string,
): SavedApi[] {
  return apis?.filter((api) => api.openApiUrl === openApiUrl.trim()) ?? []
}

export function pickSavedApi(matches: SavedApi[], apiBaseUrl: string | null): SavedApi | null {
  if (matches.length === 1) return matches[0]

  const sameBase = matches.filter((api) => (api.apiBaseUrl ?? null) === apiBaseUrl)
  return sameBase.length === 1 ? sameBase[0] : null
}

export function toSavedDefaults(settings: {
  rulesConfig?: Record<string, boolean>
  loadTestOptions?: ILoadTestOptions
}): SavedApiDefaults | undefined {
  const defaults: SavedApiDefaults = {}

  if (settings.rulesConfig && Object.keys(settings.rulesConfig).length > 0) {
    defaults.rulesConfig = settings.rulesConfig
  }

  const options: ILoadTestOptions = { ...settings.loadTestOptions }
  delete options.allowMutatingMethods
  if (Object.keys(options).length > 0) defaults.loadTestOptions = options

  return Object.keys(defaults).length > 0 ? defaults : undefined
}

export const NEW_API_BUTTON_ID = 'new-api'

export function editButtonId(id: string): string {
  return `edit-api-${id}`
}
