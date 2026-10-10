import { CircleX } from 'lucide-react'
import type { IAutocannonResult, IPerformanceTargetResult } from '../../types'
import { formatMilliseconds, formatNumber, formatPercent } from '../../utils/format'
import { Badge } from '../ui/Badge'
import { Icon } from '../ui/Icon'
import { Panel } from '../ui/Panel'
import { OVERLINE } from '../ui/classes'
import { ApdexZones } from './ApdexZones'
import { AuditMessageList } from './AuditMessageList'
import { MetricBar } from './MetricBar'
import { PillarScore } from './PillarScore'

interface Stat {
  label: string
  value: string
}

function buildStats(result: IAutocannonResult): Stat[] {
  return [
    { label: 'Amostra válida', value: formatNumber(result.sampleSize) },
    { label: 'Requisições enviadas', value: formatNumber(result.totalRequests) },
    { label: 'Respostas 4xx excluídas', value: formatNumber(result.excluded4xx) },
    { label: 'Respostas 5xx', value: formatNumber(result.serverErrors) },
    { label: 'Falhas de conexão', value: formatNumber(result.errors) },
    { label: 'Timeouts', value: formatNumber(result.timeouts) },
    { label: 'Sem resposta ao fim', value: formatNumber(result.unanswered) },
    { label: 'Taxa de erro', value: formatPercent(result.errorRate, 2) },
  ]
}

interface TargetCardProps {
  target: IPerformanceTargetResult
  maxLatency: number
}

function TargetCard({ target, maxLatency }: TargetCardProps) {
  const { result } = target

  return (
    <li className="flex flex-col gap-4 rounded-md border border-border bg-well p-4">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <h3 className="flex min-w-0 flex-wrap items-center gap-2 text-[13px]">
          <Badge mono>{target.method}</Badge>
          <span className="font-mono font-medium break-all text-ink">{target.path}</span>
        </h3>
        {result ? (
          <p className="flex items-baseline gap-2 text-[13px] text-ink-secondary">
            <span className="font-mono text-2xl leading-8 font-semibold text-ink tabular-nums">
              {result.score !== null ? formatNumber(result.score) : 'Não medido'}
            </span>
            Apdex × 100 · T = {formatMilliseconds(result.targetLatency)}
          </p>
        ) : null}
      </div>

      {result ? (
        <>
          {result.sampleSize > 0 ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <div className="flex min-w-0 flex-col gap-3">
                <h4 className={OVERLINE}>Zonas do Apdex</h4>
                <ApdexZones result={result} />
              </div>
              <div className="flex min-w-0 flex-col gap-3">
                <h4 className={OVERLINE}>Latência média</h4>
                <MetricBar
                  label="respostas não 4xx"
                  display={formatMilliseconds(result.averageLatency)}
                  value={result.averageLatency}
                  max={maxLatency}
                />
              </div>
            </div>
          ) : null}
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 border-t border-border pt-4 sm:grid-cols-4">
            {buildStats(result).map((stat) => (
              <div key={stat.label} className="flex flex-col gap-0.5">
                <dt className="text-[13px] text-ink-secondary">{stat.label}</dt>
                <dd className="font-mono text-[13px] font-medium text-ink tabular-nums">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
          <AuditMessageList messages={result.warnings} />
        </>
      ) : (
        <p role="alert" className="flex items-start gap-2 text-error">
          <Icon icon={CircleX} className="mt-0.5" />
          <span>
            O teste deste endpoint falhou e conta como nota 0: {target.error ?? 'erro desconhecido'}
          </span>
        </p>
      )}
    </li>
  )
}

interface PerformanceSectionProps {
  results: IPerformanceTargetResult[]
  score?: number
}

export function PerformanceSection({ results, score }: PerformanceSectionProps) {
  const maxLatency = Math.max(0, ...results.map((target) => target.result?.averageLatency ?? 0))

  return (
    <Panel
      title="Desempenho"
      description="Apdex calculado por endpoint; a nota do pilar é a média simples dos endpoints medidos e dos que falharam, que contam como 0; endpoint não medido fica fora da média. As barras de latência usam a mesma escala em todos os endpoints."
      aside={<PillarScore score={score} />}
    >
      <ul className="flex flex-col gap-3">
        {results.map((target) => (
          <TargetCard
            key={`${target.method} ${target.path}`}
            target={target}
            maxLatency={maxLatency}
          />
        ))}
      </ul>
    </Panel>
  )
}
