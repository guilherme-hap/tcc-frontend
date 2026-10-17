import { useState } from 'react'
import { ChevronRight, ExternalLink } from 'lucide-react'
import { useSpectralRules } from '../../hooks'
import type { IContractResult, ISpectralCatalogRule } from '../../types'
import { groupByRule, type RuleGroup } from '../../utils/contractRules'
import { formatNumber } from '../../utils/format'
import { SEVERITY_LABELS, SEVERITY_ORDER } from '../../utils/labels'
import { Badge } from '../ui/Badge'
import { Icon } from '../ui/Icon'
import { Panel } from '../ui/Panel'
import { SeverityBadge } from '../ui/SeverityBadge'
import { FOCUS_RING } from '../ui/classes'
import {
  SeverityFilter,
  type SeverityFilterOption,
  type SeverityFilterValue,
} from './SeverityFilter'

const MAX_VISIBLE_OCCURRENCES = 50

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
  catalog: ISpectralCatalogRule | undefined
}

function RuleRow({ group, maxCount, catalog }: RuleRowProps) {
  const visible = group.issues.slice(0, MAX_VISIBLE_OCCURRENCES)
  const hidden = group.issues.length - visible.length

  return (
    <li>
      <details className="group/rule">
        <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-2 rounded-md px-3 py-3 transition-colors duration-150 hover:bg-surface-raised focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus [&::-webkit-details-marker]:hidden">
          <Icon
            icon={ChevronRight}
            className="text-ink-secondary transition-transform duration-150 group-open/rule:rotate-90"
          />
          <span className="font-mono text-sm font-medium break-all text-ink">{group.rule}</span>
          <SeverityBadge severity={group.severity} />
          <span className="ml-auto flex items-center gap-3">
            <span
              aria-hidden="true"
              className="hidden h-1.5 w-32 overflow-hidden rounded-full bg-surface-raised sm:block"
            >
              <span
                className="block h-full min-w-0.5 rounded-full bg-measure"
                style={{ width: `${(group.count / maxCount) * 100}%` }}
              />
            </span>
            <span className="w-28 text-right font-mono text-sm font-medium text-ink tabular-nums">
              {formatNumber(group.count)}{' '}
              <span className="font-body font-normal text-ink-secondary">
                {group.count === 1 ? 'ocorrência' : 'ocorrências'}
              </span>
            </span>
          </span>
        </summary>
        <div className="flex flex-col gap-3 px-3 pb-4 pl-10">
          {catalog && (catalog.description || catalog.documentationUrl) ? (
            <div className="flex flex-col gap-1 text-sm">
              {catalog.description ? (
                <p className="text-ink-secondary">
                  <span className="text-ink-muted">Regra do Spectral (em inglês): </span>
                  <span lang="en">{catalog.description}</span>
                </p>
              ) : null}
              {catalog.documentationUrl ? (
                <a
                  href={catalog.documentationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex items-center gap-1 self-start rounded-sm text-accent-ink underline underline-offset-2 max-lg:-my-3 max-lg:py-3 ${FOCUS_RING}`}
                >
                  Documentação da regra
                  <Icon icon={ExternalLink} size={12} />
                  <span className="sr-only"> (abre em nova aba)</span>
                </a>
              ) : null}
            </div>
          ) : null}
          <ul className="flex flex-col gap-3">
            {visible.map((issue, index) => (
              <li key={index} className="flex flex-col gap-1 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  {issue.method !== 'N/A' ? <Badge mono>{issue.method}</Badge> : null}
                  <span className="font-mono break-all text-ink-secondary">
                    {issue.endpoint === 'global' ? 'Documento' : issue.endpoint}
                  </span>
                </div>
                {issue.message.trim() === catalog?.description?.trim() ? null : (
                  <p className="text-ink">{issue.message}</p>
                )}
              </li>
            ))}
            {hidden > 0 ? (
              <li className="text-sm text-ink-secondary">
                E mais {formatNumber(hidden)} ocorrências desta regra.
              </li>
            ) : null}
          </ul>
        </div>
      </details>
    </li>
  )
}

interface ContractSectionProps {
  result: IContractResult
}

export function ContractSection({ result }: ContractSectionProps) {
  const { evaluatedRules, violatedRules } = result.summary
  const [filter, setFilter] = useState<SeverityFilterValue>('all')
  const { rules } = useSpectralRules()
  const groups = groupByRule(result)
  const maxCount = Math.max(1, ...groups.map((group) => group.count))
  const options = buildFilterOptions(groups)
  const active = options.some((option) => option.value === filter) ? filter : 'all'
  const visible = active === 'all' ? groups : groups.filter((group) => group.severity === active)

  return (
    <Panel
      title="Regras violadas"
      className="section-large"
      description={`${formatNumber(violatedRules)} de ${formatNumber(evaluatedRules)} regras aplicáveis violadas. Cada regra conta uma vez na nota, independentemente do número de ocorrências.`}
    >
      {groups.length === 0 ? (
        <p className="text-ink-secondary">Nenhuma regra violada.</p>
      ) : (
        <div className="@container flex flex-col gap-4">
          {options.length > 2 ? (
            <SeverityFilter options={options} value={active} onChange={setFilter} />
          ) : null}
          <ul className="flex flex-col divide-y divide-border">
            {visible.map((group) => (
              <RuleRow
                key={group.rule}
                group={group}
                maxCount={maxCount}
                catalog={rules?.find((rule) => rule.name === group.rule)}
              />
            ))}
          </ul>
        </div>
      )}
    </Panel>
  )
}
