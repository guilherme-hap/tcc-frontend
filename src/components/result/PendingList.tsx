import { Fragment, type ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import type { EvaluationRecord, PillarName, SecurityCheckStatus } from '../../types'
import { groupByRule, severityRank } from '../../utils/contractRules'
import { formatCount } from '../../utils/format'
import { LAYER_SHORT_LABELS } from '../../utils/labels'
import { Icon } from '../ui/Icon'
import { Badge } from '../ui/Badge'
import { SeverityBadge } from '../ui/SeverityBadge'
import { CARD, FOCUS_RING, OVERLINE } from '../ui/classes'
import { CheckStatusBadge } from './CheckStatusBadge'

const MAX_VISIBLE = 6

function BreakableName({ name }: { name: string }) {
  const parts = name.split('/')

  return parts.map((part, index) => (
    <Fragment key={index}>
      {index > 0 ? <>/<wbr /></> : null}
      {part}
    </Fragment>
  ))
}
const ALL_PILLARS: PillarName[] = ['contract', 'security', 'performance']

const CHECK_RANK: Record<SecurityCheckStatus, number> = {
  error: 0,
  missing: 0,
  warning: 1,
  pass: 2,
}

const OPEN_LABELS: Partial<Record<PillarName, string>> = {
  contract: 'Abrir contrato',
  security: 'Abrir segurança',
}

interface PendingItem {
  key: string
  rank: number
  badge: ReactNode
  name: string
  detail: string
}

function buildItems(
  { spectralResult, securityResult, performanceResults }: EvaluationRecord,
  pillars: PillarName[],
): PendingItem[] {
  const rules =
    spectralResult && pillars.includes('contract')
      ? groupByRule(spectralResult).map((group): PendingItem => ({
          key: `rule-${group.rule}`,
          rank: severityRank(group.severity),
          badge: <SeverityBadge severity={group.severity} />,
          name: group.rule,
          detail: formatCount(group.count, 'ocorrência', 'ocorrências'),
        }))
      : []
  const checks = (pillars.includes('security') ? (securityResult ?? []) : [])
    .filter((check) => check.status !== 'pass')
    .map((check): PendingItem => ({
      key: `check-${check.header}-${check.code}`,
      rank: CHECK_RANK[check.status],
      badge: <CheckStatusBadge status={check.status} />,
      name: check.header,
      detail: LAYER_SHORT_LABELS[check.layer],
    }))

  const loadTests = (pillars.includes('performance') ? (performanceResults ?? []) : []).flatMap(
    (target, index): PendingItem[] => {
      const name = `${target.method} ${target.path}`
      const key = `target-${index}`

      if (!target.result) {
        return [
          {
            key,
            rank: -1,
            badge: <Badge tone="error">Falhou</Badge>,
            name,
            detail: 'teste de carga',
          },
        ]
      }
      if (target.result.serverErrors > 0) {
        return [
          {
            key,
            rank: -1,
            badge: <Badge tone="error">5xx</Badge>,
            name,
            detail: formatCount(target.result.serverErrors, 'resposta', 'respostas'),
          },
        ]
      }
      if (target.result.score === null) {
        return [
          {
            key,
            rank: 1,
            badge: <Badge tone="warning">Sem amostra</Badge>,
            name,
            detail: 'teste de carga',
          },
        ]
      }
      return []
    },
  )

  return [...rules, ...checks, ...loadTests].sort((a, b) => a.rank - b.rank)
}

function describe(pillars: PillarName[]): { title: string; empty: string } {
  if (pillars.length > 1) {
    return {
      title: 'Pendências',
      empty: 'Nenhuma regra violada, verificação pendente ou problema no teste de carga.',
    }
  }
  return pillars[0] === 'contract'
    ? { title: 'Regras violadas', empty: 'Nenhuma regra violada.' }
    : { title: 'Camadas e verificações pendentes', empty: 'Nenhuma verificação pendente.' }
}

interface PendingListProps {
  evaluation: EvaluationRecord
  pillars?: PillarName[]
  onOpen: (pillar: PillarName) => void
  className?: string
  children?: ReactNode
}

export function PendingList({
  evaluation,
  pillars = ALL_PILLARS,
  onOpen,
  className = '',
  children,
}: PendingListProps) {
  const items = buildItems(evaluation, pillars)
  const visible = items.slice(0, MAX_VISIBLE)
  const hidden = items.length - visible.length
  const { title, empty } = describe(pillars)

  return (
    <section className={`@container flex min-w-0 flex-col gap-3 border-border p-4 ${CARD} ${className}`}>
      <h3 className={OVERLINE}>{title}</h3>
      {children}
      {items.length === 0 ? (
        <p className="text-ink-secondary">{empty}</p>
      ) : (
        <ul className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 @lg:grid-cols-[auto_minmax(0,1fr)_auto]">
          {visible.map((item) => (
            <li
              key={item.key}
              className="col-span-full grid grid-cols-subgrid items-center gap-y-1 border-t border-border py-2 first:border-t-0 first:pt-0"
            >
              <span className="justify-self-start">{item.badge}</span>
              <span className="order-last col-span-full font-mono text-xs leading-5 wrap-break-word text-ink @lg:order-none @lg:col-span-1">
                <BreakableName name={item.name} />
              </span>
              <span className="justify-self-end text-sm whitespace-nowrap text-ink-secondary @lg:justify-self-auto">
                {item.detail}
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-3">
        {hidden > 0 ? (
          <span className="mr-auto text-sm text-ink-secondary">
            E mais {formatCount(hidden, 'pendência', 'pendências')}.
          </span>
        ) : null}
        {pillars
          .filter((pillar) => OPEN_LABELS[pillar])
          .map((pillar) => (
            <button
              key={pillar}
              type="button"
              onClick={() => onOpen(pillar)}
              className={`relative inline-flex cursor-pointer items-center gap-1.5 rounded-sm text-sm max-lg:before:absolute max-lg:before:-inset-y-3.5 max-lg:before:inset-x-0 max-lg:before:content-[''] font-medium text-accent-ink transition-colors duration-150 hover:text-ink ${FOCUS_RING}`}
            >
              {OPEN_LABELS[pillar]}
              <Icon icon={ArrowRight} size={14} />
            </button>
          ))}
      </div>
    </section>
  )
}
