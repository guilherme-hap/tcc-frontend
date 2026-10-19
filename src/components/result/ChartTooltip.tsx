import type { ReactNode } from 'react'

export interface ChartTooltipRow {
  label: ReactNode
  value: string
  tone?: 'error'
}

interface ChartTooltipProps {
  title: string
  rows: ChartTooltipRow[]
}

export function ChartTooltip({ title, rows }: ChartTooltipProps) {
  return (
    <div className="rounded-md border border-border-hover bg-surface-raised px-3 py-2 font-mono text-xs shadow-overlay">
      <p className="mb-1 text-ink-secondary">{title}</p>
      <ul className="flex flex-col gap-0.5">
        {rows.map((row, index) => (
          <li key={index} className="flex items-center justify-between gap-4 tabular-nums">
            <span className="inline-flex items-center gap-2 text-ink-secondary">{row.label}</span>
            <span className={row.tone === 'error' ? 'text-error' : 'text-ink'}>{row.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
