import type { Severity } from './evaluation'

export type SeverityWeights = Partial<Record<Severity, number>>

export interface CustomRule {
  id: string
  name: string
  rulesConfig: Record<string, boolean>
  severityWeights: SeverityWeights | null
  createdAt: string
  updatedAt: string
}

export interface CustomRuleInput {
  name: string
  rulesConfig: Record<string, boolean>
  severityWeights: SeverityWeights | null
}

export type CustomRuleUpdate = Partial<CustomRuleInput>
