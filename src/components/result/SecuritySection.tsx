import {
  Check,
  Minus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  TriangleAlert,
  X,
  type LucideIcon,
} from 'lucide-react'
import type {
  ISecurityCheckResult,
  IScoringParameters,
  SecurityCheckStatus,
  SecurityLayer,
} from '../../types'
import { formatPercent } from '../../utils/format'
import { CHECK_STATUS_LABELS, LAYER_LABELS, LAYER_ORDER } from '../../utils/labels'
import { Badge, type BadgeTone } from '../ui/Badge'
import { Icon } from '../ui/Icon'
import { Panel } from '../ui/Panel'
import { GLASS } from '../ui/classes'
import { PillarScore } from './PillarScore'

const STATUS_TONES: Record<SecurityCheckStatus, BadgeTone> = {
  pass: 'success',
  warning: 'warning',
  missing: 'error',
  error: 'error',
}

const STATUS_ICONS: Record<SecurityCheckStatus, LucideIcon> = {
  pass: Check,
  warning: TriangleAlert,
  missing: Minus,
  error: X,
}

const TILE_ICONS: Record<SecurityCheckStatus, LucideIcon> = {
  pass: ShieldCheck,
  warning: ShieldAlert,
  missing: Shield,
  error: ShieldAlert,
}

const TILE_CLASSES: Record<SecurityCheckStatus, string> = {
  pass: 'border-success/30 bg-success-dim text-success',
  warning: 'border-warning/30 bg-warning-dim text-warning',
  missing: 'border-error/30 bg-error-dim text-error',
  error: 'border-error/30 bg-error-dim text-error',
}

interface CheckCardProps {
  check: ISecurityCheckResult
}

function CheckCard({ check }: CheckCardProps) {
  return (
    <li className={`flex min-w-0 flex-col items-start gap-2 border-border p-4 ${GLASS}`}>
      <div className="mb-1 flex w-full items-center justify-between gap-2">
        <span
          aria-hidden="true"
          className={`inline-flex size-8 items-center justify-center rounded-md border ${TILE_CLASSES[check.status]}`}
        >
          <Icon icon={TILE_ICONS[check.status]} />
        </span>
        <Badge tone={STATUS_TONES[check.status]} icon={STATUS_ICONS[check.status]}>
          {CHECK_STATUS_LABELS[check.status]}
        </Badge>
      </div>
      <h4 className="max-w-full font-mono text-[13px] font-medium wrap-anywhere text-ink">
        {check.header}
      </h4>
      <p className="text-[13px] text-ink">{check.message}</p>
      {check.recommendation ? (
        <p className="text-[13px] text-ink-secondary">{check.recommendation}</p>
      ) : null}
    </li>
  )
}

interface SecuritySectionProps {
  checks: ISecurityCheckResult[]
  layerWeights?: NonNullable<IScoringParameters['security']>['layerWeights']
  score?: number
}

export function SecuritySection({ checks, layerWeights, score }: SecuritySectionProps) {
  const layers = LAYER_ORDER.map((layer: SecurityLayer) => ({
    layer,
    checks: checks.filter((check) => check.layer === layer),
  })).filter((group) => group.checks.length > 0)

  return (
    <Panel
      title="Segurança"
      description="Configuração de transporte e cabeçalhos HTTP observados na URL base, não em cada endpoint."
      aside={<PillarScore score={score} />}
    >
      <div className="flex flex-col gap-6">
        {layers.map(({ layer, checks: layerChecks }) => (
          <section key={layer} className="flex min-w-0 flex-col gap-3">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <h3 className="font-medium text-ink">{LAYER_LABELS[layer]}</h3>
              {layerWeights ? (
                <span className="text-[13px] text-ink-secondary">
                  peso {formatPercent(layerWeights[layer], 2)}
                </span>
              ) : null}
            </div>
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
              {layerChecks.map((check) => (
                <CheckCard key={`${check.header}-${check.code}`} check={check} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Panel>
  )
}
