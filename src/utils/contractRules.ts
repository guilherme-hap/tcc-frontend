import type { IContractResult, ISpectralIssue, Severity } from '../types'
import { SEVERITY_ORDER } from './labels'

export interface RuleGroup {
  rule: string
  severity: Severity
  count: number
  issues: ISpectralIssue[]
}

const MAX_ALLOWED_VALUES = 8
const ALLOWED_VALUES = /^(.*allowed values: )(.+?)((?:\. Did you mean "[^"]*"\?)?\.?)$/
const LISTED_VALUE = /"(?:[^"\\]|\\.)*"|[^,\s][^,]*/g

export function validatorMessage(message: string): string {
  const text = message.replace(/\?\.$/, '?')
  const match = ALLOWED_VALUES.exec(text)
  if (!match) return text

  const [, head, list, tail] = match
  const values = list.match(LISTED_VALUE) ?? []
  if (values.length <= MAX_ALLOWED_VALUES) return text

  const hidden = values.length - MAX_ALLOWED_VALUES
  return `${head}${values.slice(0, MAX_ALLOWED_VALUES).join(', ')}, … (+${hidden})${tail}`
}

export function severityRank(severity: Severity): number {
  return SEVERITY_ORDER.indexOf(severity)
}

export function groupByRule(result: IContractResult): RuleGroup[] {
  const groups = new Map<string, RuleGroup>()

  for (const issue of result.issues) {
    const rule = String(issue.rule)
    const group = groups.get(rule) ?? { rule, severity: issue.severity, count: 0, issues: [] }
    if (severityRank(issue.severity) < severityRank(group.severity)) {
      group.severity = issue.severity
    }
    group.issues.push(issue)
    groups.set(rule, group)
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      count: result.summary.occurrencesByRule[group.rule] ?? group.issues.length,
    }))
    .sort(
      (a, b) => severityRank(a.severity) - severityRank(b.severity) || b.count - a.count,
    )
}

export interface EndpointGroup {
  method: string | null
  endpoint: string | null
  count: number
}

const NO_METHOD = 'N/A'
const NO_ENDPOINT = 'global'

export function groupByEndpoint(result: IContractResult): EndpointGroup[] {
  const groups = new Map<string, EndpointGroup>()

  for (const issue of result.issues) {
    const key = `${issue.method} ${issue.endpoint}`
    const group = groups.get(key) ?? {
      method: issue.method === NO_METHOD ? null : issue.method,
      endpoint: issue.endpoint === NO_ENDPOINT ? null : issue.endpoint,
      count: 0,
    }
    group.count += 1
    groups.set(key, group)
  }

  return [...groups.values()].sort((a, b) => b.count - a.count)
}
