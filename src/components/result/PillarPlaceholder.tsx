import type { EvaluationRecord, PillarName } from '../../types'
import { PILLAR_LABELS } from '../../utils/labels'
import { findStep } from '../../utils/steps'
import { Notice } from '../ui/Notice'

interface PillarPlaceholderProps {
  pillar: PillarName
  evaluation: EvaluationRecord
  isActive: boolean
}

export function PillarPlaceholder({ pillar, evaluation, isActive }: PillarPlaceholderProps) {
  const label = PILLAR_LABELS[pillar]
  const step = findStep(evaluation, pillar)

  if (step?.status === 'FAILED') {
    return (
      <Notice tone="error" title={`${label}: o pilar falhou.`}>
        {step.error}
      </Notice>
    )
  }

  if (step?.status === 'SKIPPED') {
    return (
      <Notice tone="warning" title={`${label}: o pilar foi pulado.`}>
        {step.error}
      </Notice>
    )
  }

  if (step?.status === 'INTERRUPTED') {
    return (
      <Notice tone="warning" title={`${label}: o pilar foi interrompido.`}>
        A avaliação terminou antes de este pilar concluir.
      </Notice>
    )
  }

  if (isActive) {
    return (
      <Notice
        busy
        title={
          step?.status === 'PENDING'
            ? `${label}: aguardando a vez de rodar.`
            : `${label}: o pilar ainda não terminou.`
        }
      >
        O resultado aparece aqui assim que o pilar concluir.
      </Notice>
    )
  }

  return <Notice title={`${label}: não há resultado para mostrar.`} />
}
