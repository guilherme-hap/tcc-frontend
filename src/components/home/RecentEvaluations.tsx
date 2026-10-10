import { ArrowRight } from 'lucide-react'
import { useEvaluationHistory } from '../../hooks'
import { formatDateTime, formatScore } from '../../utils/format'
import { TYPE_LABELS } from '../../utils/labels'
import { HISTORY_PATH, evaluationPath } from '../../utils/routes'
import { Notice } from '../ui/Notice'
import { Panel } from '../ui/Panel'
import { StatusBadge } from '../ui/StatusBadge'
import { TextLink } from '../ui/TextLink'

const RECENT_LIMIT = 4
const QUERY = { limit: RECENT_LIMIT }

export function RecentEvaluations() {
  const { history, isLoading, error } = useEvaluationHistory(QUERY)

  return (
    <Panel
      title="Avaliações recentes"
      description="As últimas avaliações feitas com esta conta."
      flush
      aside={
        <TextLink to={HISTORY_PATH} trailingIcon={ArrowRight}>
          Ver histórico
        </TextLink>
      }
    >
      {isLoading ? (
        <div role="status" aria-label="Carregando avaliações" className="flex flex-col gap-3 p-5">
          {Array.from({ length: RECENT_LIMIT }, (_, index) => (
            <div
              key={index}
              className="h-6 animate-pulse rounded-md bg-glass-raised motion-reduce:animate-none"
            />
          ))}
        </div>
      ) : error ? (
        <div className="p-5">
          <Notice tone="error" title="Não foi possível carregar as avaliações.">
            {error}
          </Notice>
        </div>
      ) : history && history.items.length > 0 ? (
        <ul className="flex flex-1 flex-col px-5">
          {history.items.map((item) => {
            const createdAt = formatDateTime(item.createdAt)
            const type = TYPE_LABELS[item.evaluationType]

            return (
              <li
                key={item.id}
                className="flex flex-auto flex-wrap items-center gap-x-4 gap-y-2 border-b border-border py-3 last:border-b-0"
              >
                <span className="w-24 shrink-0 font-medium text-ink">{type}</span>
                <span className="min-w-0 flex-[1_1_12.5rem] truncate font-mono text-[13px] text-ink-secondary">
                  {item.openApiUrl}
                </span>
                <span className="w-31 shrink-0">
                  <StatusBadge status={item.status} />
                </span>
                <span className="w-12 shrink-0 text-right font-mono text-[13px] font-semibold text-ink tabular-nums">
                  {item.finalScore !== null ? formatScore(item.finalScore) : null}
                </span>
                <span className="w-33 shrink-0 font-mono text-[13px] text-ink-secondary tabular-nums">
                  {createdAt}
                </span>
                <TextLink
                  to={evaluationPath(item.id)}
                  label={`Abrir avaliação ${type.toLowerCase()} de ${createdAt}`}
                >
                  Abrir
                </TextLink>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="p-5 text-ink-secondary">
          Nenhuma avaliação feita com esta conta. A primeira aparece aqui assim que entrar na fila;
          as feitas sem conta não entram.
        </p>
      )}
    </Panel>
  )
}
