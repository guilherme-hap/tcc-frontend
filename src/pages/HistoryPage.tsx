import { useEffect, useEffectEvent, useId, useState } from 'react'
import { ChevronLeft, ChevronRight, History, Plus } from 'lucide-react'
import { DateRangePanel } from '../components/history/DateRangePanel'
import { HistoryFilters } from '../components/history/HistoryFilters'
import { HistoryTable } from '../components/history/HistoryTable'
import {
  HISTORY_PAGE_SIZE,
  toHistoryQuery,
  useHistoryFilters,
} from '../components/history/useHistoryFilters'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Icon } from '../components/ui/Icon'
import { LinkButton } from '../components/ui/LinkButton'
import { Notice } from '../components/ui/Notice'
import { GLASS } from '../components/ui/classes'
import { useEvaluationHistory } from '../hooks'
import { formatCount, formatNumber } from '../utils/format'
import { NEW_EVALUATION_PATH } from '../utils/routes'

function HistorySkeleton() {
  return (
    <div role="status" aria-label="Carregando o histórico" className="flex flex-col">
      {Array.from({ length: HISTORY_PAGE_SIZE / 2 }, (_, index) => (
        <div key={index} className="flex h-13 items-center border-t border-border px-5">
          <div className="h-4 w-full animate-pulse rounded-sm bg-glass-raised motion-reduce:animate-none" />
        </div>
      ))}
    </div>
  )
}

export function HistoryPage() {
  const rangePanelId = useId()
  const { filters, page, hasFilters, update, setPage, clear } = useHistoryFilters()
  const [rangeOpen, setRangeOpen] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const { history, isLoading, isRefreshing, error, refetch } = useEvaluationHistory(
    toHistoryQuery(filters, page),
  )

  const lastPage = history && !isRefreshing ? Math.max(1, history.totalPages) : null
  const goToLastPage = useEffectEvent((target: number) => setPage(target))

  useEffect(() => {
    if (lastPage !== null && page > lastPage) goToLastPage(lastPage)
  }, [lastPage, page])

  const clearAll = () => {
    clear()
    setResetKey((current) => current + 1)
  }

  const heading = (
    <div className="flex flex-col gap-2">
      <h1 className="font-display text-2xl leading-8 font-semibold tracking-[-0.01em] text-ink">
        Histórico de avaliações
      </h1>
      <p className="max-w-[72ch] text-ink-secondary">
        As avaliações desta conta, da mais recente para a mais antiga. As feitas sem conta não
        entram na lista.
      </p>
    </div>
  )

  if (history && history.total === 0 && !hasFilters && !isRefreshing) {
    return (
      <>
        {heading}
        <EmptyState
          icon={History}
          title="Nenhuma avaliação no histórico"
          description="Uma avaliação entra aqui quando é criada com a sessão aberta. As anteriores à conta continuam abrindo só pelo link."
          action={
            <LinkButton to={NEW_EVALUATION_PATH} variant="primary" size="lg" icon={Plus}>
              Nova avaliação
            </LinkButton>
          }
        />
      </>
    )
  }

  const total = history?.total ?? 0
  const pages = Math.max(1, history?.totalPages ?? 1)
  const shown = history?.items.length ?? 0

  return (
    <>
      {heading}
      <section aria-label="Avaliações" className={`flex min-w-0 flex-col border-border ${GLASS}`}>
        <HistoryFilters
          filters={filters}
          hasFilters={hasFilters}
          resetKey={resetKey}
          rangePanelId={rangePanelId}
          rangeOpen={rangeOpen}
          onToggleRange={() => setRangeOpen((current) => !current)}
          onChange={update}
          onClear={clearAll}
        />
        {rangeOpen ? (
          <DateRangePanel
            id={rangePanelId}
            range={filters}
            onChange={update}
            onClose={() => setRangeOpen(false)}
          />
        ) : null}

        {isLoading ? (
          <HistorySkeleton />
        ) : error ? (
          <div className="flex flex-col items-start gap-3 p-5">
            <Notice tone="error" title="Não foi possível carregar o histórico.">
              {error}
            </Notice>
            <Button onClick={refetch}>Tentar de novo</Button>
          </div>
        ) : shown > 0 && history ? (
          <HistoryTable items={history.items} isRefreshing={isRefreshing} />
        ) : (
          <div role="status" className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <p className="font-medium text-ink">Nenhuma avaliação corresponde aos filtros.</p>
            <p className="max-w-[52ch] text-ink-secondary">
              Amplie o período ou remova um dos filtros.
            </p>
            <Button onClick={clearAll}>Limpar filtros</Button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3">
          <span aria-live="polite" className="text-[13px] text-ink-secondary">
            {hasFilters
              ? formatCount(total, 'avaliação com os filtros', 'avaliações com os filtros')
              : `${formatNumber(shown)} de ${formatCount(total, 'avaliação', 'avaliações')}`}
          </span>
          <nav aria-label="Paginação" className="flex flex-wrap items-center gap-3">
            <span className="text-[13px] text-ink-secondary">
              Página <span className="font-mono text-ink tabular-nums">{formatNumber(page)}</span>{' '}
              de <span className="font-mono text-ink tabular-nums">{formatNumber(pages)}</span>
            </span>
            <div className="flex gap-2">
              <Button icon={ChevronLeft} disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Anterior
              </Button>
              <Button disabled={page >= pages} onClick={() => setPage(page + 1)}>
                Próxima
                <Icon icon={ChevronRight} />
              </Button>
            </div>
          </nav>
        </div>
      </section>
    </>
  )
}
