import type { IScoringParameters, PillarName } from '../../types'
import { formatMilliseconds, formatNumber, formatPercent } from '../../utils/format'
import {
  CHECK_STATUS_LABELS,
  CHECK_STATUS_ORDER,
  LAYER_LABELS,
  LAYER_ORDER,
  PILLAR_LABELS,
  SEVERITY_LABELS,
  SEVERITY_ORDER,
} from '../../utils/labels'
import { Disclosure } from '../ui/Disclosure'
import { KeyValue } from '../ui/KeyValue'

const PILLARS: PillarName[] = ['contract', 'performance', 'security']
const FRUSTRATED_MULTIPLIER = 4

interface ParameterGroupProps {
  title: string
  entries: [string, string][]
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
}

export function ScoringParameters({ scoring }: ScoringParametersProps) {
  const { pillarWeights, contract, performance, security } = scoring
  const weighted = PILLARS.filter((pillar) => pillarWeights[pillar] !== undefined)

  return (
    <Disclosure title="Parâmetros usados no cálculo">
      <div className="grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2">
        {weighted.length > 1 ? (
          <ParameterGroup
            title="Pesos dos pilares"
            entries={weighted.map((pillar) => [
              PILLAR_LABELS[pillar],
              formatPercent(pillarWeights[pillar] ?? 0, 2),
            ])}
          />
        ) : null}
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
    </Disclosure>
  )
}
