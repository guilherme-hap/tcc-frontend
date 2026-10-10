import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import type { EvaluationRecord, PillarName } from '../../types'
import { formatNumber, formatPercent } from '../../utils/format'
import { PILLARS_BY_TYPE, PILLAR_LABELS } from '../../utils/labels'
import { finalScoreParts } from '../../utils/scoreParts'
import { Icon } from '../ui/Icon'
import { FOCUS_RING, GLASS_SURFACE } from '../ui/classes'
import { ScoreMeter } from './ScoreMeter'
import { ScoreRing } from './ScoreRing'
import { SegmentedScoreRing } from './SegmentedScoreRing'

interface PillarRowProps {
  pillar: PillarName
  score: number | undefined
  weight: number | undefined
  emptyLabel: string
  onOpen?: (pillar: PillarName) => void
  onActiveChange?: (pillar: PillarName | null) => void
}

function PillarRow({ pillar, score, weight, emptyLabel, onOpen, onActiveChange }: PillarRowProps) {
  const label = PILLAR_LABELS[pillar]
  const activate = onActiveChange ? () => onActiveChange(pillar) : undefined
  const deactivate = onActiveChange ? () => onActiveChange(null) : undefined

  return (
    <li
      onMouseEnter={activate}
      onMouseLeave={deactivate}
      className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1.5"
    >
      <span className="flex flex-wrap items-baseline gap-x-2">
        {onOpen ? (
          <button
            type="button"
            onClick={() => onOpen(pillar)}
            onFocus={activate}
            onBlur={deactivate}
            className={`inline-flex cursor-pointer items-center gap-1 rounded-sm font-medium text-ink transition-colors duration-150 hover:text-accent-ink ${FOCUS_RING}`}
          >
            {label}
            <Icon icon={ChevronRight} size={14} />
          </button>
        ) : (
          <span className="font-medium text-ink">{label}</span>
        )}
        {weight !== undefined ? (
          <span className="text-[13px] text-ink-secondary">peso {formatPercent(weight)}</span>
        ) : null}
      </span>
      {score !== undefined ? (
        <>
          <span className="font-mono text-[15px] font-semibold text-ink tabular-nums">
            {formatNumber(score)}
          </span>
          <div className="col-span-2">
            <ScoreMeter label={`Nota de ${label.toLowerCase()}`} score={score} />
          </div>
        </>
      ) : (
        <span className="text-[13px] text-ink-secondary">{emptyLabel}</span>
      )}
    </li>
  )
}

function describeFinalScore(
  evaluation: EvaluationRecord,
  isActive: boolean,
  segmented: boolean,
): string {
  const { evaluationType, finalScore, status } = evaluation

  if (evaluationType !== 'full') {
    const pillar = PILLAR_LABELS[evaluationType].toLowerCase()
    if (status === 'FAILED') return `A nota de ${pillar} não foi calculada porque a avaliação falhou.`
    return `Com um único pilar, a nota final é a nota de ${pillar}.`
  }
  if (finalScore === null && !isActive && status !== 'COMPLETED') {
    return 'A nota final só é calculada quando os três pilares concluem.'
  }
  if (segmented) {
    return 'Soma das notas dos três pilares, cada uma multiplicada pelo seu peso. Cada arco é um pilar: o comprimento é o peso e o preenchimento é a nota.'
  }
  return 'Soma das notas dos três pilares, cada uma multiplicada pelo seu peso.'
}

interface ScoreSummaryProps {
  evaluation: EvaluationRecord
  isActive: boolean
  onOpenPillar?: (pillar: PillarName) => void
}

export function ScoreSummary({ evaluation, isActive, onOpenPillar }: ScoreSummaryProps) {
  const { evaluationType, finalScore, pillarScores, scoring, scoreBreakdown, failedPillars } =
    evaluation
  const failed = new Set((failedPillars ?? []).map((item) => item.pillar))
  const [activePillar, setActivePillar] = useState<string | null>(null)
  const parts = evaluationType === 'full' ? finalScoreParts(scoreBreakdown) : null

  return (
    <section
      aria-label="Notas"
      className={`flex flex-col items-center gap-5 rounded-xl border-border p-5 sm:flex-row sm:items-center sm:gap-8 sm:p-8 ${GLASS_SURFACE}`}
    >
      {parts && finalScore !== null ? (
        <SegmentedScoreRing
          label="Nota final"
          score={finalScore}
          parts={parts}
          activeId={activePillar}
          onActiveChange={setActivePillar}
        />
      ) : (
        <ScoreRing
          score={finalScore}
          label="Nota final"
          loading={isActive && finalScore === null}
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-5 max-sm:w-full">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-base font-semibold tracking-[-0.01em] text-ink">
            Nota final
          </h2>
          <p className="text-ink-secondary">
            {describeFinalScore(evaluation, isActive, parts !== null)}
          </p>
        </div>
        {evaluationType === 'full' ? (
          <ul className="flex flex-col gap-3">
            {PILLARS_BY_TYPE.full.map((pillar) => (
              <PillarRow
                key={pillar}
                pillar={pillar}
                score={pillarScores?.[pillar]}
                weight={scoring?.pillarWeights[pillar]}
                emptyLabel={
                  failed.has(pillar) ? 'Não concluído' : isActive ? 'Calculando' : 'Sem nota'
                }
                onOpen={onOpenPillar}
                onActiveChange={parts ? setActivePillar : undefined}
              />
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  )
}
