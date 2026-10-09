import type { Severity } from './evaluation'

export interface ISpectralIssue {
  endpoint: string
  method: string
  rule: string | number
  message: string
  severity: Severity
}

export interface ISpectralRule {
  name: string
  severity: Severity
}

export type OasVersion = '2.0' | '3.0' | '3.1'

export interface ISpectralCatalogRule extends ISpectralRule {
  description: string | null
  enabledByDefault: boolean
  oasVersions: OasVersion[]
  documentationUrl: string | null
}

export interface IContractSummary {
  evaluatedRules: number
  violatedRules: number
  occurrencesByRule: Record<string, number>
}

export interface IContractResult {
  issues: ISpectralIssue[]
  summary: IContractSummary
}
