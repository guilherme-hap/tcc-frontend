import { Check, Clock, LoaderCircle, TriangleAlert, X, type LucideIcon } from 'lucide-react'
import type { EvaluationRecord, EvaluationStatus } from '../../types'
import { formatDateTime } from '../../utils/format'
import { STATUS_LABELS, TYPE_TITLES } from '../../utils/labels'
import { Badge, type BadgeTone } from '../ui/Badge'

const STATUS_TONES: Record<EvaluationStatus, BadgeTone> = {
  PENDING: 'neutral',
  RUNNING: 'accent',
  COMPLETED: 'success',
  PARTIAL: 'warning',
  FAILED: 'error',
}

const STATUS_ICONS: Record<EvaluationStatus, LucideIcon> = {
  PENDING: Clock,
  RUNNING: LoaderCircle,
  COMPLETED: Check,
  PARTIAL: TriangleAlert,
  FAILED: X,
}

interface ResultHeaderProps {
  evaluation: EvaluationRecord
}

export function ResultHeader({ evaluation }: ResultHeaderProps) {
  const { status } = evaluation

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl leading-8 font-semibold tracking-[-0.01em] text-ink">
          {TYPE_TITLES[evaluation.evaluationType]}
        </h1>
        <Badge tone={STATUS_TONES[status]} icon={STATUS_ICONS[status]} spin={status === 'RUNNING'}>
          {STATUS_LABELS[status]}
        </Badge>
      </div>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-1 text-[13px] sm:grid-cols-[auto_1fr] sm:gap-y-1.5">
        <dt className="text-ink-secondary">Especificação</dt>
        <dd className="font-mono break-all text-ink max-sm:mb-1.5">{evaluation.openApiUrl}</dd>
        {evaluation.apiBaseUrl ? (
          <>
            <dt className="text-ink-secondary">URL base</dt>
            <dd className="font-mono break-all text-ink max-sm:mb-1.5">{evaluation.apiBaseUrl}</dd>
          </>
        ) : null}
        <dt className="text-ink-secondary">Criada em</dt>
        <dd className="font-mono text-ink tabular-nums">{formatDateTime(evaluation.createdAt)}</dd>
      </dl>
    </div>
  )
}
