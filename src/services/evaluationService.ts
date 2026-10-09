import type { EvaluationQueueResponse, EvaluationRecord, EvaluationRequest } from '../types'
import { api, handleError } from './api'

export async function createEvaluation({
  type,
  payload,
}: EvaluationRequest): Promise<EvaluationQueueResponse> {
  try {
    const { data } = await api.post<EvaluationQueueResponse>(
      `/api/evaluations/${type}`,
      payload,
    )
    return data
  } catch (err) {
    handleError(err)
  }
}

export async function getEvaluation(id: string): Promise<EvaluationRecord> {
  try {
    const { data } = await api.get<EvaluationRecord>(`/api/evaluations/${id}`)
    return data
  } catch (err) {
    handleError(err)
  }
}
