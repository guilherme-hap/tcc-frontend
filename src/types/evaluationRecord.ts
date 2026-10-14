import type {
  EvaluationStatus,
  EvaluationType,
  ILoadTestOptions,
  IPerformanceTarget,
  PillarName,
  PillarWeights,
  Severity,
} from './evaluation'
import type { IContractResult, ISpectralRule } from './spectral'

export interface IAuditMessage {
  code: string
  severity: Severity
  message: string
  recommendation?: string
  params?: Record<string, string | number>
}

export interface ILatencySummary {
  min: number
  mean: number
  p50: number
  p95: number | null
  p99: number | null
  p99_9: number | null
  max: number
}

export interface IPerformanceSeriesPoint {
  second: number
  responses: number
  meanLatency: number | null
  errors: number
}

export interface IAutocannonResult {
  score: number | null
  targetLatency: number
  satisfied: number
  tolerating: number
  frustrated: number
  sampleSize: number
  excluded4xx: number
  serverErrors: number
  unanswered: number
  errorRate: number
  latency: ILatencySummary | null
  requestsPerSecond: number
  statusCodes: Record<string, number>
  series: IPerformanceSeriesPoint[]
  totalRequests: number
  errors: number
  timeouts: number
  warnings: IAuditMessage[]
}

export interface IPerformanceTargetResult {
  path: string
  method: string
  result: IAutocannonResult | null
  error?: string
  code?: string
}

export type SecurityLayer = 'transport' | 'access' | 'content' | 'leakage'

export type SecurityCheckStatus = 'pass' | 'warning' | 'missing' | 'error'

export interface ISecurityCheckResult extends IAuditMessage {
  layer: SecurityLayer
  header: string
  status: SecurityCheckStatus
}

export type EvaluationStepStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'SKIPPED'
  | 'INTERRUPTED'

export interface IStepProgress {
  targetIndex: number
  totalTargets: number
  phase: 'QUEUED' | 'RUNNING'
  startedAt: string | null
  expectedDurationSeconds: number
  elapsedSeconds: number
  responses: number
  errors: number
  lastSecond: IPerformanceSeriesPoint | null
}

export interface IEvaluationStep {
  pillar: PillarName
  stage: number
  status: EvaluationStepStatus
  startedAt: string | null
  finishedAt: string | null
  error?: string
  code?: string
  progress?: IStepProgress
}

export interface IScoringParameters {
  pillarWeights: PillarWeights
  contract?: {
    severityWeights: Record<Severity, number>
    rules: ISpectralRule[]
  }
  performance?: {
    targetLatency: number
  }
  security?: {
    layerWeights: Record<SecurityLayer, number>
    statusScores: Record<SecurityCheckStatus, number>
  }
}

export interface IScorePart {
  id: string
  weight: number
  score: number
  points: number
  maxPoints: number
}

export type IScoreBreakdown = Partial<Record<PillarName | 'final', IScorePart[]>>

export type EvaluationVisibility = 'private' | 'anonymous'

export interface IEvaluationRequestSettings {
  rulesConfig?: Record<string, boolean>
  loadTestOptions?: Omit<ILoadTestOptions, 'headers' | 'body'>
  severityWeights?: Partial<Record<Severity, number>>
  weights?: PillarWeights
  minScore?: number
}

export interface EvaluationRecord {
  id: string
  openApiUrl: string
  apiBaseUrl: string | null
  targets: IPerformanceTarget[] | null
  requestSettings: IEvaluationRequestSettings | null
  evaluationType: EvaluationType
  visibility: EvaluationVisibility
  status: EvaluationStatus
  spectralResult: IContractResult | null
  performanceResults: IPerformanceTargetResult[] | null
  securityResult: ISecurityCheckResult[] | null
  finalScore: number | null
  passed: boolean | null
  pillarScores: PillarWeights | null
  scoring: IScoringParameters | null
  scoreBreakdown: IScoreBreakdown | null
  steps: IEvaluationStep[] | null
  errorMessage: string | null
  errorCode: string | null
  startedAt: string | null
  finishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface EvaluationProgress {
  id: string
  status: EvaluationStatus
  steps: IEvaluationStep[] | null
  pillarScores: PillarWeights | null
  updatedAt: string
}

export interface EvaluationListItem {
  id: string
  evaluationType: EvaluationType
  status: EvaluationStatus
  finalScore: number | null
  openApiUrl: string
  createdAt: string
}

export interface EvaluationListPage {
  items: EvaluationListItem[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface EvaluationListQuery {
  page?: number
  limit?: number
  search?: string
  type?: EvaluationType
  status?: EvaluationStatus[]
  from?: string
  to?: string
}
