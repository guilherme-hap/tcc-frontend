import { ChevronUp } from 'lucide-react'
import type { EvaluationListItem, EvaluationType } from '../../types'
import { TREND_LIMIT, useScoreTrend } from '../../hooks/useScoreTrend'
import { formatCount, formatDateTime, formatNumber } from '../../utils/format'
import { TYPE_LABELS, TYPE_ORDER } from '../../utils/labels'
import { LazyScoreTrendChart } from '../result/LazyCharts'
import { Block } from '../ui/Block'
import { Button } from '../ui/Button'
import { Notice } from '../ui/Notice'
import { CARD, OVERLINE } from '../ui/classes'
import type { HistoryFilters } from './useHistoryFilters'

interface ScoreTrendProps {
  filters: HistoryFilters
  trend: EvaluationType | null
  onChangeTrend: (trend: EvaluationType | null) => void
}

interface TypeButtonsProps {
  selected: EvaluationType | null
  onSelect: (type: EvaluationType) => void
}

function countSpecs(items: EvaluationListItem[]): number {
  return new Set(items.map((item) => item.openApiUrl)).size
}

function TrendMessage({ children }: { children: string }) {
  return (
    <p role="status" className="py-8 text-center text-ink-secondary">
      {children}
    </p>
  )
}

function TypeButtons({ selected, onSelect }: TypeButtonsProps) {
  return (
    <div role="group" aria-label="Tipo de avaliação do gráfico" className="flex flex-wrap gap-2">
      {TYPE_ORDER.map((type) => (
        <Button
          key={type}
          variant={type === selected ? 'primary' : 'secondary'}
          aria-pressed={type === selected}
          onClick={() => onSelect(type)}
        >
          {TYPE_LABELS[type]}
        </Button>
      ))}
    </div>
  )
}

interface TrendBodyProps {
  type: EvaluationType
  items: EvaluationListItem[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

function TrendBody({ type, items, isLoading, error, refetch }: TrendBodyProps) {
  if (isLoading) {
    return (
      <div
        role="status"
        aria-label="Carregando a evolução da nota"
        className="h-56 animate-pulse rounded-md bg-well motion-reduce:animate-none"
      />
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-start gap-3">
        <Notice tone="error" title="Não foi possível carregar a evolução da nota.">
          {error}
        </Notice>
        <Button onClick={refetch}>Tentar de novo</Button>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <TrendMessage>
        {`Nenhuma avaliação concluída do tipo ${TYPE_LABELS[type]} na busca e no período atuais. Amplie o período ou limpe a busca.`}
      </TrendMessage>
    )
  }

  if (items.length === 1) {
    return (
      <p role="status" className="py-8 text-center text-ink-secondary">
        Uma avaliação concluída: nota{' '}
        <span className="num text-lg text-ink">{formatNumber(items[0].finalScore ?? 0)}</span> em{' '}
        {formatDateTime(items[0].createdAt)}. O gráfico aparece a partir de duas.
      </p>
    )
  }

  const specs = countSpecs(items)

  return (
    <figure className="flex min-w-0 flex-col gap-3">
      <LazyScoreTrendChart items={items} type={type} />
      <figcaption className="pl-8 text-xs text-ink-secondary">
        Cada ponto é uma avaliação concluída do tipo {TYPE_LABELS[type]}; eixo vertical de 0 a 100.
        {specs > 1
          ? ` Os pontos vêm de ${formatNumber(specs)} especificações diferentes: busque por uma especificação para acompanhar uma API só.`
          : ''}
      </figcaption>
    </figure>
  )
}

export function ScoreTrend({ filters, trend, onChangeTrend }: ScoreTrendProps) {
  const { items, total, isLoading, error, refetch } = useScoreTrend(filters, trend)

  if (trend === null) {
    return (
      <section
        aria-label="Evolução da nota"
        className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-border px-4 py-3 ${CARD}`}
      >
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className={OVERLINE}>Evolução da nota</h2>
          <p className="text-sm text-ink-secondary">Escolha um tipo para ver como a nota mudou.</p>
        </div>
        <TypeButtons selected={null} onSelect={onChangeTrend} />
      </section>
    )
  }

  const aside =
    !isLoading && !error && items.length > 0 ? (
      <span className="text-sm text-ink-secondary">
        {total > TREND_LIMIT
          ? `As ${formatNumber(TREND_LIMIT)} mais recentes de ${formatNumber(total)}`
          : formatCount(items.length, 'avaliação concluída', 'avaliações concluídas')}
      </span>
    ) : null

  return (
    <Block
      title="Evolução da nota"
      aside={
        <>
          {aside}
          <Button variant="ghost" icon={ChevronUp} onClick={() => onChangeTrend(null)}>
            Minimizar
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <TypeButtons selected={trend} onSelect={onChangeTrend} />
        <TrendBody
          type={trend}
          items={items}
          isLoading={isLoading}
          error={error}
          refetch={refetch}
        />
      </div>
    </Block>
  )
}
