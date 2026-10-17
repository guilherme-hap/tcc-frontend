import type { EvaluationListItem } from '../../types'
import { formatDateTime } from '../../utils/format'
import { TYPE_LABELS } from '../../utils/labels'
import { evaluationPath } from '../../utils/routes'
import { MiddleTruncate } from '../ui/MiddleTruncate'
import { StatusBadge } from '../ui/StatusBadge'
import { TextLink } from '../ui/TextLink'
import { TypeStrip } from '../ui/TypeStrip'
import { OVERLINE } from '../ui/classes'
import { EvaluationRow } from './EvaluationRow'
import { ScoreValue } from './ScoreValue'

const HEAD_CELL = `px-2 py-3 text-left first:pl-4 last:pr-4 ${OVERLINE}`
const BODY_CELL = 'px-2 py-3 first:pl-4 last:pr-4'

interface HistoryTableProps {
  items: EvaluationListItem[]
  isRefreshing: boolean
}

export function HistoryTable({ items, isRefreshing }: HistoryTableProps) {
  const dim = isRefreshing ? 'opacity-60' : ''

  return (
    <>
      <ul
        aria-busy={isRefreshing || undefined}
        aria-label="Avaliações desta conta"
        className={`flex flex-col transition-opacity duration-150 xl:hidden ${dim}`}
      >
        {items.map((item) => (
          <EvaluationRow key={item.id} item={item} />
        ))}
      </ul>
      <table
        aria-busy={isRefreshing || undefined}
        className={`hidden w-full table-fixed transition-opacity duration-150 xl:table ${dim}`}
      >
        <caption className="sr-only">Avaliações desta conta</caption>
        <colgroup>
          <col className="w-32" />
          <col />
          <col className="w-36" />
          <col className="w-28" />
          <col className="w-20" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col" className={HEAD_CELL}>
              Tipo
            </th>
            <th scope="col" className={HEAD_CELL}>
              Especificação e data
            </th>
            <th scope="col" className={HEAD_CELL}>
              Status
            </th>
            <th scope="col" className={HEAD_CELL}>
              Nota final
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
              <tr key={item.id} className="relative border-t border-border transition-colors duration-150 hover:bg-surface-raised">
                <td className={BODY_CELL}>
                  <span className="flex flex-col gap-1.5">
                    <span className="font-medium text-ink">{type}</span>
                    <TypeStrip type={item.evaluationType} className="w-16" />
                  </span>
                </td>
                <td className={BODY_CELL}>
                  <span className="flex min-w-0 flex-col gap-0.5 font-mono text-xs">
                    <MiddleTruncate text={item.openApiUrl} className="text-ink" />
                    <span className="text-ink-secondary tabular-nums">{createdAt}</span>
                  </span>
                </td>
                <td className={BODY_CELL}>
                  <StatusBadge status={item.status} />
                </td>
                <td className={BODY_CELL}>
                  <ScoreValue score={item.finalScore} />
                </td>
                <td className={BODY_CELL}>
                  <TextLink
                    to={evaluationPath(item.id)}
                    label={`Abrir avaliação ${type.toLowerCase()} de ${createdAt}`}
                    className="after:absolute after:inset-0"
                  >
                    Abrir
                  </TextLink>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}
