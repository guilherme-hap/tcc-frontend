import { CircleX, TriangleAlert } from 'lucide-react'
import { useNow, type LiveSeries } from '../../hooks'
import type {
  IAutocannonResult,
  IPerformanceTarget,
  IPerformanceTargetResult,
  IStepProgress,
} from '../../types'
import { formatMilliseconds, formatNumber, formatPercent } from '../../utils/format'
import { Badge } from '../ui/Badge'
import { Icon } from '../ui/Icon'
import { Panel } from '../ui/Panel'
import { FOCUS_RING, OVERLINE } from '../ui/classes'
import { ApdexZones } from './ApdexZones'
import { AuditMessageList } from './AuditMessageList'
import { LatencyPercentiles } from './LatencyPercentiles'
import { PerformanceProgress } from './PerformanceProgress'
import { SeriesChart } from './SeriesChart'
import { StatusCodeBreakdown } from './StatusCodeBreakdown'

const SUBHEADING = 'text-sm font-medium text-ink'

interface Stat {
  label: string
  value: string
}

interface Counts {
  shown: Stat[]
  zeroed: string[]
}

function buildCounts(result: IAutocannonResult): Counts {
  const shown: Stat[] = [
    { label: 'Amostra válida', value: formatNumber(result.sampleSize) },
    { label: 'Requisições enviadas', value: formatNumber(result.totalRequests) },
    { label: 'Respostas 5xx', value: formatNumber(result.serverErrors) },
    { label: 'Taxa de erro', value: formatPercent(result.errorRate, 2) },
  ]
  const optional: { label: string; count: number }[] = [
    { label: 'Respostas 4xx excluídas', count: result.excluded4xx },
    { label: 'Falhas de conexão', count: result.errors },
    { label: 'Timeouts', count: result.timeouts },
    { label: 'Sem resposta ao fim', count: result.unanswered },
  ]

  return {
    shown: [
      ...shown,
      ...optional
        .filter(({ count }) => count > 0)
        .map(({ label, count }) => ({ label, value: formatNumber(count) })),
    ],
    zeroed: optional.filter(({ count }) => count === 0).map(({ label }) => label.toLowerCase()),
  }
}

interface TargetHeadingProps {
  method: string
  path: string
  pathParams: Record<string, string> | undefined
}

function TargetHeading({ method, path, pathParams }: TargetHeadingProps) {
  const params = Object.entries(pathParams ?? {})

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <h3 className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
        <Badge mono>{method}</Badge>
        <span className="font-mono font-medium break-all text-ink">{path}</span>
      </h3>
      {params.length > 0 ? (
        <p className="text-sm text-ink-secondary">
          Parâmetros informados:{' '}
          <span className="font-mono break-all text-ink">
            {params.map(([name, value]) => `${name} = ${value}`).join(' · ')}
          </span>
        </p>
      ) : null}
    </div>
  )
}

interface DiagnosticsProps {
  result: IAutocannonResult
}

function Diagnostics({ result }: DiagnosticsProps) {
  return (
    <section className="flex min-w-0 flex-col gap-4 border-t border-border pt-4">
      <div className="flex flex-wrap items-center gap-2">
        <h4 className={OVERLINE}>Diagnóstico</h4>
        <Badge>Fora da nota</Badge>
      </div>

      <div className="flex min-w-0 flex-col gap-2">
        <h5 className={SUBHEADING}>Latência das respostas fora de 4xx</h5>
        {result.latency ? (
          <LatencyPercentiles latency={result.latency} />
        ) : (
          <p className="text-sm text-ink-secondary">
            Nenhuma resposta fora de 4xx chegou: não há latência para medir.
          </p>
        )}
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] sm:gap-6">
        <div className="flex min-w-0 flex-col gap-1">
          <h5 className={SUBHEADING}>Vazão média</h5>
          <p className="num text-2xl leading-7 text-ink">
            {formatNumber(result.requestsPerSecond, 1)}
            <span className="ml-1.5 font-body text-sm font-normal tracking-normal text-ink-secondary [font-variation-settings:normal]">
              resp./s
            </span>
          </p>
          <p className="text-xs text-ink-secondary">
            Todas as respostas, inclusive 4xx, pela duração medida. Depende das conexões e da
            latência; não é a capacidade da API.
          </p>
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <h5 className={SUBHEADING}>Respostas por código HTTP</h5>
          <StatusCodeBreakdown statusCodes={result.statusCodes} />
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-2">
        <h5 className={SUBHEADING}>Série por segundo</h5>
        <SeriesChart points={result.series} targetLatency={result.targetLatency} />
      </div>
    </section>
  )
}

