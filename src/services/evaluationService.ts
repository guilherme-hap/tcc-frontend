import axios, { AxiosError } from 'axios'
import type {
  IContractRequest,
  IPerformanceRequest,
  IFullEvaluationRequest,
  EvaluationQueueResponse,
  EvaluationRecord,
} from '../types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

interface ApiErrorBody {
  error: string
}

function handleError(err: unknown): never {
  if (err instanceof AxiosError) {
    const data = err.response?.data as ApiErrorBody | undefined
    throw new Error(data?.error ?? err.message)
  }
  throw err
}

export async function postContractEvaluation(
  payload: IContractRequest,
): Promise<EvaluationQueueResponse> {
  try {
    const { data } = await api.post<EvaluationQueueResponse>(
      '/api/evaluate/contract',
      payload,
    )
    return data
  } catch (err) {
    handleError(err)
  }
}

export async function postPerformanceEvaluation(
  payload: IPerformanceRequest,
): Promise<EvaluationQueueResponse> {
  try {
    const { data } = await api.post<EvaluationQueueResponse>(
      '/api/evaluate/performance',
      payload,
    )
    return data
  } catch (err) {
    handleError(err)
  }
}

export async function postFullEvaluation(
  payload: IFullEvaluationRequest,
): Promise<EvaluationQueueResponse> {
  try {
    const { data } = await api.post<EvaluationQueueResponse>(
      '/api/evaluate/full',
      payload,
    )
    return data
  } catch (err) {
    handleError(err)
  }
}

export async function getEvaluation(id: string): Promise<EvaluationRecord> {
  try {
    const { data } = await api.get<EvaluationRecord>(
      `/api/evaluate/${id}`,
    )
    return data
  } catch (err) {
    handleError(err)
  }
}
