import { formatNumber, formatPercent } from '../../utils/format'

function codeTone(code: string): string {
  if (code.startsWith('2')) return 'bg-success'
  if (code.startsWith('4')) return 'bg-warning'
  if (code.startsWith('5')) return 'bg-error'
  return 'bg-ink-muted'
}

interface StatusCodeBreakdownProps {
  statusCodes: Record<string, number>
}

export function StatusCodeBreakdown({ statusCodes }: StatusCodeBreakdownProps) {
  const entries = Object.entries(statusCodes)
    .filter(([, count]) => count > 0)
    .sort(([a], [b]) => a.localeCompare(b))
  const total = entries.reduce((sum, [, count]) => sum + count, 0)

  if (total === 0) {
    return <p className="text-sm text-ink-secondary">Nenhuma resposta HTTP recebida.</p>
  }

  const describe = (code: string, count: number) =>
    `${code}: ${formatNumber(count)} (${formatPercent(count / total)})`

  return (
    <div className="flex min-w-0 flex-col gap-2.5">
      <div
        role="img"
        aria-label={`Respostas por código HTTP. ${entries.map(([code, count]) => describe(code, count)).join('; ')}`}
        className="flex h-2.5 gap-0.5"
      >
        {entries.map(([code, count]) => (
          <span
            key={code}
            title={describe(code, count)}
            className={`min-w-1 rounded-xs ${codeTone(code)}`}
            style={{ flexGrow: count, flexBasis: 0 }}
          />
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-5 gap-y-1.5">
        {entries.map(([code, count]) => (
          <li key={code} className="inline-flex items-center gap-2 text-sm">
            <span aria-hidden="true" className={`size-2 rounded-xs ${codeTone(code)}`} />
            <span className="font-mono font-medium text-ink">{code}</span>
            <span className="font-mono text-xs text-ink-secondary tabular-nums">
              {formatNumber(count)} · {formatPercent(count / total)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
