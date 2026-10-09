import { FileText, Gauge, Layers, Shield, type LucideIcon } from 'lucide-react'
import type { EvaluationType, PillarName } from '../types'

export const PILLAR_ICONS: Record<PillarName, LucideIcon> = {
  contract: FileText,
  performance: Gauge,
  security: Shield,
}

export const TYPE_ICONS: Record<EvaluationType, LucideIcon> = {
  full: Layers,
  ...PILLAR_ICONS,
}
