import { ArrowRight, CircleX } from 'lucide-react'
import type { IPerformanceTargetResult } from '../../types'
import { formatMilliseconds, formatNumber } from '../../utils/format'
import { Badge } from '../ui/Badge'
import { Icon } from '../ui/Icon'
import { CARD, FOCUS_RING, OVERLINE } from '../ui/classes'
import { ApdexBar, ApdexLegend } from './ApdexZones'

interface EndpointRowProps {
  target: IPerformanceTargetResult
}

function EndpointRow({ target }: EndpointRowProps) {
  const { result } = target

  return (
    <tr className="border-t border-border">
      <th scope="row" className="py-2.5 pr-4 text-left font-normal">
        <span className="flex items-center gap-2">
          <Badge mono>{target.method}</Badge>
          <span
            title={target.path}
            className="font-mono text-xs text-ink max-sm:break-all sm:max-w-72 sm:truncate"
          >
            {target.path}
          </span>
        </span>
      </th>
      {result ? (
        <>
          <td className="w-full min-w-24 py-2.5 pr-4 max-sm:hidden">
            {result.sampleSize > 0 ? <ApdexBar result={result} /> : null}
          </td>
          <td className="py-2.5 text-right whitespace-nowrap">
            {result.score !== null ? (
              <span className="num text-lg leading-5 text-ink">{formatNumber(result.score)}</span>
            ) : (
              <span className="text-sm text-ink-secondary">Não medido</span>
            )}
          </td>
        </>
      ) : (
        <td colSpan={2} className="py-2.5 text-right">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-error">
            <Icon icon={CircleX} size={14} />
            O teste falhou
          </span>
        </td>
      )}
    </tr>
  )
}

interface EndpointOverviewProps {
  results: IPerformanceTargetResult[]
  targetLatency: number | undefined
  onOpen: () => void
  className?: string
}

export function EndpointOverview({
  results,
  targetLatency,
  onOpen,
  className = '',
}: EndpointOverviewProps) {
  return (
    <section className={`flex min-w-0 flex-col gap-3 border-border p-4 ${CARD} ${className}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className={OVERLINE}>Desempenho por endpoint</h3>
        {targetLatency !== undefined ? (
          <span className="font-mono text-xs text-ink-secondary">
            T = {formatMilliseconds(targetLatency)}
          </span>
        ) : null}
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-xs font-semibold whitespace-nowrap text-ink-secondary">
            <th scope="col" className="pb-2 text-left font-semibold">
              Endpoint
            </th>
            <th scope="col" className="pr-4 pb-2 text-left font-semibold max-sm:hidden">
              Zonas do Apdex
            </th>
            <th scope="col" className="pb-2 text-right font-semibold">
              Apdex
            </th>
          </tr>
        </thead>
        <tbody>
          {results.map((target, index) => (
            <EndpointRow key={index} target={target} />
          ))}
        </tbody>
      </table>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-border pt-3">
        <div className="max-sm:hidden">
          <ApdexLegend />
        </div>
        <button
          type="button"
          onClick={onOpen}
          className={`relative inline-flex cursor-pointer items-center gap-1.5 rounded-sm text-sm max-lg:before:absolute max-lg:before:-inset-y-3.5 max-lg:before:inset-x-0 max-lg:before:content-[''] font-medium text-accent-ink transition-colors duration-150 hover:text-ink ${FOCUS_RING}`}
        >
          Abrir desempenho
          <Icon icon={ArrowRight} size={14} />
        </button>
      </div>
    </section>
  )
}
