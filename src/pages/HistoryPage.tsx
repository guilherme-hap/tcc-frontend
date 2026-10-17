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
import { Badge } from '../components/ui/Badge'
import { Block } from '../components/ui/Block'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Icon } from '../components/ui/Icon'
import { LinkButton } from '../components/ui/LinkButton'
import { Notice } from '../components/ui/Notice'
import { BODY, FOCUS_RING, FRAME, OVERLINE, PAGE_TITLE, RAIL } from '../components/ui/classes'
import { useDocumentTitle, useEvaluationHistory, useWideLayout } from '../hooks'
import { formatCount, formatNumber } from '../utils/format'
import { NEW_EVALUATION_PATH } from '../utils/routes'

function HistorySkeleton() {
  return (
    <div role="status" aria-label="Carregando o histórico" className="flex flex-col">
      {Array.from({ length: HISTORY_PAGE_SIZE / 2 }, (_, index) => (
        <div key={index} className="flex h-14 items-center border-t border-border px-5">
          <div className="h-4 w-full animate-pulse rounded-sm bg-surface-raised motion-reduce:animate-none" />
        </div>
      ))}
    </div>
  )
}

export function HistoryPage() {
  useDocumentTitle('Histórico')
  const rangePanelId = useId()
  const wide = useWideLayout()
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

  const isEmpty = history !== undefined && history.total === 0 && !hasFilters && !isRefreshing
  const total = history?.total ?? 0
  const pages = Math.max(1, history?.totalPages ?? 1)
  const shown = history?.items.length ?? 0

  const filtersForm = (
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
  )

  return (
    <div className={FRAME}>
      <aside aria-label="Resumo e filtros do histórico" className={RAIL}>
        <div className="flex flex-col gap-3">
          <h1 className={PAGE_TITLE}>Histórico de avaliações</h1>
          <p className="text-sm leading-5 text-ink-secondary">
            As avaliações desta conta, da mais recente para a mais antiga. As feitas sem conta não
            entram na lista.
          </p>
        </div>

        <p className="flex items-baseline gap-2.5">
          <span className="num text-[44px] leading-none text-ink">
            {history ? formatNumber(total) : '–'}
          </span>
          <span className="text-sm text-ink-secondary">
            {total === 1 ? 'avaliação' : 'avaliações'} {hasFilters ? 'com os filtros' : 'na conta'}
          </span>
        </p>

        {isEmpty ? null : wide ? (
          <section className="flex flex-col gap-3 border-t border-border pt-5">
            <h2 className={OVERLINE}>Filtros</h2>
            {filtersForm}
          </section>
        ) : (
          <details className="group border-t border-border">
            <summary
              className={`flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-sm text-sm font-medium text-ink-secondary [&::-webkit-details-marker]:hidden ${FOCUS_RING}`}
            >
              <Icon
                icon={ChevronRight}
                size={14}
                className="transition-transform duration-150 group-open:rotate-90"
              />
              Filtros
              {hasFilters ? <Badge tone="accent">Ativos</Badge> : null}
            </summary>
            <div className="pt-1 pb-2">{filtersForm}</div>
          </details>
        )}
      </aside>

      <div className={BODY}>
        {isEmpty ? (
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
        ) : (
          <>
            {rangeOpen ? (
              <DateRangePanel
                id={rangePanelId}
                range={filters}
                onChange={update}
                onClose={() => setRangeOpen(false)}
              />
            ) : null}

            <Block title="Avaliações" flush>
              {isLoading ? (
                <HistorySkeleton />
              ) : error ? (
                <div className="flex flex-col items-start gap-3 border-t border-border p-5">
                  <Notice tone="error" title="Não foi possível carregar o histórico.">
                    {error}
                  </Notice>
                  <Button onClick={refetch}>Tentar de novo</Button>
                </div>
              ) : shown > 0 && history ? (
                <HistoryTable items={history.items} isRefreshing={isRefreshing} />
              ) : (
                <div
                  role="status"
                  className="flex flex-col items-center gap-3 border-t border-border px-6 py-14 text-center"
                >
                  <p className="font-medium text-ink">Nenhuma avaliação corresponde aos filtros.</p>
                  <p className="max-w-[52ch] text-ink-secondary">
                    Amplie o período ou remova um dos filtros.
                  </p>
                  <Button onClick={clearAll}>Limpar filtros</Button>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
                <span aria-live="polite" className="text-sm text-ink-secondary">
                  {hasFilters
                    ? formatCount(total, 'avaliação com os filtros', 'avaliações com os filtros')
                    : `${formatNumber(shown)} de ${formatCount(total, 'avaliação', 'avaliações')}`}
                </span>
                {pages > 1 ? (
                  <nav aria-label="Paginação" className="flex flex-wrap items-center gap-3">
                    <span className="text-sm text-ink-secondary">
                      Página{' '}
                      <span className="font-mono text-ink tabular-nums">{formatNumber(page)}</span> de{' '}
                      <span className="font-mono text-ink tabular-nums">{formatNumber(pages)}</span>
                    </span>
                    <div className="flex gap-2">
                      <Button
                        icon={ChevronLeft}
                        disabled={page <= 1}
                        onClick={() => setPage(page - 1)}
                      >
                        Anterior
                      </Button>
                      <Button disabled={page >= pages} onClick={() => setPage(page + 1)}>
                        Próxima
                        <Icon icon={ChevronRight} />
                      </Button>
                    </div>
                  </nav>
                ) : null}
              </div>
            </Block>
          </>
        )}
      </div>
    </div>
  )
}
