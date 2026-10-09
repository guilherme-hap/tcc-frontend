const LOCALE = 'pt-BR'

export function formatNumber(value: number, maximumFractionDigits = 2): string {
  return value.toLocaleString(LOCALE, { maximumFractionDigits })
}

export function formatPercent(fraction: number, maximumFractionDigits = 1): string {
  return `${formatNumber(fraction * 100, maximumFractionDigits)}%`
}

export function formatMilliseconds(value: number): string {
  if (value >= 1000) return `${formatNumber(value / 1000)} s`
  return `${formatNumber(value, 1)} ms`
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(LOCALE, {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}
