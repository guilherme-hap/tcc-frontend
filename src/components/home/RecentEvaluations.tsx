import { ArrowRight } from 'lucide-react'
import { useEvaluationHistory } from '../../hooks'
import { HISTORY_PATH } from '../../utils/routes'
import { EvaluationRow } from '../history/EvaluationRow'
import { Block } from '../ui/Block'
import { Notice } from '../ui/Notice'
import { TextLink } from '../ui/TextLink'

const RECENT_LIMIT = 4
const QUERY = { limit: RECENT_LIMIT }

export function RecentEvaluations() {
  const { history, isLoading, error } = useEvaluationHistory(QUERY)

  return (
    <Block
      title="Avaliações recentes"
      flush
      aside={
        <TextLink to={HISTORY_PATH} trailingIcon={ArrowRight}>
          Ver histórico
        </TextLink>
      }
    >
      {isLoading ? (
        <div role="status" aria-label="Carregando avaliações" className="flex flex-col gap-3 p-4">
          {Array.from({ length: RECENT_LIMIT }, (_, index) => (
            <div
              key={index}
              className="h-6 animate-pulse rounded-md bg-surface-raised motion-reduce:animate-none"
            />
          ))}
        </div>
      ) : error ? (
        <div className="p-4 pt-0">
          <Notice tone="error" title="Não foi possível carregar as avaliações.">
            {error}
          </Notice>
        </div>
      ) : history && history.items.length > 0 ? (
        <ul className="flex flex-1 flex-col">
          {history.items.map((item) => (
            <EvaluationRow key={item.id} item={item} />
          ))}
        </ul>
      ) : (
        <p className="px-4 pb-4 text-ink-secondary">
          Nenhuma avaliação feita com esta conta. A primeira aparece aqui assim que entrar na fila;
          as feitas sem conta não entram.
        </p>
      )}
    </Block>
  )
}
