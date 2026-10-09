import type { EvaluationRecord, IFailedPillar } from '../../types'
import { PILLAR_LABELS } from '../../utils/labels'
import { Notice } from '../ui/Notice'

const ALL_PILLARS_FAILED_CODE = 'EVALUATION_PILLARS_FAILED'

interface FailedPillarListProps {
  pillars: IFailedPillar[]
}

function FailedPillarList({ pillars }: FailedPillarListProps) {
  return (
    <ul className="mt-2 flex flex-col gap-1">
      {pillars.map((failed) => (
        <li key={failed.pillar}>
          <span className="font-medium text-ink">{PILLAR_LABELS[failed.pillar]}:</span>{' '}
          {failed.error}
        </li>
      ))}
    </ul>
  )
}

interface StatusNoticeProps {
  evaluation: EvaluationRecord
}

export function StatusNotice({ evaluation }: StatusNoticeProps) {
  const { status, failedPillars, errorMessage, errorCode } = evaluation

  if (status === 'PENDING') {
    return <Notice busy title="Avaliação na fila. Esta página atualiza sozinha." />
  }

  if (status === 'RUNNING') {
    return (
      <Notice busy title="Avaliação em execução. Esta página atualiza sozinha.">
        O teste de carga roda um endpoint por vez e pode levar alguns minutos.
      </Notice>
    )
  }

  if (status === 'FAILED') {
    if (errorCode === ALL_PILLARS_FAILED_CODE && failedPillars && failedPillars.length > 0) {
      return (
        <Notice tone="error" title="A avaliação falhou.">
          <p>Nenhum pilar foi concluído.</p>
          <FailedPillarList pillars={failedPillars} />
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
        {failedPillars && failedPillars.length > 0 ? (
          <FailedPillarList pillars={failedPillars} />
        ) : null}
      </Notice>
    )
  }

  return null
}
