import { CircleX } from 'lucide-react'
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
import { OVERLINE } from '../ui/classes'
import { ApdexZones } from './ApdexZones'
import { AuditMessageList } from './AuditMessageList'
import { LatencyPercentiles } from './LatencyPercentiles'
import { PerformanceProgress } from './PerformanceProgress'
import { SeriesChart } from './SeriesChart'
import { StatusCodeBreakdown } from './StatusCodeBreakdown'

const SUBHEADING = 'text-[13px] font-medium text-ink'

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

interface TargetHeadingProps {
  method: string
  path: string
  pathParams: Record<string, string> | undefined
}

function TargetHeading({ method, path, pathParams }: TargetHeadingProps) {
  const params = Object.entries(pathParams ?? {})

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <h3 className="flex min-w-0 flex-wrap items-center gap-2 text-[13px]">
        <Badge mono>{method}</Badge>
        <span className="font-mono font-medium break-all text-ink">{path}</span>
      </h3>
      {params.length > 0 ? (
        <p className="text-[13px] text-ink-secondary">
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
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className={OVERLINE}>Diagnóstico</h4>
          <Badge>Fora da nota</Badge>
        </div>
        <p className="text-[13px] text-ink-secondary">
          Medidas do mesmo teste que não entram na nota: a nota do endpoint é só o Apdex.
        </p>
      </div>

      <div className="flex min-w-0 flex-col gap-2">
        <h5 className={SUBHEADING}>Latência das respostas fora de 4xx</h5>
        {result.latency ? (
          <LatencyPercentiles latency={result.latency} />
        ) : (
          <p className="text-[13px] text-ink-secondary">
            Nenhuma resposta fora de 4xx chegou: não há latência para medir.
          </p>
        )}
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] sm:gap-6">
        <div className="flex min-w-0 flex-col gap-1">
          <h5 className={SUBHEADING}>Vazão média</h5>
          <p className="num text-2xl leading-7 text-ink">
            {formatNumber(result.requestsPerSecond, 1)}
            <span className="ml-1.5 font-body text-[13px] font-normal tracking-normal text-ink-secondary [font-variation-settings:normal]">
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
  target: IPerformanceTargetResult
  pathParams: Record<string, string> | undefined
}

function TargetCard({ target, pathParams }: TargetCardProps) {
  const { result } = target

  return (
    <li className="flex min-w-0 flex-col gap-4 rounded-md border border-border bg-well p-4">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <TargetHeading method={target.method} path={target.path} pathParams={pathParams} />
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
            <div className="flex min-w-0 flex-col gap-3">
              <h4 className={OVERLINE}>Zonas do Apdex</h4>
              <ApdexZones result={result} />
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
      className="flex min-w-0 flex-col gap-4 rounded-md border border-accent-ink/30 bg-well p-4"
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
    <li className="flex min-w-0 flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-md border border-dashed border-border-hover p-4">
      <TargetHeading
        method={target.method ?? 'GET'}
        path={target.path}
        pathParams={target.pathParams}
      />
      <Badge>{isActive ? 'Aguardando' : 'Não testado'}</Badge>
    </li>
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

  return (
    <Panel
      title="Endpoints do teste de carga"
      description="Apdex calculado por endpoint; a nota do pilar é a média simples dos endpoints medidos e dos que falharam, que contam como 0; endpoint não medido fica fora da média. Latência, vazão, códigos HTTP e a série por segundo são diagnóstico, por endpoint, e não entram na nota."
    >
      <div className="@container">
        <ul className={`grid grid-cols-1 gap-3 ${count > 1 ? '@7xl:grid-cols-2' : ''}`}>
          {Array.from({ length: count }, (_, index) => {
            const result = results[index]
            const target = targets?.[index]

            if (result) {
              return <TargetCard key={index} target={result} pathParams={target?.pathParams} />
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
