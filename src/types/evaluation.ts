export type EvaluationType = 'contract' | 'performance' | 'security' | 'full'

export type EvaluationStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'PARTIAL' | 'FAILED'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export type Severity = 'Error' | 'Warning' | 'Info' | 'Hint' | 'Unknown'

export type PillarName = 'contract' | 'performance' | 'security'

export type PillarWeights = Partial<Record<PillarName, number>>

export interface ILoadTestOptions {
  duration?: number
  connections?: number
  targetLatency?: number
  maxRequests?: number
  requestsPerSecond?: number
  method?: HttpMethod
  headers?: Record<string, string>
  body?: string
  allowMutatingMethods?: boolean
  allowHighLoad?: boolean
}

export interface IPerformanceTarget {
  path: string
  method?: HttpMethod
  payload?: unknown
}

export interface IContractRequest {
  openApiUrl: string
  rulesConfig?: Record<string, boolean>
  severityWeights?: Partial<Record<Severity, number>>
}

export interface ISecurityRequest {
  openApiUrl: string
  apiBaseUrl?: string
}

export interface IPerformanceRequest {
  openApiUrl: string
  apiBaseUrl?: string
  targets: IPerformanceTarget[]
  loadTestOptions?: ILoadTestOptions
}

export interface IFullEvaluationRequest extends IPerformanceRequest {
  rulesConfig?: Record<string, boolean>
  severityWeights?: Partial<Record<Severity, number>>
  weights?: PillarWeights
}

export interface EvaluationRequestMap {
  contract: IContractRequest
  performance: IPerformanceRequest
  security: ISecurityRequest
  full: IFullEvaluationRequest
}

export type EvaluationRequest = {
  [T in EvaluationType]: { type: T; payload: EvaluationRequestMap[T] }
}[EvaluationType]

export interface EvaluationQueueResponse {
  evaluationId: string
  status: EvaluationStatus
}