interface TargetCardProps {
  id: string
  target: IPerformanceTargetResult
  pathParams: Record<string, string> | undefined
}

function TargetCard({ id, target, pathParams }: TargetCardProps) {
  const { result } = target
  const counts = result ? buildCounts(result) : null

  return (
    <li
      id={id}
      className="flex min-w-0 scroll-mt-32 flex-col gap-4 border-t border-border pt-5 first:border-t-0 first:pt-0"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <TargetHeading method={target.method} path={target.path} pathParams={pathParams} />
        {result ? (
          <p className="flex items-baseline gap-2 text-sm text-ink-secondary">
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
            <div className="flex min-w-0 flex-col gap-3">
              <h4 className={OVERLINE}>Zonas do Apdex</h4>
              <ApdexZones result={result} />
            </div>
          ) : null}
          {counts ? (
            <div className="flex flex-col gap-2">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
                {counts.shown.map((stat) => (
                  <div key={stat.label} className="flex flex-col gap-0.5">
                    <dt className="text-sm text-ink-secondary">{stat.label}</dt>
                    <dd className="font-mono text-sm font-medium text-ink tabular-nums">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
              {counts.zeroed.length > 0 ? (
                <p className="text-xs text-ink-secondary">
                  Em zero: {counts.zeroed.join(', ')}.
                </p>
              ) : null}
            </div>
          ) : null}
          <AuditMessageList messages={result.warnings} />
          <Diagnostics result={result} />
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

interface LiveTargetCardProps {
  target: IPerformanceTarget
  progress: IStepProgress
  points: LiveSeries['points']
  targets: IPerformanceTarget[] | null
  receivedAt: number
  now: number
  limitedRequests: boolean
  targetLatency: number | undefined
}

function LiveTargetCard({
  target,
  progress,
  points,
  targets,
  receivedAt,
  now,
  limitedRequests,
  targetLatency,
}: LiveTargetCardProps) {
  return (
    <li
      aria-busy="true"
      className="flex min-w-0 flex-col gap-4 border-t border-border pt-5 first:border-t-0 first:pt-0"
    >
      <TargetHeading
        method={target.method ?? 'GET'}
        path={target.path}
        pathParams={target.pathParams}
      />
      <PerformanceProgress
        progress={progress}
        targets={targets}
        receivedAt={receivedAt}
        now={now}
        limitedRequests={limitedRequests}
        showTarget={false}
      />
      {progress.phase === 'RUNNING' ? (
        <div className="flex min-w-0 flex-col gap-2 border-t border-border pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className={OVERLINE}>Ao vivo</h4>
            <Badge>Fora da nota</Badge>
          </div>
          <SeriesChart
            points={points}
            minSlots={progress.expectedDurationSeconds}
            targetLatency={targetLatency}
          />
          <p className="text-xs text-ink-secondary">
            Um ponto por segundo. Apdex, percentis e códigos HTTP aparecem quando o teste deste
            endpoint terminar.
          </p>
        </div>
      ) : null}
    </li>
  )
}

interface WaitingTargetCardProps {
  target: IPerformanceTarget
  isActive: boolean
}

function WaitingTargetCard({ target, isActive }: WaitingTargetCardProps) {
  return (
    <li className="flex min-w-0 flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-border pt-5 first:border-t-0 first:pt-0">
      <TargetHeading
        method={target.method ?? 'GET'}
        path={target.path}
        pathParams={target.pathParams}
      />
      <Badge>{isActive ? 'Aguardando' : 'Não testado'}</Badge>
    </li>
  )
}

function targetCardId(index: number): string {
  return `performance-target-${index}`
}

interface Problem {
  index: number
  target: IPerformanceTargetResult
  reason: string
}

function ProblemSummary({ problems, count }: { problems: Problem[]; count: number }) {
  return (
    <div role="status" className="flex flex-col gap-2 text-sm">
      <p className="flex items-center gap-2 font-medium text-error">
        <Icon icon={TriangleAlert} size={14} />
        {formatNumber(problems.length)} de {formatNumber(count)} endpoints com problema
      </p>
      <ul className="flex flex-col gap-1">
        {problems.map(({ index, target, reason }) => (
          <li key={index} className="flex flex-wrap items-baseline gap-x-2">
            <button
              type="button"
              onClick={() =>
                document.getElementById(targetCardId(index))?.scrollIntoView({ block: 'start' })
              }
              className={`cursor-pointer rounded-sm font-mono break-all text-accent-ink underline underline-offset-2 max-lg:min-h-11 ${FOCUS_RING}`}
            >
              {target.method} {target.path}
            </button>
            <span className="text-ink-secondary">{reason}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

interface PerformanceSectionProps {
  results: IPerformanceTargetResult[]
  targets: IPerformanceTarget[] | null
  progress?: IStepProgress
  liveSeries?: LiveSeries | null
  receivedAt?: number
  isActive?: boolean
  limitedRequests?: boolean
  targetLatency?: number
}

export function PerformanceSection({
  results,
  targets,
  progress,
  liveSeries = null,
  receivedAt = 0,
  isActive = false,
  limitedRequests = false,
  targetLatency,
}: PerformanceSectionProps) {
  const now = useNow(progress?.phase === 'RUNNING')
  const count = Math.max(targets?.length ?? 0, results.length)
  const problems = results.flatMap((target, index) => {
    if (!target.result) return [{ index, target, reason: 'o teste falhou' }]
    if (target.result.serverErrors > 0) {
      return [
        { index, target, reason: `${formatNumber(target.result.serverErrors)} respostas 5xx` },
      ]
    }
    return []
  })

  return (
    <Panel
      title="Endpoints do teste de carga"
      className="section-large"
      description="Apdex calculado por endpoint; a nota do pilar é a média simples dos endpoints medidos e dos que falharam, que contam como 0; endpoint não medido fica fora da média. Latência, vazão, códigos HTTP e a série por segundo são diagnóstico, por endpoint, e não entram na nota."
    >
      <div className="@container flex flex-col gap-5">
        {count > 1 && problems.length > 0 ? <ProblemSummary problems={problems} count={count} /> : null}
        <ul className="flex flex-col gap-5">
          {Array.from({ length: count }, (_, index) => {
            const result = results[index]
            const target = targets?.[index]

            if (result) {
              return (
                <TargetCard
                  key={index}
                  id={targetCardId(index)}
                  target={result}
                  pathParams={target?.pathParams}
                />
              )
            }
            if (!target) return null
            if (progress?.targetIndex === index) {
              return (
                <LiveTargetCard
                  key={index}
                  target={target}
                  progress={progress}
                  points={liveSeries?.targetIndex === index ? liveSeries.points : []}
                  targets={targets}
                  receivedAt={receivedAt}
                  now={now}
                  limitedRequests={limitedRequests}
                  targetLatency={targetLatency}
                />
              )
            }
            return <WaitingTargetCard key={index} target={target} isActive={isActive} />
          })}
        </ul>
      </div>
    </Panel>
  )
}
