import type { EvaluationType } from '../types'

export const HOME_PATH = '/'
const EVALUATIONS_PATH = '/avaliacoes'
export const NEW_EVALUATION_PATH = `${EVALUATIONS_PATH}/nova`
export const EVALUATION_PATH_PATTERN = `${EVALUATIONS_PATH}/:id`
export const HISTORY_PATH = '/historico'
export const SAVED_APIS_PATH = '/apis'
export const LOGIN_PATH = '/entrar'
export const REGISTER_PATH = '/criar-conta'
export const LOGOUT_PATH = '/sair'
export const TYPE_PARAM = 'tipo'
export const SAVED_API_PARAM = 'api'
export const SECTION_PARAM = 'secao'

export interface AuthRedirectState {
  from?: string
}

export interface RestoreDraftState {
  restoreDraft?: boolean
  reevaluated?: boolean
}

export const RESTORE_DRAFT_STATE: RestoreDraftState = { restoreDraft: true }
export const REEVALUATE_STATE: RestoreDraftState = { restoreDraft: true, reevaluated: true }

export interface ResultLocationState {
  apiSaveFailed?: boolean
}

export function newEvaluationPath(type: EvaluationType): string {
  return `${NEW_EVALUATION_PATH}?${TYPE_PARAM}=${type}`
}

export function savedApiEvaluationPath(savedApiId: string): string {
  return `${NEW_EVALUATION_PATH}?${SAVED_API_PARAM}=${savedApiId}`
}

export function evaluationPath(id: string): string {
  return `${EVALUATIONS_PATH}/${id}`
}
