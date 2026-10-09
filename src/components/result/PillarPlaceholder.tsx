import type { EvaluationRecord, PillarName } from '../../types'
import { PILLAR_LABELS } from '../../utils/labels'
import { Notice } from '../ui/Notice'

interface PillarPlaceholderProps {
  pillar: PillarName
  evaluation: EvaluationRecord
  isActive: boolean
}

export function PillarPlaceholder({ pillar, evaluation, isActive }: PillarPlaceholderProps) {
  const label = PILLAR_LABELS[pillar]
  const failure = evaluation.failedPillars?.find((item) => item.pillar === pillar)

  if (failure) {
    return (
      <Notice tone="warning" title={`${label}: o pilar não foi concluído.`}>
        {failure.error}
      </Notice>
    )
  }

  if (isActive) {
    return (
      <Notice busy title={`${label}: o pilar ainda não terminou.`}>
        O resultado aparece aqui assim que o pilar concluir.
      </Notice>
    )
  }

  return <Notice title={`${label}: não há resultado para mostrar.`} />
}
