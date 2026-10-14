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
  averageLatency: number
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

export interface IFailedPillar {
  pillar: PillarName
  error: string
  code: string
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
  failedPillars: IFailedPillar[] | null
  errorMessage: string | null
  errorCode: string | null
  createdAt: string
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
