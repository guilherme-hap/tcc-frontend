import type { EvaluationRecord, PillarName } from '../../types'
import { formatNumber, formatPercent } from '../../utils/format'
import { PILLAR_LABELS } from '../../utils/labels'
import { findStep } from '../../utils/steps'
import { PILLAR_BG } from '../../utils/tones'
import { CARD, FOCUS_RING } from '../ui/classes'
import { ContractStrip, PerformanceStrip, SecurityStrip } from './PillarStrip'
import {
  hasPillarFailed,
  hasPillarResult,
  pillarDetail,
  pillarPart,
  pillarStateLabel,
} from './pillarSummary'

interface StripProps {
  pillar: PillarName
  evaluation: EvaluationRecord
}

function Strip({ pillar, evaluation }: StripProps) {
  if (pillar === 'contract' && evaluation.spectralResult) {
    return <ContractStrip result={evaluation.spectralResult} />
  }
  if (pillar === 'performance' && evaluation.performanceResults) {
    return <PerformanceStrip results={evaluation.performanceResults} />
  }
  if (pillar === 'security' && evaluation.securityResult) {
    return <SecurityStrip checks={evaluation.securityResult} />
  }
  return null
}

interface PillarTileProps {
  pillar: PillarName
  evaluation: EvaluationRecord
  isActive: boolean
  highlighted: boolean
  onOpen: (pillar: PillarName) => void
  onHighlight: (pillar: PillarName | null) => void
}

export function PillarTile({
  pillar,
  evaluation,
  isActive,
  highlighted,
  onOpen,
  onHighlight,
}: PillarTileProps) {
  const score = evaluation.pillarScores?.[pillar]
  const weight = evaluation.scoring?.pillarWeights[pillar]
  const part = pillarPart(evaluation, pillar)
  const ready = hasPillarResult(evaluation, pillar)
  const failed = hasPillarFailed(evaluation, pillar)
  const busy = !ready && !failed && isActive
  const step = findStep(evaluation, pillar)
  const failedTone = step?.status === 'FAILED' ? 'text-error' : 'text-warning'

  return (
    <section
      aria-busy={busy || undefined}
      onMouseEnter={() => onHighlight(pillar)}
      onMouseLeave={() => onHighlight(null)}
      className={`relative flex min-w-0 flex-col gap-3 p-4 ${CARD} ${highlighted ? 'border-border-hover bg-surface-raised' : 'border-border'}`}
    >
      <div className="flex items-center gap-2">
        <span aria-hidden="true" className={`size-2.5 shrink-0 rounded-xs ${PILLAR_BG[pillar]}`} />
        <h3 className="min-w-0 font-semibold text-ink">
          <button
            type="button"
            onClick={() => onOpen(pillar)}
            onFocus={() => onHighlight(pillar)}
            onBlur={() => onHighlight(null)}
            className={`cursor-pointer rounded-sm text-left after:absolute after:inset-0 after:rounded-card ${FOCUS_RING}`}
          >
            {PILLAR_LABELS[pillar]}
          </button>
        </h3>
        {weight !== undefined ? (
          <span className="ml-auto font-mono text-xs whitespace-nowrap text-ink-secondary">
            peso {formatPercent(weight)}
          </span>
        ) : null}
      </div>
      {score !== undefined ? (
        <p className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <span className="num text-[44px] leading-none text-ink">{formatNumber(score)}</span>
          {part ? (
            <span className="font-mono text-xs text-ink-secondary">
              {formatNumber(part.points)} de {formatNumber(part.maxPoints)} pontos
            </span>
          ) : null}
        </p>
      ) : busy ? (
        <span
          role="img"
          aria-label="Calculando"
          className="block h-11 w-24 animate-pulse rounded-md bg-surface-raised motion-reduce:animate-none"
        />
      ) : (
        <p
          className={`flex h-11 items-center font-medium ${failed ? failedTone : 'text-ink-secondary'}`}
        >
          {pillarStateLabel(evaluation, pillar, isActive)}
        </p>
      )}
      {ready ? (
        <>
          <Strip pillar={pillar} evaluation={evaluation} />
          <p className="text-[13px] text-ink-secondary">{pillarDetail(evaluation, pillar)}</p>
        </>
      ) : busy ? (
        <span className="block h-10 animate-pulse rounded-md bg-surface-raised motion-reduce:animate-none" />
      ) : null}
    </section>
  )
}
