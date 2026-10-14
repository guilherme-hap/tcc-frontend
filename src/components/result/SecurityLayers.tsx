import { useState } from 'react'
import type { EvaluationRecord } from '../../types'
import { securityScoreParts } from '../../utils/scoreParts'
import { ScoreContributions } from './ScoreContributions'

interface SecurityLayersProps {
  evaluation: EvaluationRecord
}

export function SecurityLayers({ evaluation }: SecurityLayersProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const { scoreBreakdown, securityResult } = evaluation
  const parts = securityResult ? securityScoreParts(scoreBreakdown, securityResult) : null

  if (!parts) return null

  return <ScoreContributions parts={parts} activeId={activeId} onActiveChange={setActiveId} />
}
