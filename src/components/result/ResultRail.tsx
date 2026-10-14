import { useState } from 'react'
import { ArrowLeft, Link2, Lock, type LucideIcon } from 'lucide-react'
import type { EvaluationRecord, EvaluationVisibility, PillarName } from '../../types'
import { formatDateTime, formatDuration } from '../../utils/format'
import { TYPE_TITLES, VISIBILITY_LABELS } from '../../utils/labels'
import { HISTORY_PATH } from '../../utils/routes'
import { finalScoreParts, securityScoreParts } from '../../utils/scoreParts'
import { PILLAR_STROKE } from '../../utils/tones'
import { Badge, type BadgeTone } from '../ui/Badge'
import { StatusBadge } from '../ui/StatusBadge'
import { TextLink } from '../ui/TextLink'
import { OVERLINE } from '../ui/classes'
import { GateBadge } from './GateBadge'
import { GateVerdict } from './GateVerdict'
import { ResultNav } from './ResultNav'
import { ResultStats } from './ResultStats'
import { ScoreContributions } from './ScoreContributions'
import { ScoreRing } from './ScoreRing'
import { SegmentedScoreRing } from './SegmentedScoreRing'
import type { SectionId } from './sections'

const RING_SIZE = 208

const VISIBILITY_TONES: Record<EvaluationVisibility, BadgeTone> = {
  private: 'accent',
  anonymous: 'neutral',
}

const VISIBILITY_ICONS: Record<EvaluationVisibility, LucideIcon> = {
  private: Lock,
  anonymous: Link2,
}

function executionTime({ startedAt, finishedAt }: EvaluationRecord): number | null {
  return startedAt && finishedAt ? Date.parse(finishedAt) - Date.parse(startedAt) : null
}

interface ResultRailProps {
  evaluation: EvaluationRecord
  isActive: boolean
  hasAccount: boolean
  section: SectionId
  onSectionChange: (section: SectionId) => void
  highlighted: PillarName | null
  onHighlight: (pillar: PillarName | null) => void
}

export function ResultRail({
  evaluation,
  isActive,
  hasAccount,
  section,
  onSectionChange,
  highlighted,
  onHighlight,
}: ResultRailProps) {
  const [activePart, setActivePart] = useState<string | null>(null)
  const { evaluationType, finalScore, visibility, passed, scoreBreakdown, securityResult } =
    evaluation
  const isFull = evaluationType === 'full'
  const parts = isFull ? finalScoreParts(scoreBreakdown) : null
  const layers =
    evaluationType === 'security' && securityResult && finalScore !== null
      ? securityScoreParts(scoreBreakdown, securityResult)
      : null
  const elapsed = executionTime(evaluation)

  return (
    <aside
      aria-label="Resumo da avaliação"
      className="flex min-w-0 flex-col gap-5 border-b border-border bg-surface px-4 py-5 [scrollbar-color:var(--border-hover)_transparent] [scrollbar-width:thin] sm:px-6 lg:sticky lg:top-[53px] lg:h-[calc(100dvh-53px)] lg:overflow-y-auto lg:border-r lg:border-b-0"
    >
      <div className="flex flex-col gap-2">
        {hasAccount ? (
          <TextLink to={HISTORY_PATH} tone="muted" leadingIcon={ArrowLeft} className="self-start">
            Histórico
          </TextLink>
        ) : null}
        <h1 className="font-display text-[22px] leading-7 font-bold tracking-[-0.01em] text-ink">
          {TYPE_TITLES[evaluationType]}
        </h1>
        <div className="flex flex-wrap gap-1.5">
          <StatusBadge status={evaluation.status} />
          {passed === null ? null : <GateBadge passed={passed} />}
          <Badge tone={VISIBILITY_TONES[visibility]} icon={VISIBILITY_ICONS[visibility]}>
            {VISIBILITY_LABELS[visibility]}
          </Badge>
        </div>
      </div>
      <div className="flex flex-col items-center gap-4">
        {parts && finalScore !== null ? (
          <SegmentedScoreRing
            label="Nota final"
            caption="Nota final"
            score={finalScore}
            parts={parts}
            activeId={highlighted}
            onActiveChange={(id) => onHighlight(id as PillarName | null)}
            size={RING_SIZE}
            strokes={PILLAR_STROKE}
          />
        ) : layers && finalScore !== null ? (
          <SegmentedScoreRing
            label="Nota final"
            caption="Nota final"
            score={finalScore}
            parts={layers}
            activeId={activePart}
            onActiveChange={setActivePart}
            size={RING_SIZE}
          />
        ) : (
          <ScoreRing
            score={finalScore}
            label="Nota final"
            size={RING_SIZE}
            loading={isActive && finalScore === null}
          />
        )}
        <GateVerdict evaluation={evaluation} />
      </div>
      {isFull ? (
        <ResultNav
          evaluation={evaluation}
          isActive={isActive}
          section={section}
          onSectionChange={onSectionChange}
          highlighted={highlighted}
          onHighlight={onHighlight}
        />
      ) : layers ? (
        <section className="flex flex-col gap-2">
          <h2 className={OVERLINE}>Composição da nota</h2>
          <ScoreContributions parts={layers} activeId={activePart} onActiveChange={setActivePart} />
        </section>
      ) : (
        <ResultStats evaluation={evaluation} isActive={isActive} />
      )}
      <dl className="grid grid-cols-1 gap-x-4 gap-y-1 border-t border-border pt-4 text-[13px] sm:grid-cols-[auto_minmax(0,1fr)] lg:mt-auto">
        <dt className="text-ink-secondary">Especificação</dt>
        <dd className="font-mono text-xs leading-5 break-all text-ink max-sm:mb-1.5">
          {evaluation.openApiUrl}
        </dd>
        {evaluation.apiBaseUrl ? (
          <>
            <dt className="text-ink-secondary">URL base</dt>
            <dd className="font-mono text-xs leading-5 break-all text-ink max-sm:mb-1.5">
              {evaluation.apiBaseUrl}
            </dd>
          </>
        ) : null}
        <dt className="text-ink-secondary">Criada em</dt>
        <dd className="font-mono text-xs leading-5 text-ink tabular-nums max-sm:mb-1.5">
          {formatDateTime(evaluation.createdAt)}
        </dd>
        {elapsed === null ? null : (
          <>
            <dt className="text-ink-secondary">Tempo de execução</dt>
            <dd className="font-mono text-xs leading-5 text-ink tabular-nums">
              {formatDuration(elapsed)}
            </dd>
          </>
        )}
      </dl>
    </aside>
  )
}
