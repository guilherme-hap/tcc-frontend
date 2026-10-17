import type { ReactNode } from 'react'

export interface MetaItem {
  label: string
  value: ReactNode
  mono?: boolean
}

interface MetaListProps {
  items: MetaItem[]
  className?: string
}

export function MetaList({ items, className = '' }: MetaListProps) {
  return (
    <dl
      className={`grid grid-cols-1 gap-x-4 gap-y-1 text-sm sm:grid-cols-[auto_minmax(0,1fr)] ${className}`}
    >
      {items.map((item, index) => (
        <div key={item.label} className="contents">
          <dt className="text-ink-secondary">{item.label}</dt>
          <dd
            className={`leading-5 text-ink ${item.mono ? 'font-mono text-xs break-all tabular-nums' : 'wrap-anywhere'} ${index < items.length - 1 ? 'max-sm:mb-1.5' : ''}`}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
