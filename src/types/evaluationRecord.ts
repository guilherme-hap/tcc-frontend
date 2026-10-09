import type {
  EvaluationStatus,
  EvaluationType,
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

export interface EvaluationRecord {
  id: string
  userId: string | null
  openApiUrl: string
  apiBaseUrl: string | null
  targets: IPerformanceTarget[] | null
  evaluationType: EvaluationType
  status: EvaluationStatus
  spectralResult: IContractResult | null
  performanceResults: IPerformanceTargetResult[] | null
  securityResult: ISecurityCheckResult[] | null
  finalScore: number | null
  pillarScores: PillarWeights | null
  scoring: IScoringParameters | null
  failedPillars: IFailedPillar[] | null
  errorMessage: string | null
  errorCode: string | null
  createdAt: string
  updatedAt: string
}
