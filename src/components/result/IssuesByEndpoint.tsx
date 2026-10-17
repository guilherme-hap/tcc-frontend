import type { IContractResult } from '../../types'
import { groupByEndpoint } from '../../utils/contractRules'
import { formatCount, formatNumber } from '../../utils/format'
import { PILLAR_BG } from '../../utils/tones'
import { Badge } from '../ui/Badge'
import { CARD, OVERLINE } from '../ui/classes'

const MAX_VISIBLE = 8

interface IssuesByEndpointProps {
  result: IContractResult
  className?: string
}

export function IssuesByEndpoint({ result, className = '' }: IssuesByEndpointProps) {
  const groups = groupByEndpoint(result)

  if (groups.length === 0) return null

  const visible = groups.slice(0, MAX_VISIBLE)
  const hidden = groups.length - visible.length
  const maxCount = Math.max(...groups.map((group) => group.count))

  return (
    <section className={`flex min-w-0 flex-col gap-3 border-border p-4 ${CARD} ${className}`}>
      <h3 className={OVERLINE}>Ocorrências por endpoint</h3>
      <ul className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-x-3 sm:grid-cols-[auto_minmax(0,1fr)_6rem_auto]">
        {visible.map((group) => (
          <li
            key={`${group.method} ${group.endpoint}`}
            className="col-span-full grid grid-cols-subgrid items-center border-t border-border py-2 first:border-t-0 first:pt-0"
          >
            <span className="justify-self-start">
              {group.method === null ? null : <Badge mono>{group.method}</Badge>}
            </span>
            <span
              className={`text-xs leading-5 wrap-anywhere text-ink ${group.endpoint === null ? '' : 'font-mono'}`}
            >
              {group.endpoint ?? 'Documento'}
            </span>
            <span aria-hidden="true" className="h-1.5 rounded-full bg-idle max-sm:hidden">
              <span
                className={`block h-full min-w-0.5 rounded-full ${PILLAR_BG.contract}`}
                style={{ width: `${(group.count / maxCount) * 100}%` }}
              />
            </span>
            <span className="text-right font-mono text-xs text-ink tabular-nums">
              {formatNumber(group.count)}
            </span>
          </li>
        ))}
      </ul>
      {hidden > 0 ? (
        <p className="border-t border-border pt-3 text-sm text-ink-secondary">
          E mais {formatCount(hidden, 'endpoint', 'endpoints')}.
        </p>
      ) : null}
    </section>
  )
}
