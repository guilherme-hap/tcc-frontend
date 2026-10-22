import type { IEvaluationRequestSettings, IScoringParameters, PillarName } from '../../types'
import { FRUSTRATED_MULTIPLIER } from '../../utils/apdex'
import { formatMilliseconds, formatNumber, formatPercent } from '../../utils/format'
import {
  CHECK_STATUS_LABELS,
  CHECK_STATUS_ORDER,
  LAYER_LABELS,
  LAYER_ORDER,
  MEASUREMENT_MODE_LABELS,
  PILLAR_LABELS,
  SEVERITY_LABELS,
  SEVERITY_ORDER,
} from '../../utils/labels'
import { Disclosure } from '../ui/Disclosure'
import { KeyValue } from '../ui/KeyValue'
import { CARD } from '../ui/classes'

const PILLARS: PillarName[] = ['contract', 'performance', 'security']

type Entry = [string, string]

type LoadOptions = NonNullable<IEvaluationRequestSettings['loadTestOptions']>

function loadEntries(options: LoadOptions): Entry[] {
  const { duration, connections, maxRequests, requestsPerSecond, method } = options
  const entries: Entry[] = []

  if (duration !== undefined) entries.push(['Duração por endpoint', `${formatNumber(duration)} s`])
  if (connections !== undefined) entries.push(['Conexões', formatNumber(connections)])
  if (maxRequests !== undefined) entries.push(['Máximo de requisições', formatNumber(maxRequests)])
  if (requestsPerSecond !== undefined) {
    entries.push(['Taxa máxima', `${formatNumber(requestsPerSecond)} req/s`])
  }
  if (method !== undefined) entries.push(['Método dos alvos', method])
  if (options.allowMutatingMethods) entries.push(['Métodos que alteram dados', 'Autorizados'])
  if (options.allowHighLoad) entries.push(['Limites de carga', 'Elevados'])
  return entries
}

function measurementEntries(performance: NonNullable<IScoringParameters['performance']>): Entry[] {
  const { repetitions, mode, restIntervalSeconds, thresholds, execution } = performance
  const entries: Entry[] = []

  if (repetitions !== undefined) {
    entries.push([
      'Execuções',
      `${formatNumber(repetitions)} (modo ${MEASUREMENT_MODE_LABELS[mode ?? 'complete']})`,
    ])
  }
  if (restIntervalSeconds !== undefined) {
    entries.push(['Intervalo entre execuções', `${formatNumber(restIntervalSeconds)} s`])
  }
  if (thresholds) {
    entries.push(
      ['Limiar de CPU do gerador', `${formatNumber(thresholds.maxCpuUsage, 2)} de um núcleo`],
      ['Limiar do event loop (p99)', `${formatNumber(thresholds.maxEventLoopDelayMs)} ms`],
      ['Limiar de estabilidade (coeficiente de variação)', formatNumber(thresholds.stabilityThreshold, 2)],
      ['Status dos limiares', 'Provisórios, ainda não calibrados'],
    )
  }
  if (execution) {
    entries.push([
      'Executado em',
      execution.workerMode === 'external' ? 'Worker externo' : 'Processo da API',
    ])
  }
  return entries
}

interface ParameterGroupProps {
  title: string
  entries: Entry[]
}

function ParameterGroup({ title, entries }: ParameterGroupProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <h3 className="font-medium text-ink">{title}</h3>
      <KeyValue items={entries.map(([label, value]) => ({ label, value, mono: true }))} />
    </div>
  )
}

interface ScoringParametersProps {
  scoring: IScoringParameters
  settings: IEvaluationRequestSettings | null
  collapsible?: boolean
}

export function ScoringParameters({
  scoring,
  settings,
  collapsible = true,
}: ScoringParametersProps) {
  const { pillarWeights, contract, performance, security } = scoring
  const weighted = PILLARS.filter((pillar) => pillarWeights[pillar] !== undefined)
  const minScore = settings?.minScore
  const load = performance ? loadEntries(settings?.loadTestOptions ?? {}) : []
  const measurement = performance ? measurementEntries(performance) : []

  const groups = (
    <div className="grid grid-cols-1 gap-x-10 gap-y-6 @lg:grid-cols-2 @5xl:grid-cols-3 @7xl:grid-cols-5">
      {weighted.length > 1 ? (
        <ParameterGroup
          title="Pesos dos pilares"
          entries={weighted.map((pillar) => [
            PILLAR_LABELS[pillar],
            formatPercent(pillarWeights[pillar] ?? 0),
          ])}
        />
      ) : null}
      <ParameterGroup
        title="Critério de aprovação"
        entries={[
          ['Nota mínima', minScore === undefined ? 'Sem nota mínima' : formatNumber(minScore)],
        ]}
      />
      {performance ? (
        <ParameterGroup
          title="Apdex"
          entries={[
            ['Tempo-alvo T', formatMilliseconds(performance.targetLatency)],
            [
              'Limite de frustração F = 4T',
              formatMilliseconds(performance.targetLatency * FRUSTRATED_MULTIPLIER),
            ],
          ]}
        />
      ) : null}
      {performance ? (
        <ParameterGroup
          title="Teste de carga"
          entries={load.length > 0 ? load : [['Opções', 'Valores padrão']]}
        />
      ) : null}
      {performance && measurement.length > 0 ? (
        <ParameterGroup title="Repetição e estabilidade" entries={measurement} />
      ) : null}
      {contract ? (
        <ParameterGroup
          title="Contrato: pesos por severidade"
          entries={[
            ...SEVERITY_ORDER.map((severity): [string, string] => [
              SEVERITY_LABELS[severity],
              formatNumber(contract.severityWeights[severity] ?? 0, 4),
            ]),
            ['Regras aplicáveis', formatNumber(contract.rules.length)],
          ]}
        />
      ) : null}
      {security ? (
        <>
          <ParameterGroup
            title="Segurança: pesos das camadas"
            entries={LAYER_ORDER.map((layer) => [
              LAYER_LABELS[layer],
              formatNumber(security.layerWeights[layer], 4),
            ])}
          />
          <ParameterGroup
            title="Segurança: valor de cada resultado"
            entries={CHECK_STATUS_ORDER.map((status) => [
              CHECK_STATUS_LABELS[status],
              formatNumber(security.statusScores[status]),
            ])}
          />
        </>
      ) : null}
    </div>
  )

  if (!collapsible) return <div className={`@container border-border p-5 ${CARD}`}>{groups}</div>

  return (
    <Disclosure title="Parâmetros usados no cálculo">
      <div className="@container">{groups}</div>
    </Disclosure>
  )
}
