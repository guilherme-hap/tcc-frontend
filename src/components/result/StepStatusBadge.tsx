import { Ban, Check, Clock, LoaderCircle, SkipForward, X, type LucideIcon } from 'lucide-react'
import type { EvaluationStepStatus } from '../../types'
import { STEP_STATUS_LABELS } from '../../utils/labels'
import { Badge, type BadgeTone } from '../ui/Badge'
import { Icon } from '../ui/Icon'

const STEP_STATUS_TONES: Record<EvaluationStepStatus, BadgeTone> = {
  PENDING: 'neutral',
  RUNNING: 'accent',
  COMPLETED: 'success',
  FAILED: 'error',
  SKIPPED: 'warning',
  INTERRUPTED: 'warning',
}

const STEP_STATUS_ICONS: Record<EvaluationStepStatus, LucideIcon> = {
  PENDING: Clock,
  RUNNING: LoaderCircle,
  COMPLETED: Check,
  FAILED: X,
  SKIPPED: SkipForward,
  INTERRUPTED: Ban,
}

interface StepStatusBadgeProps {
  status: EvaluationStepStatus
}

export function StepStatusBadge({ status }: StepStatusBadgeProps) {
  if (status === 'COMPLETED') {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-success">
        <Icon icon={STEP_STATUS_ICONS[status]} size={14} />
        {STEP_STATUS_LABELS[status]}
      </span>
    )
  }

  return (
    <Badge
      tone={STEP_STATUS_TONES[status]}
      icon={STEP_STATUS_ICONS[status]}
      spin={status === 'RUNNING'}
    >
      {STEP_STATUS_LABELS[status]}
    </Badge>
  )
}
