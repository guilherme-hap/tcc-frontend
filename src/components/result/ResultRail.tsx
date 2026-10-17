import { useState, type ReactNode } from 'react'
import { ArrowLeft, ChevronRight, Link2, Lock, type LucideIcon } from 'lucide-react'
import { useWideLayout } from '../../hooks'
import type { EvaluationRecord, EvaluationVisibility, PillarName } from '../../types'
import { formatDateTime, formatDuration } from '../../utils/format'
import { TYPE_TITLES, VISIBILITY_LABELS } from '../../utils/labels'
import { HISTORY_PATH, HOME_PATH } from '../../utils/routes'
import { finalScoreParts, securityScoreParts } from '../../utils/scoreParts'
import { PILLAR_STROKE } from '../../utils/tones'
import { Badge, type BadgeTone } from '../ui/Badge'
import { StatusBadge } from '../ui/StatusBadge'
import { Icon } from '../ui/Icon'
import { MetaList, type MetaItem } from '../ui/MetaList'
import { TextLink } from '../ui/TextLink'
import { OVERLINE, PAGE_TITLE, RAIL } from '../ui/classes'
import { GateBadge } from './GateBadge'
import { GateVerdict } from './GateVerdict'
import { ResultStats } from './ResultStats'
import { ScoreContributions } from './ScoreContributions'
import { ScoreRing } from './ScoreRing'
import { SegmentedScoreRing } from './SegmentedScoreRing'

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

interface EvaluationMetaProps {
  evaluation: EvaluationRecord
  className: string
}

function EvaluationMeta({ evaluation, className }: EvaluationMetaProps) {
  const elapsed = executionTime(evaluation)
  const items: MetaItem[] = [{ label: 'Especificação', value: evaluation.openApiUrl, mono: true }]

  if (evaluation.apiBaseUrl) {
    items.push({ label: 'URL base', value: evaluation.apiBaseUrl, mono: true })
  }
  items.push({ label: 'Criada em', value: formatDateTime(evaluation.createdAt), mono: true })
  if (elapsed !== null) {
    items.push({ label: 'Tempo de execução', value: formatDuration(elapsed), mono: true })
  }

  return <MetaList items={items} className={className} />
}

interface ResultRailProps {
  evaluation: EvaluationRecord
  isActive: boolean
  hasAccount: boolean
  nav: ReactNode
  highlighted: PillarName | null
  onHighlight: (pillar: PillarName | null) => void
}

export function ResultRail({
  evaluation,
  isActive,
  hasAccount,
  nav,
  highlighted,
  onHighlight,
}: ResultRailProps) {
  const wide = useWideLayout()
  const [activePart, setActivePart] = useState<string | null>(null)
  const { evaluationType, finalScore, visibility, passed, scoreBreakdown, securityResult } =
    evaluation
  const isFull = evaluationType === 'full'
  const parts = isFull ? finalScoreParts(scoreBreakdown) : null
  const layers =
    evaluationType === 'security' && securityResult && finalScore !== null
      ? securityScoreParts(scoreBreakdown, securityResult)
      : null

  return (
    <aside
      aria-label="Resumo da avaliação"
      className={RAIL}
    >
      <div className="flex flex-col gap-2">
        <TextLink
          to={hasAccount ? HISTORY_PATH : HOME_PATH}
          tone="muted"
          leadingIcon={ArrowLeft}
          className="self-start"
        >
          {hasAccount ? 'Histórico' : 'Início'}
        </TextLink>
        <h1 className={PAGE_TITLE}>
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
        wide ? (
          nav
        ) : null
      ) : layers ? (
        <section className="flex flex-col gap-2">
          <h2 className={OVERLINE}>Composição da nota</h2>
          <ScoreContributions parts={layers} activeId={activePart} onActiveChange={setActivePart} />
        </section>
      ) : (
        <ResultStats evaluation={evaluation} isActive={isActive} />
      )}
      {wide ? (
        <EvaluationMeta
          evaluation={evaluation}
          className="border-t border-border pt-4 lg:mt-auto"
        />
      ) : (
        <details className="group border-t border-border">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-sm text-sm font-medium text-ink-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus [&::-webkit-details-marker]:hidden">
            <Icon
              icon={ChevronRight}
              size={14}
              className="transition-transform duration-150 group-open:rotate-90"
            />
            Dados da avaliação
          </summary>
          <EvaluationMeta evaluation={evaluation} className="pb-1" />
        </details>
      )}
    </aside>
  )
}
