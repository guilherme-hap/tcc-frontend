import { CircleCheck, CircleX } from 'lucide-react'
import type { EvaluationRecord } from '../../types'
import { formatNumber } from '../../utils/format'
import { GATE_LABELS } from '../../utils/labels'
import { Icon } from '../ui/Icon'

function describeVerdict({ passed, status }: EvaluationRecord, minimum: string): string {
  if (passed) return `a nota final atingiu a nota mínima de ${minimum}.`
  if (status === 'COMPLETED') return `a nota final ficou abaixo da nota mínima de ${minimum}.`
  return `sem nota final, a nota mínima de ${minimum} não é atingida.`
}

interface GateVerdictProps {
  evaluation: EvaluationRecord
}

export function GateVerdict({ evaluation }: GateVerdictProps) {
  const minScore = evaluation.requestSettings?.minScore
  const { passed } = evaluation

  if (minScore === undefined) return null

  const minimum = formatNumber(minScore)

  if (passed === null) {
    return (
      <p className="text-sm text-ink-secondary">
        Nota mínima do pedido: <span className="font-mono text-ink tabular-nums">{minimum}</span>.
        A aprovação sai quando a avaliação terminar.
      </p>
    )
  }

  return (
    <p className="flex items-start gap-2 text-sm text-ink-secondary">
      <span className={`flex h-5 items-center ${passed ? 'text-success' : 'text-error'}`}>
        <Icon icon={passed ? CircleCheck : CircleX} />
      </span>
      <span>
        <span className={`font-medium ${passed ? 'text-success' : 'text-error'}`}>
          {GATE_LABELS[passed ? 'passed' : 'failed']}
        </span>
        : {describeVerdict(evaluation, minimum)}
      </span>
    </p>
  )
}
