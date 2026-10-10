import { Check, Clock, LoaderCircle, TriangleAlert, X, type LucideIcon } from 'lucide-react'
import type { EvaluationStatus } from '../../types'
import { STATUS_LABELS } from '../../utils/labels'
import { Badge, type BadgeTone } from './Badge'

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

interface StatusBadgeProps {
  status: EvaluationStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge tone={STATUS_TONES[status]} icon={STATUS_ICONS[status]} spin={status === 'RUNNING'}>
      {STATUS_LABELS[status]}
    </Badge>
  )
}
