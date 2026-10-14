import { CircleCheck, CircleX } from 'lucide-react'
import { GATE_LABELS } from '../../utils/labels'
import { Badge } from '../ui/Badge'

interface GateBadgeProps {
  passed: boolean
}

export function GateBadge({ passed }: GateBadgeProps) {
  return (
    <Badge tone={passed ? 'success' : 'error'} icon={passed ? CircleCheck : CircleX}>
      {GATE_LABELS[passed ? 'passed' : 'failed']}
    </Badge>
  )
}
