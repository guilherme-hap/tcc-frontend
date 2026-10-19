export const CARD_SURFACE = 'border bg-surface shadow-card transition-colors duration-150'

export const CARD = `rounded-card ${CARD_SURFACE}`

export const PAGE_CONTAINER = 'mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pt-6 pb-10 sm:px-6'

export const FRAME = 'lg:grid lg:grid-cols-[23.25rem_minmax(0,1fr)] lg:items-start'

export const RAIL =
  'flex min-w-0 flex-col gap-5 border-b border-border bg-surface px-4 py-5 [scrollbar-color:var(--border-hover)_transparent] [scrollbar-width:thin] [scrollbar-gutter:stable] sm:px-6 lg:sticky lg:top-[53px] lg:h-[calc(100dvh-53px)] lg:overflow-y-auto lg:border-r lg:border-b-0'

export const BODY = 'flex min-w-0 flex-col gap-5 px-4 pt-5 pb-10 sm:px-6 lg:px-7'

export const PAGE_TITLE =
  'font-display text-[22px] leading-7 font-bold tracking-[-0.01em] text-ink'

export const FOCUS_RING =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus'

export const OVERLINE =
  'text-xs leading-4 font-semibold tracking-[0.06em] text-ink-secondary uppercase [font-variation-settings:"wdth"_112]'

export const TEXT_LINK = `rounded-sm font-medium transition-colors duration-150 hover:text-ink ${FOCUS_RING}`

export const ICON_TILE =
  'inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-border-hover bg-surface-raised text-accent-ink'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'md' | 'lg'

export const BUTTON_BASE = `inline-flex items-center justify-center gap-2 rounded-md border px-3.5 text-sm font-semibold whitespace-nowrap transition-[color,background-color,border-color] duration-150 ${FOCUS_RING}`

export const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'border-ink bg-ink text-bg hover:border-white hover:bg-white',
  secondary: 'border-border-hover bg-surface-raised text-ink hover:border-border-control',
  ghost: 'border-transparent text-ink-secondary hover:bg-surface-raised hover:text-ink',
  danger: 'border-error/60 bg-error-dim text-error hover:border-error',
}

export const BUTTON_SIZES: Record<ButtonSize, string> = {
  md: 'h-9 max-lg:h-11',
  lg: 'h-10 max-lg:h-11',
}
