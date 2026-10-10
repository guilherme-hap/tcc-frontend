import type { EvaluationStatus } from '../types'

const ACTIVE_STATUSES: EvaluationStatus[] = ['PENDING', 'RUNNING']

export function isStatusActive(status: EvaluationStatus): boolean {
  return ACTIVE_STATUSES.includes(status)
}
