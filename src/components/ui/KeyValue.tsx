import type { ReactNode } from 'react'

export interface KeyValueItem {
  label: string
  value: ReactNode
  mono?: boolean
}

interface KeyValueProps {
  items: KeyValueItem[]
}

export function KeyValue({ items }: KeyValueProps) {
  return (
    <dl className="flex flex-col">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex justify-between gap-6 border-b border-border py-2 text-[13px] last:border-b-0"
        >
          <dt className="text-ink-secondary">{item.label}</dt>
          <dd
            className={`text-right wrap-anywhere text-ink ${item.mono ? 'font-mono tabular-nums' : ''}`}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
