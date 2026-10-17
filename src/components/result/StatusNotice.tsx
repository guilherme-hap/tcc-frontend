import type { EvaluationRecord, IEvaluationStep } from '../../types'
import { PILLARS_BY_TYPE, PILLAR_LABELS } from '../../utils/labels'
import { ALL_PILLARS_FAILED_CODE, stepsWithError } from '../../utils/steps'
import { Notice } from '../ui/Notice'

interface StepErrorListProps {
  steps: IEvaluationStep[]
}

function StepErrorList({ steps }: StepErrorListProps) {
  return (
    <ul className="mt-2 flex flex-col gap-1">
      {steps.map((step) => (
        <li key={step.pillar}>
          <span className="font-medium text-ink">{PILLAR_LABELS[step.pillar]}:</span>{' '}
          {step.error}
        </li>
      ))}
    </ul>
  )
}

interface StatusNoticeProps {
  evaluation: EvaluationRecord
}

export function StatusNotice({ evaluation }: StatusNoticeProps) {
  const { evaluationType, status, errorMessage, errorCode } = evaluation
  const failedSteps = stepsWithError(evaluation)

  if (status === 'PENDING') {
    return <Notice busy title="Avaliação na fila. Esta página atualiza sozinha." />
  }

  if (status === 'RUNNING') {
    return (
      <Notice busy title="Avaliação em execução. Esta página atualiza sozinha.">
        {PILLARS_BY_TYPE[evaluationType].includes('performance')
          ? 'Cada pilar aparece assim que termina. O teste de carga roda um endpoint por vez e pode levar alguns minutos.'
          : 'O resultado aparece assim que o pilar terminar.'}
      </Notice>
    )
  }

  if (status === 'FAILED') {
    if (errorCode === ALL_PILLARS_FAILED_CODE && failedSteps.length > 0) {
      return (
        <Notice tone="error" title="A avaliação falhou.">
          <p>Nenhum pilar foi concluído.</p>
          <StepErrorList steps={failedSteps} />
        </Notice>
      )
    }

    return (
      <Notice tone="error" title="A avaliação falhou.">
        {errorMessage ?? 'Nenhum pilar pôde ser concluído.'}
      </Notice>
    )
  }

  if (status === 'PARTIAL') {
    return (
      <Notice tone="warning" title="Avaliação parcial: a nota final não foi calculada.">
        <p>
          Os pesos não são redistribuídos entre os pilares que concluíram, para que a nota final
          tenha sempre o mesmo significado.
        </p>
        {failedSteps.length > 0 ? <StepErrorList steps={failedSteps} /> : null}
      </Notice>
    )
  }

  return (
    <p role="status" className="sr-only">
      Avaliação concluída.
    </p>
  )
}
