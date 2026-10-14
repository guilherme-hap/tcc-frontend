import type { KeyboardEvent, ReactNode } from 'react'
import { Check, Clock, LoaderCircle, Minus, SkipForward, X, type LucideIcon } from 'lucide-react'
import type { EvaluationRecord, PillarName } from '../../types'
import { formatNumber } from '../../utils/format'
import { FULL_EXECUTION_GROUPS, PILLAR_LABELS } from '../../utils/labels'
import { findStep } from '../../utils/steps'
import { PILLAR_BG } from '../../utils/tones'
import { Icon } from '../ui/Icon'
import { FOCUS_RING, OVERLINE } from '../ui/classes'
import {
  hasPillarResult,
  pillarHeadline,
  pillarStateLabel,
} from './pillarSummary'
import { sectionPanelId, sectionTabId, type SectionId } from './sections'

type StepState = 'done' | 'failed' | 'skipped' | 'running' | 'waiting' | 'idle'

const STEP_ICONS: Record<StepState, LucideIcon> = {
  done: Check,
  failed: X,
  skipped: SkipForward,
  running: LoaderCircle,
  waiting: Clock,
  idle: Minus,
}

const STEP_CLASSES: Record<StepState, string> = {
  done: 'border-success text-success',
  failed: 'border-error text-error',
  skipped: 'border-warning text-warning',
  running: 'border-accent-ink text-accent-ink',
  waiting: 'border-border-control text-ink-secondary',
  idle: 'border-border-control text-ink-muted',
}

const MOVES: Record<string, (index: number, count: number) => number> = {
  ArrowRight: (index, count) => (index + 1) % count,
  ArrowDown: (index, count) => (index + 1) % count,
  ArrowLeft: (index, count) => (index - 1 + count) % count,
  ArrowUp: (index, count) => (index - 1 + count) % count,
  Home: () => 0,
  End: (_index, count) => count - 1,
}

const TAB =
  'flex shrink-0 cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2 text-left transition-colors duration-150 lg:w-full'

function tabClasses(selected: boolean, highlighted: boolean): string {
  if (selected) return `${TAB} border-border-control bg-surface-raised text-ink ${FOCUS_RING}`
  if (highlighted) return `${TAB} border-border-hover bg-surface-raised text-ink ${FOCUS_RING}`
  return `${TAB} border-border bg-bg text-ink-secondary hover:border-border-hover hover:text-ink ${FOCUS_RING}`
}

function stepState(evaluation: EvaluationRecord, pillars: PillarName[], isActive: boolean): StepState {
  const steps = pillars.map((pillar) => findStep(evaluation, pillar))
  const statuses = steps.flatMap((step) => (step ? [step.status] : []))

  if (statuses.length === pillars.length) {
    if (statuses.includes('FAILED')) return 'failed'
    if (statuses.some((status) => status === 'SKIPPED' || status === 'INTERRUPTED')) {
      return 'skipped'
    }
    if (statuses.every((status) => status === 'COMPLETED')) return 'done'
    if (statuses.includes('RUNNING') || statuses.includes('COMPLETED')) return 'running'
    return isActive ? 'waiting' : 'idle'
  }
  if (pillars.every((pillar) => hasPillarResult(evaluation, pillar))) return 'done'
  return isActive ? 'running' : 'idle'
}

interface TabProps {
  section: SectionId
  selected: boolean
  highlighted?: boolean
  onSelect: (section: SectionId) => void
  onHighlight?: (active: boolean) => void
  children: ReactNode
}

function Tab({ section, selected, highlighted = false, onSelect, onHighlight, children }: TabProps) {
  return (
    <button
      type="button"
      role="tab"
      id={sectionTabId(section)}
      aria-controls={selected ? sectionPanelId(section) : undefined}
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
      onClick={() => onSelect(section)}
      onMouseEnter={onHighlight ? () => onHighlight(true) : undefined}
      onMouseLeave={onHighlight ? () => onHighlight(false) : undefined}
      onFocus={onHighlight ? () => onHighlight(true) : undefined}
      onBlur={onHighlight ? () => onHighlight(false) : undefined}
      className={tabClasses(selected, highlighted)}
    >
      {children}
    </button>
  )
}

