import { useId, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react'
import { Check, ChevronDown, type LucideIcon } from 'lucide-react'
import { Icon } from './Icon'
import { FOCUS_RING } from './classes'

export interface ListboxOption<T extends string> {
  value: T
  label: string
}

interface ListboxProps<T extends string> {
  label: string
  options: ListboxOption<T>[]
  value: T
  onChange: (value: T) => void
  icon?: LucideIcon
  hint?: string
  className?: string
  controlClassName?: string
}

const MOVES: Record<string, (index: number, count: number) => number> = {
  ArrowDown: (index, count) => (index + 1) % count,
  ArrowUp: (index, count) => (index - 1 + count) % count,
  Home: () => 0,
  End: (_index, count) => count - 1,
}

export function Listbox<T extends string>({
  label,
  options,
  value,
  onChange,
  icon,
  hint,
  className = '',
  controlClassName = '',
}: ListboxProps<T>) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const selected = options.find((option) => option.value === value) ?? options[0]

  const close = () => {
    setOpen(false)
    triggerRef.current?.focus()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && open) {
      event.stopPropagation()
      close()
      return
    }

    const move = MOVES[event.key]
    if (!move) return

    event.preventDefault()
    if (!open) {
      setOpen(true)
      return
    }

    const items = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? [],
    )
    const current = items.findIndex((item) => item === document.activeElement)
    items[move(current === -1 ? 0 : current, items.length)]?.focus()
  }

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
  }

  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      <span id={`${id}-label`} className="font-medium text-ink">
        {label}
      </span>
      <div
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`relative ${controlClassName}`}
      >
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-labelledby={`${id}-label ${id}-value`}
          aria-describedby={hint ? `${id}-hint` : undefined}
          onClick={() => setOpen((current) => !current)}
          className={`flex h-9 w-full cursor-pointer items-center gap-2 rounded-md border bg-well px-3 text-sm text-ink transition-colors duration-150 ${open ? 'border-accent-ink' : 'border-border-control hover:border-ink-muted'} ${FOCUS_RING}`}
        >
          {icon ? <Icon icon={icon} className="text-ink-secondary" /> : null}
          <span id={`${id}-value`} className="min-w-0 flex-1 truncate text-left">
            {selected?.label}
          </span>
          <Icon icon={ChevronDown} size={14} className="text-ink-secondary" />
        </button>
        {open ? (
          <div
            ref={listRef}
            role="listbox"
            aria-labelledby={`${id}-label`}
            className="absolute top-10 left-0 z-10 flex max-h-66 min-w-full flex-col gap-0.5 overflow-y-auto rounded-card border border-border bg-surface-raised p-1 shadow-overlay [scrollbar-color:var(--border-hover)_transparent] [scrollbar-width:thin]"
          >
            {options.map((option) => {
              const isSelected = option.value === selected?.value

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  autoFocus={isSelected}
                  onClick={() => {
                    onChange(option.value)
                    close()
                  }}
                  className={`flex h-8 shrink-0 cursor-pointer items-center gap-2 rounded-md px-2 text-left text-sm whitespace-nowrap transition-colors duration-150 hover:bg-glass-raised hover:text-ink focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus ${isSelected ? 'bg-accent-dim text-ink' : 'text-ink-secondary'}`}
                >
                  <span className="flex-1">{option.label}</span>
                  <Icon
                    icon={Check}
                    size={14}
                    className={isSelected ? 'text-accent-ink' : 'invisible'}
                  />
                </button>
              )
            })}
          </div>
        ) : null}
      </div>
      {hint ? (
        <p id={`${id}-hint`} className="text-ink-secondary">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
