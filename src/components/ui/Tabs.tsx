import type { KeyboardEvent } from 'react'
import type { LucideIcon } from 'lucide-react'
import { formatNumber } from '../../utils/format'
import { Icon } from './Icon'

export interface TabItem<T extends string> {
  id: T
  label: string
  icon?: LucideIcon
  count?: number
}

interface TabsProps<T extends string> {
  label: string
  idPrefix: string
  items: TabItem<T>[]
  value: T
  onChange: (id: T) => void
}

export function Tabs<T extends string>({ label, idPrefix, items, value, onChange }: TabsProps<T>) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return

    const index = items.findIndex((item) => item.id === value)
    const step = event.key === 'ArrowRight' ? 1 : -1
    const next = items[(index + step + items.length) % items.length]

    event.preventDefault()
    onChange(next.id)
    event.currentTarget.querySelector<HTMLButtonElement>(`#${idPrefix}-tab-${next.id}`)?.focus()
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={handleKeyDown}
      className="flex gap-1 overflow-x-auto border-b border-border [scrollbar-width:none]"
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          id={`${idPrefix}-tab-${item.id}`}
          aria-controls={`${idPrefix}-panel-${item.id}`}
          aria-selected={item.id === value}
          tabIndex={item.id === value ? 0 : -1}
          onClick={() => onChange(item.id)}
          className="group relative inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-t-md px-3 text-sm font-medium whitespace-nowrap text-ink-secondary transition-colors duration-150 after:absolute after:inset-x-3 after:bottom-0 after:hidden after:h-0.5 after:rounded-t-full after:bg-accent after:shadow-[0_0_12px_0_var(--accent)] hover:bg-glass hover:text-ink focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus aria-selected:text-ink aria-selected:after:block"
        >
          {item.icon ? (
            <Icon icon={item.icon} className="group-aria-selected:text-accent-ink" />
          ) : null}
          {item.label}
          {item.count !== undefined ? (
            <span className="rounded-full bg-glass-raised px-1.5 font-mono text-[11px] leading-4 font-medium text-ink-secondary">
              {formatNumber(item.count)}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  )
}