interface ResultNavProps {
  evaluation: EvaluationRecord
  isActive: boolean
  section: SectionId
  onSectionChange: (section: SectionId) => void
  highlighted: PillarName | null
  onHighlight: (pillar: PillarName | null) => void
}

export function ResultNav({
  evaluation,
  isActive,
  section,
  onSectionChange,
  highlighted,
  onHighlight,
}: ResultNavProps) {
  const sections: SectionId[] = [
    'overview',
    ...FULL_EXECUTION_GROUPS.flatMap((group) => group.pillars),
    ...(evaluation.scoring ? (['scoring'] as const) : []),
  ]

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const move = MOVES[event.key]
    if (!move) return

    const next = sections[move(sections.indexOf(section), sections.length)]

    event.preventDefault()
    onSectionChange(next)
    event.currentTarget.querySelector<HTMLButtonElement>(`#${sectionTabId(next)}`)?.focus()
  }

  return (
    <div
      role="tablist"
      aria-label="Seções do resultado"
      onKeyDown={handleKeyDown}
      className="relative -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 max-lg:order-last [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-col lg:gap-1.5 lg:overflow-visible lg:px-0 lg:pb-0"
    >
      <Tab section="overview" selected={section === 'overview'} onSelect={onSectionChange}>
        <span className="font-semibold">Visão geral</span>
      </Tab>
      {FULL_EXECUTION_GROUPS.map((group) => {
        const state = stepState(evaluation, group.pillars, isActive)

        return (
          <div
            key={group.label}
            role="presentation"
            className="contents lg:relative lg:mt-2 lg:ml-2 lg:flex lg:flex-col lg:gap-1.5 lg:border-l lg:border-border-hover lg:pl-5"
          >
            <p aria-hidden="true" className={`hidden lg:block ${OVERLINE}`}>
              <span
                className={`absolute top-0 -left-2 inline-flex size-4 items-center justify-center rounded-full border bg-surface ${STEP_CLASSES[state]}`}
              >
                <Icon
                  icon={STEP_ICONS[state]}
                  size={10}
                  className={state === 'running' ? 'animate-spin motion-reduce:animate-none' : ''}
                />
              </span>
              {group.label}
            </p>
            {group.pillars.map((pillar) => {
              const score = evaluation.pillarScores?.[pillar]
              const summary =
                pillarHeadline(evaluation, pillar) ?? pillarStateLabel(evaluation, pillar, isActive)

              return (
                <Tab
                  key={pillar}
                  section={pillar}
                  selected={section === pillar}
                  highlighted={highlighted === pillar}
                  onSelect={onSectionChange}
                  onHighlight={(active) => onHighlight(active ? pillar : null)}
                >
                  <span
                    aria-hidden="true"
                    className={`size-2.5 shrink-0 rounded-xs ${PILLAR_BG[pillar]}`}
                  />
                  <span className="font-semibold text-ink">{PILLAR_LABELS[pillar]}</span>
                  <span className="min-w-0 flex-1 truncate text-right text-[13px] text-ink-secondary max-lg:hidden">
                    {summary}
                  </span>
                  {score !== undefined ? (
                    <span className="num text-xl leading-6 text-ink lg:min-w-10 lg:text-right">
                      {formatNumber(score)}
                    </span>
                  ) : (
                    <span className="sr-only lg:hidden">{summary}</span>
                  )}
                </Tab>
              )
            })}
          </div>
        )
      })}
      {evaluation.scoring ? (
        <Tab section="scoring" selected={section === 'scoring'} onSelect={onSectionChange}>
          <span className="font-semibold">Parâmetros de cálculo</span>
        </Tab>
      ) : null}
    </div>
  )
}
