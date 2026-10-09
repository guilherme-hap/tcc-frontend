import type { LucideIcon } from 'lucide-react'

interface IconProps {
  icon: LucideIcon
  size?: number
  label?: string
  className?: string
}

export function Icon({ icon: Glyph, size = 16, label, className = '' }: IconProps) {
  return (
    <Glyph
      size={size}
      strokeWidth={1.75}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`shrink-0 ${className}`}
    />
  )
}
