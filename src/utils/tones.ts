import type { PillarName, SecurityCheckStatus, Severity } from '../types'

export const PILLAR_BG: Record<PillarName, string> = {
  contract: 'bg-pillar-contract',
  performance: 'bg-pillar-performance',
  security: 'bg-pillar-security',
}

export const PILLAR_STROKE: Record<PillarName, string> = {
  contract: 'stroke-pillar-contract',
  performance: 'stroke-pillar-performance',
  security: 'stroke-pillar-security',
}

export const CHECK_STATUS_MARK: Record<SecurityCheckStatus, string> = {
  pass: 'bg-success',
  warning: 'bg-warning',
  missing: 'border border-error bg-error-dim',
  error: 'bg-error',
}

export const SEVERITY_BG: Record<Severity, string> = {
  Error: 'bg-error',
  Warning: 'bg-warning',
  Info: 'bg-accent-ink',
  Hint: 'bg-ink-muted',
  Unknown: 'bg-ink-muted',
}
