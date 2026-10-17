import { ArrowRight } from 'lucide-react'
import type { EvaluationRecord, IEvaluationStep } from '../../types'
import { useNow } from '../../hooks'
import { formatDuration } from '../../utils/format'
import { PILLAR_LABELS } from '../../utils/labels'
import { groupByStage, noticeListsStepErrors, stepDuration } from '../../utils/steps'
import { PILLAR_BG } from '../../utils/tones'
import { Icon } from '../ui/Icon'
import { CARD, FOCUS_RING, OVERLINE } from '../ui/classes'
import { PerformanceProgress } from './PerformanceProgress'
import { StepStatusBadge } from './StepStatusBadge'

interface TimeWindow {
  origin: number
  span: number
}

function timeWindow(evaluation: EvaluationRecord, now: number, isActive: boolean): TimeWindow | null {
  const steps = evaluation.steps ?? []
  const starts = steps.flatMap((step) => (step.startedAt ? [Date.parse(step.startedAt)] : []))
  const ends = steps.flatMap((step) => (step.finishedAt ? [Date.parse(step.finishedAt)] : []))
  const origin = evaluation.startedAt ? Date.parse(evaluation.startedAt) : Math.min(...starts)
  if (!Number.isFinite(origin) || starts.length === 0) return null

  const end = evaluation.finishedAt
    ? Date.parse(evaluation.finishedAt)
    : Math.max(origin, ...ends, isActive ? now : origin)

  return { origin, span: Math.max(1, end - origin) }
}

function barStyle(step: IEvaluationStep, frame: TimeWindow, now: number) {
  if (!step.startedAt) return null

  const start = Date.parse(step.startedAt) - frame.origin
  const open = step.status === 'RUNNING' ? now : frame.origin + frame.span
  const end = (step.finishedAt ? Date.parse(step.finishedAt) : open) - frame.origin
  const left = Math.min(100, Math.max(0, (start / frame.span) * 100))
  const width = Math.min(100 - left, Math.max(0, ((end - start) / frame.span) * 100))

  return { left: `${left}%`, width: `${width}%` }
}

interface StepRowProps {
  step: IEvaluationStep
  evaluation: EvaluationRecord
  frame: TimeWindow | null
  now: number
  receivedAt: number
  onOpenPerformance?: () => void
}

function StepRow({ step, evaluation, frame, now, receivedAt, onOpenPerformance }: StepRowProps) {
  const closedAt = evaluation.finishedAt ? Date.parse(evaluation.finishedAt) : now
  const duration = stepDuration(step, step.status === 'RUNNING' ? now : closedAt)
  const bar = frame ? barStyle(step, frame, now) : null
  const progress = step.status === 'RUNNING' ? step.progress : undefined

  return (
    <li className="flex min-w-0 flex-col gap-1.5">
      <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
        <span aria-hidden="true" className={`size-2.5 shrink-0 rounded-xs ${PILLAR_BG[step.pillar]}`} />
        <span className="font-semibold text-ink">{PILLAR_LABELS[step.pillar]}</span>
        <StepStatusBadge status={step.status} />
        <span className="ml-auto font-mono text-xs text-ink-secondary tabular-nums">
          {duration === null ? '—' : formatDuration(duration)}
        </span>
      </div>
      <div
        aria-hidden="true"
        className={`relative h-2.5 rounded-xs ${step.startedAt ? 'bg-idle' : 'border border-dashed border-border-hover'}`}
      >
        {bar ? (
          <span
            className={`absolute inset-y-0 min-w-0.5 rounded-xs ${PILLAR_BG[step.pillar]} ${step.status === 'RUNNING' ? 'animate-pulse motion-reduce:animate-none' : ''}`}
            style={bar}
          />
        ) : null}
      </div>
      {step.error && !noticeListsStepErrors(evaluation) ? (
        <p className={`text-sm ${step.status === 'FAILED' ? 'text-error' : 'text-warning'}`}>
          {step.error}
        </p>
      ) : step.status === 'INTERRUPTED' ? (
        <p className="text-sm text-warning">A avaliação terminou antes desta etapa terminar.</p>
      ) : null}
      {progress ? (
        <div className="flex min-w-0 flex-col gap-2 rounded-md border border-border bg-well p-3">
          <PerformanceProgress
            progress={progress}
            targets={evaluation.targets}
            receivedAt={receivedAt}
            now={now}
            limitedRequests={evaluation.requestSettings?.loadTestOptions?.maxRequests !== undefined}
          />
          {onOpenPerformance ? (
            <button
              type="button"
              onClick={onOpenPerformance}
              className={`inline-flex cursor-pointer items-center gap-1.5 self-start rounded-sm text-sm font-medium text-accent-ink transition-colors duration-150 hover:text-ink ${FOCUS_RING}`}
            >
              Acompanhar o teste em Desempenho
              <Icon icon={ArrowRight} size={14} />
            </button>
          ) : null}
        </div>
      ) : null}
    </li>
  )
}

interface StepTimelineProps {
  evaluation: EvaluationRecord
  isActive: boolean
  receivedAt: number
  onOpenPerformance?: () => void
  className?: string
}

export function StepTimeline({
  evaluation,
  isActive,
  receivedAt,
  onOpenPerformance,
  className = '',
}: StepTimelineProps) {
  const now = useNow(isActive)
  const steps = evaluation.steps

  if (!steps || steps.length === 0) return null

  const stages = groupByStage(steps)
  const frame = timeWindow(evaluation, now, isActive)

  return (
    <section className={`flex min-w-0 flex-col gap-4 border-border p-4 ${CARD} ${className}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className={OVERLINE}>Linha do tempo</h3>
        {stages.length > 1 ? (
          <span className="text-xs text-ink-secondary">
            Etapas do mesmo estágio rodam em paralelo; os estágios, em sequência.
          </span>
        ) : null}
      </div>
      <ol className="flex flex-col gap-6">
        {stages.map(({ stage, steps: stageSteps }) => (
          <li key={stage} className="flex min-w-0 flex-col gap-3">
            {stages.length > 1 ? (
              <p className="text-xs font-semibold text-ink-secondary">
                Estágio {stage + 1}
                {stageSteps.length > 1 ? ' · em paralelo' : ''}
              </p>
            ) : null}
            <ul className="flex flex-col gap-4">
              {stageSteps.map((step) => (
                <StepRow
                  key={step.pillar}
                  step={step}
                  evaluation={evaluation}
                  frame={frame}
                  now={now}
                  receivedAt={receivedAt}
                  onOpenPerformance={onOpenPerformance}
                />
              ))}
            </ul>
          </li>
        ))}
      </ol>
      {frame ? (
        <div
          aria-hidden="true"
          className="flex justify-between border-t border-border pt-2 font-mono text-xs text-ink-muted tabular-nums"
        >
          <span>0 s</span>
          <span>{formatDuration(frame.span)}</span>
        </div>
      ) : null}
    </section>
  )
}
