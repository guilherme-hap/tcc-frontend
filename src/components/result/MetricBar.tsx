interface MetricBarProps {
  label: string
  display: string
  value: number
  max: number
}

export function MetricBar({ label, display, value, max }: MetricBarProps) {
  const share = max > 0 ? Math.min(100, (value / max) * 100) : 0

  return (
    <div className="flex flex-col gap-3">
      <span aria-hidden="true" className="block h-2.5 overflow-hidden rounded-xs bg-glass-raised">
        <span
          className="block h-full min-w-1 rounded-xs bg-data-cyan"
          style={{ width: `${share}%` }}
        />
      </span>
      <p className="flex flex-col text-[13px]">
        <span className="font-mono font-medium text-ink tabular-nums">{display}</span>
        <span className="font-mono text-xs text-ink-secondary">{label}</span>
      </p>
    </div>
  )
}
