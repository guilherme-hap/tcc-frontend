import { CircleHelp, TriangleAlert, type LucideIcon } from 'lucide-react'
import type { IScoringParameters, StabilityStatus } from '../../types'
import { scoresTie } from '../../utils/chart'
import { formatCount, formatNumber } from '../../utils/format'
import { Badge, type BadgeTone } from '../ui/Badge'
import { Block } from '../ui/Block'
import { Collapsible } from '../ui/Collapsible'
import { AuditMessageList } from './AuditMessageList'
import { LazyRunScoreChart } from './LazyCharts'

const STABILITY_BADGE: Record<
  StabilityStatus,
  { tone: BadgeTone; icon?: LucideIcon; label: string }
> = {
  stable: { tone: 'neutral', label: 'Variação baixa' },
  low: { tone: 'warning', icon: TriangleAlert, label: 'Variação alta' },
  not_measured: { tone: 'neutral', icon: CircleHelp, label: 'Variação não medida' },
}

interface VariationGaugeProps {
  value: number
  limit: number | undefined
}

function VariationGauge({ value, limit }: VariationGaugeProps) {
  const max = Math.max((limit ?? 0) * 2, value * 1.15, 0.001)

  return (
    <div className="flex flex-col gap-1.5">
      <span aria-hidden="true" className="relative block h-2 rounded-xs bg-idle">
        <span
          className="absolute inset-y-0 left-0 rounded-xs bg-measure"
          style={{ width: `${Math.max(1, (value / max) * 100)}%` }}
        />
        {limit !== undefined ? (
          <span
            className="absolute -inset-y-1 w-0.5 -translate-x-1/2 bg-ink"
            style={{ left: `${(limit / max) * 100}%` }}
          />
        ) : null}
      </span>
      {limit !== undefined ? (
        <span className="inline-flex items-center gap-2 text-xs text-ink-secondary">
          <span aria-hidden="true" className="h-3 w-0.5 bg-ink" />
          Limiar provisório{' '}
          <span className="font-mono text-ink tabular-nums">{formatNumber(limit, 3)}</span>
        </span>
      ) : null}
    </div>
  )
}

interface StatProps {
  label: string
  value: string
}

function Stat({ label, value }: StatProps) {
  return (
    <div className="flex min-w-0 flex-col justify-between gap-0.5">
      <dt className="text-sm text-ink-secondary">{label}</dt>
      <dd className="num text-2xl leading-7 text-ink">{value}</dd>
    </div>
  )
}

type Stability = NonNullable<NonNullable<IScoringParameters['performance']>['stability']>
type Thresholds = NonNullable<IScoringParameters['performance']>['thresholds']

interface VariationBlockProps {
  stability: Stability
  thresholds: Thresholds
}

function VariationBlock({ stability, thresholds }: VariationBlockProps) {
  if (stability.coefficientOfVariation === null) return null

  return (
    <div className="flex max-w-sm flex-col gap-2">
      <p className="flex items-baseline justify-between gap-3 text-sm text-ink-secondary">
        Coeficiente de variação
        <span className="num text-2xl leading-7 text-ink">
          {formatNumber(stability.coefficientOfVariation, 4)}
        </span>
      </p>
      <VariationGauge
        value={stability.coefficientOfVariation}
        limit={thresholds?.stabilityThreshold}
      />
    </div>
  )
}

interface StabilityDetailProps {
  runScores: (number | null)[]
  stability: Stability
  thresholds: Thresholds
  pillarScore?: number
}

function StabilityDetail({ runScores, stability, thresholds, pillarScore }: StabilityDetailProps) {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-x-8 gap-y-5 @2xl:grid-cols-[minmax(0,1fr)_16rem]">
      <LazyRunScoreChart
        scores={runScores}
        reference={pillarScore}
        dispersion={stability.dispersion}
      />
      <div className="flex min-w-0 flex-col gap-4">
        {stability.dispersion ? (
          <dl className="grid grid-cols-3 gap-x-4 gap-y-3 @2xl:grid-cols-1">
            <Stat label="Desvio padrão" value={formatNumber(stability.dispersion.stddev)} />
            <Stat label="Menor nota" value={formatNumber(stability.dispersion.min)} />
            <Stat label="Maior nota" value={formatNumber(stability.dispersion.max)} />
          </dl>
        ) : null}
        <VariationBlock stability={stability} thresholds={thresholds} />
      </div>
    </div>
  )
}

interface MeasurementSummaryProps {
  measurement: NonNullable<IScoringParameters['performance']>
  pillarScore?: number
}

export function MeasurementSummary({ measurement, pillarScore }: MeasurementSummaryProps) {
  const { runScores, stability, repetitions, thresholds, warnings = [] } = measurement
  if (!runScores || !stability) return null

  const badge = STABILITY_BADGE[stability.status]
  const single = repetitions === 1 || runScores.length < 2
  const tied = !single && scoresTie(runScores)
  const detail = (
    <StabilityDetail
      runScores={runScores}
      stability={stability}
      thresholds={thresholds}
      pillarScore={pillarScore}
    />
  )

  return (
    <Block
      title="Estabilidade entre execuções"
      info="Os limiares de estabilidade e de saturação do gerador de carga são provisórios: ainda não foram calibrados com uma API de referência."
      className="@container"
      aside={
        <>
          <Badge tone={badge.tone} icon={badge.icon}>
            {badge.label}
          </Badge>
          <span className="text-sm text-ink-secondary">
            {formatCount(runScores.length, 'execução', 'execuções')} do teste de carga
          </span>
        </>
      }
    >
      <div className="flex min-w-0 flex-col gap-4">

      {single ? (
        <p className="text-sm text-ink-secondary">
          Execução única: a nota{' '}
          <span className="font-mono text-ink tabular-nums">
            {runScores[0] === null || runScores[0] === undefined ? 'não medida' : formatNumber(runScores[0])}
          </span>{' '}
          não tem com o que ser comparada, então a estabilidade não foi medida.
        </p>
      ) : tied ? (
        <>
          <p className="text-sm text-ink-secondary">
            Todas as execuções deram a mesma nota,{' '}
            <span className="font-mono text-ink tabular-nums">{formatNumber(runScores[0] ?? 0)}</span>
            {stability.dispersion ? (
              <>
                , e o desvio padrão é{' '}
                <span className="font-mono text-ink tabular-nums">
                  {formatNumber(stability.dispersion.stddev)}
                </span>
              </>
            ) : null}
            .
          </p>
          {stability.coefficientOfVariation !== null ? (
            <Collapsible title="Ver o coeficiente de variação">
              <VariationBlock stability={stability} thresholds={thresholds} />
            </Collapsible>
          ) : null}
        </>
      ) : (
        detail
      )}

      <AuditMessageList messages={warnings} />
      </div>
    </Block>
  )
}
