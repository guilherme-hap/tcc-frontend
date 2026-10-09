import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Icon } from '../ui/Icon'
import { FOCUS_RING, GLASS, OVERLINE } from '../ui/classes'

interface StatCardProps {
  label: string
  icon?: LucideIcon
  value?: string
  unit?: string
  hint?: string
  loading?: boolean
  onClick?: () => void
  children?: ReactNode
}

export function StatCard({
  label,
  icon,
  value,
  unit,
  hint,
  loading = false,
  onClick,
  children,
}: StatCardProps) {
  return (
    <div
      aria-busy={loading || undefined}
      className={`relative flex min-w-0 flex-col gap-3 border-border p-4 ${GLASS} ${onClick ? 'hover:border-border-hover hover:bg-glass-raised' : ''}`}
    >
      <div className="flex items-center justify-between gap-2">
        {onClick ? (
          <button
            type="button"
            onClick={onClick}
            className={`cursor-pointer rounded-sm text-left after:absolute after:inset-0 after:rounded-card ${OVERLINE} ${FOCUS_RING}`}
          >
            {label}
          </button>
        ) : (
          <span className={OVERLINE}>{label}</span>
        )}
        {icon ? <Icon icon={icon} className="text-ink-muted" /> : null}
      </div>
      {loading ? (
        <span
          role="img"
          aria-label="Carregando"
          className="block h-8 w-3/5 animate-pulse rounded-md bg-glass-raised motion-reduce:animate-none"
        />
      ) : (
        <p className="font-mono text-[28px] leading-8 font-semibold tracking-[-0.02em] text-ink tabular-nums">
          {value}
          {unit ? (
            <span className="ml-1.5 font-body text-[13px] leading-5 font-normal tracking-normal text-ink-secondary">
              {unit}
            </span>
          ) : null}
        </p>
      )}
      {loading ? null : children}
      {hint && !loading ? <p className="text-[13px] text-ink-secondary">{hint}</p> : null}
    </div>
  )
}
