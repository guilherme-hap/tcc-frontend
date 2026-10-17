import type {
  IScoreBreakdown,
  ISecurityCheckResult,
  IScoringParameters,
  SecurityLayer,
} from '../../types'
import { formatPercent } from '../../utils/format'
import { LAYER_LABELS, LAYER_ORDER } from '../../utils/labels'
import { securityScoreParts } from '../../utils/scoreParts'
import { Panel } from '../ui/Panel'
import { CheckStatusBadge } from './CheckStatusBadge'
import { ScoreBreakdown } from './ScoreBreakdown'

interface CheckRowProps {
  check: ISecurityCheckResult
}

function CheckRow({ check }: CheckRowProps) {
  return (
    <li className="flex min-w-0 flex-col gap-1.5 py-3 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <h4 className="max-w-full font-mono text-sm font-medium wrap-anywhere text-ink">
          {check.header}
        </h4>
        <CheckStatusBadge status={check.status} />
      </div>
      <p className="text-sm text-ink">{check.message}</p>
      {check.recommendation ? (
        <p className="text-sm text-ink-secondary">{check.recommendation}</p>
      ) : null}
    </li>
  )
}

interface SecuritySectionProps {
  checks: ISecurityCheckResult[]
  layerWeights?: NonNullable<IScoringParameters['security']>['layerWeights']
  breakdown: IScoreBreakdown | null
  score?: number
}

export function SecuritySection({ checks, layerWeights, breakdown, score }: SecuritySectionProps) {
  const layers = LAYER_ORDER.map((layer: SecurityLayer) => ({
    layer,
    checks: checks.filter((check) => check.layer === layer),
  })).filter((group) => group.checks.length > 0)
  const parts = securityScoreParts(breakdown, checks)

  return (
    <Panel
      title="Verificações de segurança"
      className="section-large"
      description="Configuração de transporte e cabeçalhos HTTP observados na URL base, não em cada endpoint."
    >
      <div className="@container flex flex-col gap-6">
        {parts && score !== undefined ? (
          <div className="border-b border-border pb-6">
            <ScoreBreakdown
              title="Composição da nota"
              description="Cada arco é uma camada: o comprimento é o peso e o preenchimento é a média das verificações. Os pontos das camadas somam a nota do pilar."
              label="Nota de segurança"
              score={score}
              parts={parts}
            />
          </div>
        ) : null}
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 @6xl:grid-cols-2">
          {layers.map(({ layer, checks: layerChecks }) => (
            <section key={layer} className="flex min-w-0 flex-col gap-3">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <h3 className="font-medium text-ink">{LAYER_LABELS[layer]}</h3>
                {layerWeights ? (
                  <span className="text-sm text-ink-secondary">
                    peso {formatPercent(layerWeights[layer], 2)}
                  </span>
                ) : null}
              </div>
              <ul className="flex flex-col divide-y divide-border">
                {layerChecks.map((check) => (
                  <CheckRow key={`${check.header}-${check.code}`} check={check} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </Panel>
  )
}
