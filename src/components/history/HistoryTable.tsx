import type { EvaluationListItem } from '../../types'
import { formatDateTime, formatScore } from '../../utils/format'
import { TYPE_LABELS } from '../../utils/labels'
import { evaluationPath } from '../../utils/routes'
import { StatusBadge } from '../ui/StatusBadge'
import { TextLink } from '../ui/TextLink'
import { OVERLINE } from '../ui/classes'

const HEAD_CELL = `px-2 py-3 text-left first:pl-5 last:pr-5 ${OVERLINE}`
const BODY_CELL = 'px-2 py-2.5 first:pl-5 last:pr-5'

interface ScoreCellProps {
  score: number | null
}

function ScoreCell({ score }: ScoreCellProps) {
  if (score === null) return <span className="text-[13px] text-ink-secondary">Sem nota</span>

  return (
    <span className="flex items-center gap-2.5">
      <span className="w-10 shrink-0 font-mono text-[13px] font-semibold text-ink tabular-nums">
        {formatScore(score)}
      </span>
      <span
        aria-hidden="true"
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-raised"
      >
        <span
          className="block h-full rounded-full bg-measure"
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </span>
    </span>
  )
}

interface HistoryTableProps {
  items: EvaluationListItem[]
  isRefreshing: boolean
}

export function HistoryTable({ items, isRefreshing }: HistoryTableProps) {
  return (
    <div className="relative overflow-x-auto [scrollbar-color:var(--border-hover)_transparent] [scrollbar-width:thin]">
      <table
        aria-busy={isRefreshing || undefined}
        className={`w-full min-w-225 table-fixed transition-opacity duration-150 ${isRefreshing ? 'opacity-60' : ''}`}
      >
        <caption className="sr-only">Avaliações desta conta</caption>
        <colgroup>
          <col className="w-33" />
          <col />
          <col className="w-37" />
          <col className="w-41.5" />
          <col className="w-40" />
          <col className="w-21" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col" className={HEAD_CELL}>
              Tipo
            </th>
            <th scope="col" className={HEAD_CELL}>
              Especificação
            </th>
            <th scope="col" className={HEAD_CELL}>
              Status
            </th>
            <th scope="col" className={HEAD_CELL}>
              Nota final
            </th>
            <th scope="col" className={HEAD_CELL}>
              Criada em
            </th>
            <th scope="col" className={HEAD_CELL}>
              <span className="sr-only">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const type = TYPE_LABELS[item.evaluationType]
            const createdAt = formatDateTime(item.createdAt)

            return (
              <tr key={item.id} className="h-13 border-t border-border">
                <td className={`font-medium text-ink ${BODY_CELL}`}>{type}</td>
                <td
                  title={item.openApiUrl}
                  className={`truncate font-mono text-[13px] text-ink-secondary ${BODY_CELL}`}
                >
                  {item.openApiUrl}
                </td>
                <td className={BODY_CELL}>
                  <StatusBadge status={item.status} />
                </td>
                <td className={BODY_CELL}>
                  <ScoreCell score={item.finalScore} />
                </td>
                <td
                  className={`font-mono text-[13px] whitespace-nowrap text-ink-secondary tabular-nums ${BODY_CELL}`}
                >
                  {createdAt}
                </td>
                <td className={BODY_CELL}>
                  <TextLink
                    to={evaluationPath(item.id)}
                    label={`Abrir avaliação ${type.toLowerCase()} de ${createdAt}`}
                  >
                    Abrir
                  </TextLink>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
