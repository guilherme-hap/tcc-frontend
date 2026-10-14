import { Check, Minus, TriangleAlert, X, type LucideIcon } from 'lucide-react'
import type { SecurityCheckStatus } from '../../types'
import { CHECK_STATUS_LABELS } from '../../utils/labels'
import { Badge, type BadgeTone } from '../ui/Badge'

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

interface CheckStatusBadgeProps {
  status: SecurityCheckStatus
}

export function CheckStatusBadge({ status }: CheckStatusBadgeProps) {
  return (
    <Badge tone={STATUS_TONES[status]} icon={STATUS_ICONS[status]}>
      {CHECK_STATUS_LABELS[status]}
    </Badge>
  )
}
