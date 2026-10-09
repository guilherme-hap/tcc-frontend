import type { ReactNode } from 'react'
import { FileText, ListChecks, Server, ShieldAlert, ShieldCheck, Target, type LucideIcon } from 'lucide-react'
import type {
  EvaluationRecord,
  EvaluationType,
  PillarName,
  SecurityCheckStatus,
} from '../../types'
import { formatNumber, formatPercent } from '../../utils/format'
import { CHECK_STATUS_LABELS } from '../../utils/labels'
import { StatCard } from './StatCard'

const DOT_CLASSES: Record<SecurityCheckStatus, string> = {
  pass: 'bg-success',
  warning: 'bg-warning',
  missing: 'bg-error',
  error: 'bg-error',
}

const PENDING_STATUSES: SecurityCheckStatus[] = ['warning', 'missing', 'error']

interface StatContent {
  value: string
  unit?: string
  hint: string
  chart?: ReactNode
}

interface StatSlot {
  id: string
  pillar: PillarName
  label: string
  icon: LucideIcon
  content: (evaluation: EvaluationRecord) => StatContent | null
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0)
}

const CONTRACT_CONFORMITY: StatSlot = {
  id: 'contract-conformity',
  pillar: 'contract',
  label: 'Conformidade de contrato',
  icon: FileText,
  content: ({ spectralResult }) => {
    if (!spectralResult) return null
    const { evaluatedRules, violatedRules } = spectralResult.summary
    const conforming = evaluatedRules - violatedRules
    return {
      value: formatPercent(evaluatedRules === 0 ? 1 : conforming / evaluatedRules),
      hint: `${formatNumber(conforming)} de ${formatNumber(evaluatedRules)} regras aplicáveis sem violação`,
    }
  },
}

const CONTRACT_OCCURRENCES: StatSlot = {
  id: 'contract-occurrences',
  pillar: 'contract',
  label: 'Ocorrências',
  icon: ListChecks,
  content: ({ spectralResult }) => {
    if (!spectralResult) return null
    const { violatedRules, occurrencesByRule } = spectralResult.summary
    return {
      value: formatNumber(sum(Object.values(occurrencesByRule))),
      hint: `Em ${formatNumber(violatedRules)} ${violatedRules === 1 ? 'regra violada' : 'regras violadas'}`,
    }
  },
}

const PERFORMANCE_MEASURED: StatSlot = {
  id: 'performance-measured',
  pillar: 'performance',
  label: 'Endpoints medidos',
  icon: Target,
  content: ({ performanceResults }) => {
    if (!performanceResults) return null
    const measured = performanceResults.filter((target) => target.result?.score != null).length
    const requests = sum(performanceResults.map((target) => target.result?.totalRequests ?? 0))
    return {
      value: formatNumber(measured),
      unit: `de ${formatNumber(performanceResults.length)}`,
      hint: `${formatNumber(requests)} requisições enviadas`,
    }
  },
}

const PERFORMANCE_SERVER_ERRORS: StatSlot = {
  id: 'performance-server-errors',
  pillar: 'performance',
  label: 'Respostas 5xx',
  icon: Server,
  content: ({ performanceResults }) => {
    if (!performanceResults) return null
    const requests = sum(performanceResults.map((target) => target.result?.totalRequests ?? 0))
    const serverErrors = sum(performanceResults.map((target) => target.result?.serverErrors ?? 0))
    return {
      value: formatNumber(serverErrors),
      hint:
        requests > 0
          ? `${formatPercent(serverErrors / requests, 2)} das requisições enviadas`
          : 'Nenhuma requisição enviada',
    }
  },
}

const SECURITY_PASSED: StatSlot = {
  id: 'security-passed',
  pillar: 'security',
  label: 'Verificações atendidas',
  icon: ShieldCheck,
  content: ({ securityResult }) => {
    if (!securityResult) return null
    const passed = securityResult.filter((check) => check.status === 'pass').length
    const pending = securityResult.length - passed
    return {
      value: formatNumber(passed),
      unit: `de ${formatNumber(securityResult.length)}`,
      hint: 'Observadas na URL base, não em cada endpoint',
      chart: (
        <div
          role="img"
          aria-label={`${passed} atendidas, ${pending} com pendência`}
          className="flex gap-1"
        >
          {securityResult.map((check) => (
            <span
              key={`${check.header}-${check.code}`}
              className={`h-1.5 flex-1 rounded-full ${DOT_CLASSES[check.status]}`}
            />
          ))}
        </div>
      ),
    }
  },
}

const SECURITY_PENDING: StatSlot = {
  id: 'security-pending',
  pillar: 'security',
  label: 'Verificações com pendência',
  icon: ShieldAlert,
  content: ({ securityResult }) => {
    if (!securityResult) return null
    const count = (status: SecurityCheckStatus) =>
      securityResult.filter((check) => check.status === status).length
    return {
      value: formatNumber(sum(PENDING_STATUSES.map(count))),
      hint: PENDING_STATUSES.map(
        (status) => `${CHECK_STATUS_LABELS[status]}: ${formatNumber(count(status))}`,
      ).join(' · '),
    }
  },
}

const SLOTS_BY_TYPE: Record<EvaluationType, StatSlot[]> = {
  full: [CONTRACT_CONFORMITY, SECURITY_PASSED, PERFORMANCE_MEASURED, PERFORMANCE_SERVER_ERRORS],
  contract: [CONTRACT_CONFORMITY, CONTRACT_OCCURRENCES],
  performance: [PERFORMANCE_MEASURED, PERFORMANCE_SERVER_ERRORS],
  security: [SECURITY_PASSED, SECURITY_PENDING],
}

interface ResultStatsProps {
  evaluation: EvaluationRecord
  isActive: boolean
  onOpenPillar?: (pillar: PillarName) => void
}

export function ResultStats({ evaluation, isActive, onOpenPillar }: ResultStatsProps) {
  const cards = SLOTS_BY_TYPE[evaluation.evaluationType]
    .map((slot) => ({ slot, content: slot.content(evaluation) }))
    .filter(({ content }) => content !== null || isActive)

  if (cards.length === 0) return null

  return (
    <div className={`grid grid-cols-1 gap-3 ${cards.length > 2 ? 'sm:grid-cols-2' : ''}`}>
      {cards.map(({ slot, content }) => (
        <StatCard
          key={slot.id}
          label={slot.label}
          icon={slot.icon}
          value={content?.value}
          unit={content?.unit}
          hint={content?.hint}
          loading={content === null}
          onClick={onOpenPillar && content ? () => onOpenPillar(slot.pillar) : undefined}
        >
          {content?.chart}
        </StatCard>
      ))}
    </div>
  )
}
