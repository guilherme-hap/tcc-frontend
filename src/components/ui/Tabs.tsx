import type { KeyboardEvent, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { formatNumber } from '../../utils/format'
import { Icon } from './Icon'
import { FOCUS_RING } from './classes'

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

const MOVES: Record<string, (index: number, count: number) => number> = {
  ArrowRight: (index, count) => (index + 1) % count,
  ArrowLeft: (index, count) => (index - 1 + count) % count,
  Home: () => 0,
  End: (_index, count) => count - 1,
}

export function Tabs<T extends string>({ label, idPrefix, items, value, onChange }: TabsProps<T>) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const move = MOVES[event.key]
    if (!move) return

    const index = items.findIndex((item) => item.id === value)
    const next = items[move(index, items.length)]

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
          aria-controls={item.id === value ? `${idPrefix}-panel-${item.id}` : undefined}
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

interface TabPanelProps {
  idPrefix: string
  tab: string
  className?: string
  children: ReactNode
}

export function TabPanel({ idPrefix, tab, className = '', children }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      id={`${idPrefix}-panel-${tab}`}
      aria-labelledby={`${idPrefix}-tab-${tab}`}
      tabIndex={0}
      className={`rounded-card ${FOCUS_RING} ${className}`}
    >
      {children}
    </div>
  )
}
