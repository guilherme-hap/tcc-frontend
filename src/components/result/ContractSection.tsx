import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import type { IContractResult, ISpectralIssue, Severity } from '../../types'
import { formatNumber } from '../../utils/format'
import { SEVERITY_LABELS, SEVERITY_ORDER } from '../../utils/labels'
import { Badge } from '../ui/Badge'
import { Icon } from '../ui/Icon'
import { Panel } from '../ui/Panel'
import { PillarScore } from './PillarScore'
import { SeverityBadge } from '../ui/SeverityBadge'
import {
  SeverityFilter,
  type SeverityFilterOption,
  type SeverityFilterValue,
} from './SeverityFilter'

const MAX_VISIBLE_OCCURRENCES = 50

interface RuleGroup {
  rule: string
  severity: Severity
  count: number
  issues: ISpectralIssue[]
}

function severityRank(severity: Severity): number {
  return SEVERITY_ORDER.indexOf(severity)
}

function groupByRule(result: IContractResult): RuleGroup[] {
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

function buildFilterOptions(groups: RuleGroup[]): SeverityFilterOption[] {
  const bySeverity = SEVERITY_ORDER.map((severity) => ({
    value: severity,
    label: SEVERITY_LABELS[severity],
    count: groups.filter((group) => group.severity === severity).length,
  })).filter((option) => option.count > 0)

  return [{ value: 'all', label: 'Todas', count: groups.length }, ...bySeverity]
}

interface RuleRowProps {
  group: RuleGroup
  maxCount: number
}

function RuleRow({ group, maxCount }: RuleRowProps) {
  const visible = group.issues.slice(0, MAX_VISIBLE_OCCURRENCES)
  const hidden = group.issues.length - visible.length

  return (
    <li>
      <details className="group/rule rounded-md border border-border bg-well">
        <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-2 rounded-md px-4 py-3 transition-colors duration-150 hover:bg-glass focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus [&::-webkit-details-marker]:hidden">
          <Icon
            icon={ChevronRight}
            className="text-ink-secondary transition-transform duration-150 group-open/rule:rotate-90"
          />
          <span className="font-mono text-[13px] font-medium break-all text-ink">{group.rule}</span>
          <SeverityBadge severity={group.severity} />
          <span className="ml-auto flex items-center gap-3">
            <span
              aria-hidden="true"
              className="hidden h-1.5 w-32 overflow-hidden rounded-full bg-glass-raised sm:block"
            >
              <span
                className="block h-full min-w-0.5 rounded-full bg-data-cyan"
                style={{ width: `${(group.count / maxCount) * 100}%` }}
              />
            </span>
            <span className="w-28 text-right font-mono text-[13px] font-medium text-ink tabular-nums">
              {formatNumber(group.count)}{' '}
              <span className="font-body font-normal text-ink-secondary">
                {group.count === 1 ? 'ocorrência' : 'ocorrências'}
              </span>
            </span>
          </span>
        </summary>
        <ul className="flex flex-col gap-3 border-t border-border px-4 py-3">
          {visible.map((issue, index) => (
            <li key={index} className="flex flex-col gap-1 text-[13px]">
              <div className="flex flex-wrap items-center gap-2">
                {issue.method !== 'N/A' ? <Badge mono>{issue.method}</Badge> : null}
                <span className="font-mono break-all text-ink-secondary">
                  {issue.endpoint === 'global' ? 'Documento' : issue.endpoint}
                </span>
              </div>
              <p className="text-ink">{issue.message}</p>
            </li>
          ))}
          {hidden > 0 ? (
            <li className="text-[13px] text-ink-secondary">
              E mais {formatNumber(hidden)} ocorrências desta regra.
            </li>
          ) : null}
        </ul>
      </details>
    </li>
  )
}

interface ContractSectionProps {
  result: IContractResult
  score?: number
}

export function ContractSection({ result, score }: ContractSectionProps) {
  const { evaluatedRules, violatedRules } = result.summary
  const [filter, setFilter] = useState<SeverityFilterValue>('all')
  const groups = groupByRule(result)
  const maxCount = Math.max(1, ...groups.map((group) => group.count))
  const options = buildFilterOptions(groups)
  const active = options.some((option) => option.value === filter) ? filter : 'all'
  const visible = active === 'all' ? groups : groups.filter((group) => group.severity === active)

  return (
    <Panel
      title="Contrato"
      description={`${formatNumber(violatedRules)} de ${formatNumber(evaluatedRules)} regras aplicáveis violadas. Cada regra conta uma vez na nota, independentemente do número de ocorrências.`}
      aside={<PillarScore score={score} />}
    >
      {groups.length === 0 ? (
        <p className="text-ink-secondary">Nenhuma regra violada.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {options.length > 2 ? (
            <SeverityFilter options={options} value={active} onChange={setFilter} />
          ) : null}
          <ul className="flex flex-col gap-2">
            {visible.map((group) => (
              <RuleRow key={group.rule} group={group} maxCount={maxCount} />
            ))}
          </ul>
        </div>
      )}
    </Panel>
  )
}
