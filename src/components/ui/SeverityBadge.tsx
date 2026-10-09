import { CircleX, Info, Lightbulb, Minus, TriangleAlert, type LucideIcon } from 'lucide-react'
import type { Severity } from '../../types'
import { SEVERITY_LABELS } from '../../utils/labels'
import { Badge, type BadgeTone } from './Badge'

const SEVERITY_TONES: Record<Severity, BadgeTone> = {
  Error: 'error',
  Warning: 'warning',
  Info: 'data',
  Hint: 'neutral',
  Unknown: 'neutral',
}

const SEVERITY_ICONS: Record<Severity, LucideIcon> = {
  Error: CircleX,
  Warning: TriangleAlert,
  Info: Info,
  Hint: Lightbulb,
  Unknown: Minus,
}

interface SeverityBadgeProps {
  severity: Severity
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  return (
    <Badge tone={SEVERITY_TONES[severity]} icon={SEVERITY_ICONS[severity]}>
      {SEVERITY_LABELS[severity]}
    </Badge>
  )
}
