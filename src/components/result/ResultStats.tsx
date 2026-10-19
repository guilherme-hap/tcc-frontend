import type { ReactNode } from 'react'
import type {
  EvaluationRecord,
  EvaluationType,
  SecurityCheckStatus,
} from '../../types'
import { formatNumber, formatPercent } from '../../utils/format'
import { CHECK_STATUS_LABELS } from '../../utils/labels'
import { CHECK_STATUS_MARK } from '../../utils/tones'
import { OVERLINE } from '../ui/classes'

const PENDING_STATUSES: SecurityCheckStatus[] = ['warning', 'missing', 'error']

interface StatContent {
  value: string
  unit?: string
  hint: string
  chart?: ReactNode
  tone?: 'error' | 'warning'
}

interface StatSlot {
  id: string
  label: string
  content: (evaluation: EvaluationRecord) => StatContent | null
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0)
}

const CONTRACT_CONFORMITY: StatSlot = {
  id: 'contract-conformity',
  label: 'Regras sem violação',
  content: ({ spectralResult }) => {
    if (!spectralResult) return null
    const { evaluatedRules, violatedRules } = spectralResult.summary
    const conforming = evaluatedRules - violatedRules
    return {
      value: formatPercent(evaluatedRules === 0 ? 1 : conforming / evaluatedRules),
      hint: `${formatNumber(conforming)} de ${formatNumber(evaluatedRules)} regras aplicáveis`,
    }
  },
}

const CONTRACT_OCCURRENCES: StatSlot = {
  id: 'contract-occurrences',
  label: 'Ocorrências',
  content: ({ spectralResult }) => {
    if (!spectralResult) return null
    const { violatedRules, occurrencesByRule } = spectralResult.summary
    return {
      value: formatNumber(sum(Object.values(occurrencesByRule))),
      hint: `Em ${formatNumber(violatedRules)} ${violatedRules === 1 ? 'regra violada' : 'regras violadas'}`,
    }
  },
}

const PERFORMANCE_STABILITY: StatSlot = {
  id: 'performance-stability',
  label: 'Nota e desvio entre execuções',
  content: ({ pillarScores, scoring }) => {
    const measurement = scoring?.performance
    const score = pillarScores?.performance
    if (!measurement?.stability || score === undefined) return null
    const { stability, repetitions, runScores } = measurement
    const runs = repetitions ?? 1
    const runsLabel = `${formatNumber(runs)} ${runs === 1 ? 'execução' : 'execuções'}`
    const hints: Record<typeof stability.status, string> = {
      stable: 'Variação entre execuções dentro do limiar provisório',
      low: 'Variação entre execuções acima do limiar provisório',
      not_measured: 'Variação entre execuções não medida',
    }
    return {
      value: stability.dispersion
        ? `${formatNumber(score)} ± ${formatNumber(stability.dispersion.stddev)}`
        : formatNumber(score),
      unit: runsLabel,
      hint: hints[stability.status],
      tone: stability.status === 'low' ? 'warning' : undefined,
      chart:
        runScores && runScores.length > 1 ? (
          <div
            role="img"
            aria-label={`Nota por execução: ${runScores.map((value) => (value === null ? 'não medida' : formatNumber(value))).join(', ')}`}
            className="flex gap-1"
          >
            {runScores.map((value, index) => (
              <span key={index} className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-idle">
                {value === null ? null : (
                  <span
                    className="absolute inset-y-0 left-0 bg-pillar-performance"
                    style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
                  />
                )}
              </span>
            ))}
          </div>
        ) : undefined,
    }
  },
}

const PERFORMANCE_MEASURED: StatSlot = {
  id: 'performance-measured',
  label: 'Endpoints medidos',
  content: ({ performanceResults, targets }) => {
    if (!performanceResults) return null
    const measured = performanceResults.filter((target) => target.result?.score != null).length
    const requests = sum(performanceResults.map((target) => target.result?.totalRequests ?? 0))
    return {
      value: formatNumber(measured),
      unit: `de ${formatNumber(targets?.length ?? performanceResults.length)}`,
      hint: `${formatNumber(requests)} requisições enviadas`,
    }
  },
}

const PERFORMANCE_SERVER_ERRORS: StatSlot = {
  id: 'performance-server-errors',
  label: 'Respostas 5xx',
  content: ({ performanceResults }) => {
    if (!performanceResults) return null
    const requests = sum(performanceResults.map((target) => target.result?.totalRequests ?? 0))
    const serverErrors = sum(performanceResults.map((target) => target.result?.serverErrors ?? 0))
    return {
      value: formatNumber(serverErrors),
      tone: serverErrors > 0 ? 'error' : undefined,
      hint:
        requests > 0
          ? `${formatPercent(serverErrors / requests, 2)} das requisições enviadas`
          : 'Nenhuma requisição enviada',
    }
  },
}

const SECURITY_PASSED: StatSlot = {
  id: 'security-passed',
  label: 'Verificações atendidas',
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
              className={`h-1.5 flex-1 rounded-full ${CHECK_STATUS_MARK[check.status]}`}
            />
          ))}
        </div>
      ),
    }
  },
}

const SECURITY_PENDING: StatSlot = {
  id: 'security-pending',
  label: 'Verificações com pendência',
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
  full: [
    CONTRACT_CONFORMITY,
    SECURITY_PASSED,
    PERFORMANCE_STABILITY,
    PERFORMANCE_MEASURED,
    PERFORMANCE_SERVER_ERRORS,
  ],
  contract: [CONTRACT_CONFORMITY, CONTRACT_OCCURRENCES],
  performance: [PERFORMANCE_STABILITY, PERFORMANCE_MEASURED, PERFORMANCE_SERVER_ERRORS],
  security: [SECURITY_PASSED, SECURITY_PENDING],
}

interface ResultStatsProps {
  evaluation: EvaluationRecord
  isActive: boolean
}

export function ResultStats({ evaluation, isActive }: ResultStatsProps) {
  const cards = SLOTS_BY_TYPE[evaluation.evaluationType]
    .map((slot) => ({ slot, content: slot.content(evaluation) }))
    .filter(({ content }) => content !== null || isActive)

  if (cards.length === 0) return null

  return (
    <section aria-label="Medições" className="flex flex-col gap-3">
      <h2 className={OVERLINE}>Medições</h2>
      <ul className="flex flex-col divide-y divide-border">
        {cards.map(({ slot, content }) => (
          <li
            key={slot.id}
            aria-busy={content === null || undefined}
            className="flex flex-col gap-1.5 py-3 first:pt-0 last:pb-0"
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm text-ink-secondary">{slot.label}</span>
              {content === null ? (
                <span
                  role="img"
                  aria-label="Carregando"
                  className="block h-6 w-16 animate-pulse rounded-md bg-surface-raised motion-reduce:animate-none"
                />
              ) : (
                <span
                  className={`num text-right text-2xl leading-7 whitespace-nowrap ${content.tone === 'error' ? 'text-error' : content.tone === 'warning' ? 'text-warning' : 'text-ink'}`}
                >
                  {content.value}
                  {content.unit ? (
                    <span className="ml-1.5 font-body text-sm leading-5 font-normal tracking-normal whitespace-nowrap text-ink-secondary [font-variation-settings:normal]">
                      {content.unit}
                    </span>
                  ) : null}
                </span>
              )}
            </div>
            {content?.chart}
            {content ? <p className="text-xs text-ink-secondary">{content.hint}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  )
}
