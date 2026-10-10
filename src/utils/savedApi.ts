import type { ILoadTestOptions, SavedApiDefaults } from '../types'

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
