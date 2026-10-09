import type { EvaluationType } from '../types'

export const HOME_PATH = '/'
export const NEW_EVALUATION_PATH = '/avaliacoes/nova'
export const EVALUATION_PATH_PATTERN = '/avaliacoes/:id'
export const TYPE_PARAM = 'tipo'

export function newEvaluationPath(type: EvaluationType): string {
  return `${NEW_EVALUATION_PATH}?${TYPE_PARAM}=${type}`
}

export function evaluationPath(id: string): string {
  return `/avaliacoes/${id}`
}
