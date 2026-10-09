export const GLASS_SURFACE =
  'border bg-glass shadow-card backdrop-blur-glass backdrop-saturate-150 transition-colors duration-150'

export const GLASS = `rounded-card ${GLASS_SURFACE}`

export const FOCUS_RING =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus'

export const OVERLINE =
  'text-[11px] leading-4 font-medium tracking-[0.08em] text-ink-secondary uppercase'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'md' | 'lg'

export const BUTTON_BASE = `inline-flex items-center justify-center gap-2 rounded-md border px-3.5 text-sm font-medium whitespace-nowrap transition-[color,background-color,border-color,box-shadow] duration-150 ${FOCUS_RING}`

export const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'border-transparent bg-accent-fill text-on-accent shadow-accent hover:shadow-accent-hover',
  secondary: 'border-border bg-glass-raised text-ink hover:border-border-hover',
  ghost: 'border-transparent text-ink-secondary hover:bg-glass-raised hover:text-ink',
}

export const BUTTON_SIZES: Record<ButtonSize, string> = {
  md: 'h-9',
  lg: 'h-10',
}
