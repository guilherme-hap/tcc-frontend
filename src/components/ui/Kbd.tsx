import type { ReactNode } from 'react'

interface KbdProps {
  children: ReactNode
}

export function Kbd({ children }: KbdProps) {
  return (
    <kbd className="inline-flex h-5 items-center rounded-sm border border-border bg-glass-raised px-1.5 font-mono text-[11px] font-medium whitespace-nowrap text-ink-secondary">
      {children}
    </kbd>
  )
}
