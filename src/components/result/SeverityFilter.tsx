import { useId } from 'react'
import type { Severity } from '../../types'
import { formatNumber } from '../../utils/format'

export type SeverityFilterValue = Severity | 'all'

export interface SeverityFilterOption {
  value: SeverityFilterValue
  label: string
  count: number
}

interface SeverityFilterProps {
  options: SeverityFilterOption[]
  value: SeverityFilterValue
  onChange: (value: SeverityFilterValue) => void
}

export function SeverityFilter({ options, value, onChange }: SeverityFilterProps) {
  const name = useId()

  return (
    <fieldset className="min-w-0">
      <legend className="sr-only">Filtrar regras por severidade</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="group inline-flex h-8 cursor-pointer items-center gap-2 rounded-md border border-border bg-well px-2.5 text-[13px] font-medium text-ink-secondary transition-colors duration-150 hover:border-border-hover hover:text-ink has-checked:border-accent-ink/55 has-checked:bg-accent-dim has-checked:text-ink has-checked:hover:border-accent-ink/55 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            <span
              aria-hidden="true"
              className="relative size-3 shrink-0 rounded-full border border-border-control bg-well after:absolute after:inset-0.5 after:rounded-full after:bg-accent-ink after:opacity-0 after:transition-opacity after:duration-150 group-has-checked:border-accent-ink group-has-checked:after:opacity-100"
            />
            {option.label}
            <span className="rounded-full bg-glass-raised px-1.5 font-mono text-[11px] leading-4 font-medium text-ink-secondary tabular-nums">
              {formatNumber(option.count)}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
