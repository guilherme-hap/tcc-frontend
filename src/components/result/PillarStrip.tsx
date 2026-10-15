import type { IContractResult, IPerformanceTargetResult, ISecurityCheckResult } from '../../types'
import { groupByRule } from '../../utils/contractRules'
import { formatNumber } from '../../utils/format'
import {
  CHECK_STATUS_LABELS,
  CHECK_STATUS_ORDER,
  LAYER_ORDER,
  SEVERITY_LABELS,
  SEVERITY_ORDER,
} from '../../utils/labels'
import { CHECK_STATUS_BG, SEVERITY_BG } from '../../utils/tones'

interface LegendItem {
  key: string
  tone: string
  label: string
}

function StripLegend({ items }: { items: LegendItem[] }) {
  return (
    <ul aria-hidden="true" className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-secondary">
      {items.map((item) => (
        <li key={item.key} className="inline-flex items-center gap-1.5">
          <span className={`size-2 rounded-xs ${item.tone}`} />
          {item.label}
        </li>
      ))}
    </ul>
  )
}

interface ContractStripProps {
  result: IContractResult
}

export function ContractStrip({ result }: ContractStripProps) {
  const groups = groupByRule(result)
  const { evaluatedRules, violatedRules } = result.summary
  const conforming = Math.max(0, evaluatedRules - violatedRules)
  const severities = SEVERITY_ORDER.filter((severity) =>
    groups.some((group) => group.severity === severity),
  )
  const violated = groups
    .map((group) => `${group.rule} (${SEVERITY_LABELS[group.severity]})`)
    .join(', ')

  return (
    <div className="flex flex-col gap-2">
      <div
        role="img"
        aria-label={`${formatNumber(conforming)} de ${formatNumber(evaluatedRules)} regras sem violação.${violated ? ` Violadas: ${violated}.` : ''}`}
        className="grid grid-cols-[repeat(auto-fill,minmax(0.625rem,1fr))] gap-0.5"
      >
        {groups.map((group) => (
          <span
            key={group.rule}
            title={`${group.rule}: ${SEVERITY_LABELS[group.severity]}`}
            className={`h-3.5 rounded-xs ${SEVERITY_BG[group.severity]}`}
          />
        ))}
        {Array.from({ length: conforming }, (_, index) => (
          <span key={index} className="h-3.5 rounded-xs bg-border-control" />
        ))}
      </div>
      <StripLegend
        items={[
          {
            key: 'conforming',
            tone: 'bg-border-control',
            label: 'sem violação',
          },
          ...severities.map((severity) => ({
            key: severity,
            tone: SEVERITY_BG[severity],
            label: SEVERITY_LABELS[severity].toLowerCase(),
          })),
        ]}
      />
    </div>
  )
}

function describeTarget(target: IPerformanceTargetResult): string {
  const score = target.result?.score
  if (score != null) return formatNumber(score)
  return target.result ? 'não medido' : 'falhou'
}

interface PerformanceStripProps {
  results: IPerformanceTargetResult[]
}

export function PerformanceStrip({ results }: PerformanceStripProps) {
  const summary = results
    .map((target) => `${target.method} ${target.path}: ${describeTarget(target)}`)
    .join('; ')

  const legend: LegendItem[] = [
    {
      key: 'apdex',
      tone: 'bg-pillar-performance',
      label: 'Apdex de cada endpoint',
    },
    ...(results.some((target) => !target.result)
      ? [{ key: 'failed', tone: 'bg-error', label: 'falhou' }]
      : []),
  ]

  return (
    <div className="flex flex-col gap-2">
      <div
        role="img"
        aria-label={`Apdex por endpoint. ${summary}`}
        className="flex h-10 items-stretch gap-0.5"
      >
        {results.map((target, index) => {
          const score = target.result?.score
          const title = `${target.method} ${target.path}: ${describeTarget(target)}`

          if (score == null) {
            return (
              <span
                key={index}
                title={title}
                className={`flex-1 rounded-xs border ${target.result ? 'border-dashed border-border-control' : 'border-error/60 bg-error-dim'}`}
              />
            )
          }

          return (
            <span key={index} title={title} className="flex flex-1 items-end rounded-xs bg-idle">
              <span
                className="min-h-0.5 w-full rounded-xs bg-pillar-performance"
                style={{ height: `${Math.min(100, Math.max(0, score))}%` }}
              />
            </span>
          )
        })}
      </div>
      <StripLegend items={legend} />
    </div>
  )
}

interface SecurityStripProps {
  checks: ISecurityCheckResult[]
}

export function SecurityStrip({ checks }: SecurityStripProps) {
  const ordered = LAYER_ORDER.flatMap((layer) => checks.filter((check) => check.layer === layer))
  const summary = ordered
    .map((check) => `${check.header}: ${CHECK_STATUS_LABELS[check.status]}`)
    .join('; ')

  const legend = CHECK_STATUS_ORDER.filter((status) =>
    ordered.some((check) => check.status === status),
  ).map((status) => ({
    key: status,
    tone: CHECK_STATUS_BG[status],
    label: CHECK_STATUS_LABELS[status].toLowerCase(),
  }))

  return (
    <div className="flex flex-col gap-2">
      <div
        role="img"
        aria-label={`Verificações de segurança. ${summary}`}
        className="flex h-10 gap-0.5"
      >
        {ordered.map((check) => (
          <span
            key={`${check.header}-${check.code}`}
            title={`${check.header}: ${CHECK_STATUS_LABELS[check.status]}`}
            className={`flex-1 rounded-xs ${CHECK_STATUS_BG[check.status]}`}
          />
        ))}
      </div>
      <StripLegend items={legend} />
    </div>
  )
}
