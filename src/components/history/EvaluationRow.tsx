import type { EvaluationListItem } from '../../types'
import { formatDateTime } from '../../utils/format'
import { TYPE_LABELS } from '../../utils/labels'
import { evaluationPath } from '../../utils/routes'
import { MiddleTruncate } from '../ui/MiddleTruncate'
import { StatusBadge } from '../ui/StatusBadge'
import { TextLink } from '../ui/TextLink'
import { TypeStrip } from '../ui/TypeStrip'
import { ScoreValue } from './ScoreValue'

interface EvaluationRowProps {
  item: EvaluationListItem
}

export function EvaluationRow({ item }: EvaluationRowProps) {
  const createdAt = formatDateTime(item.createdAt)
  const type = TYPE_LABELS[item.evaluationType]

  return (
    <li className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 border-t border-border px-4 py-3 transition-colors duration-150 hover:bg-surface-raised">
      <span className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="font-medium text-ink">{type}</span>
        <TypeStrip type={item.evaluationType} className="w-10 max-sm:hidden" />
        <StatusBadge status={item.status} />
      </span>
      <span className="justify-self-end">
        <ScoreValue score={item.finalScore} />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5 font-mono text-xs text-ink-secondary">
        <MiddleTruncate text={item.openApiUrl} />
        <span className="shrink-0 tabular-nums">{createdAt}</span>
      </span>
      <span className="justify-self-end">
        <TextLink
          to={evaluationPath(item.id)}
          label={`Abrir avaliação ${type.toLowerCase()} de ${createdAt}`}
          className="after:absolute after:inset-0"
        >
          Abrir
        </TextLink>
      </span>
    </li>
  )
}
