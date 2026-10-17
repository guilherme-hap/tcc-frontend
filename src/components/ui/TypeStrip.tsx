import type { EvaluationType, PillarName } from '../../types'
import { PILLARS_BY_TYPE } from '../../utils/labels'
import { PILLAR_BG } from '../../utils/tones'

const SLOTS: PillarName[] = ['contract', 'performance', 'security']

interface TypeStripProps {
  type: EvaluationType
  className?: string
}

export function TypeStrip({ type, className = '' }: TypeStripProps) {
  const included = PILLARS_BY_TYPE[type]

  return (
    <span aria-hidden="true" className={`flex h-1.5 gap-0.5 ${className}`}>
      {SLOTS.map((pillar) => (
        <span
          key={pillar}
          className={`flex-1 rounded-xs ${included.includes(pillar) ? PILLAR_BG[pillar] : 'bg-idle'}`}
        />
      ))}
    </span>
  )
}
