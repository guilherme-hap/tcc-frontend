const LOCALE = 'pt-BR'
const MILLISECONDS_PER_MINUTE = 60_000

export function formatNumber(value: number, maximumFractionDigits = 2): string {
  return value.toLocaleString(LOCALE, { maximumFractionDigits })
}

export function formatScore(value: number): string {
  return value.toLocaleString(LOCALE, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

export function formatPercent(fraction: number, maximumFractionDigits = 1): string {
  return `${formatNumber(fraction * 100, maximumFractionDigits)}%`
}

export function formatMilliseconds(value: number): string {
  if (value >= 1000) return `${formatNumber(value / 1000)} s`
  return `${formatNumber(value, 1)} ms`
}

export function formatDuration(milliseconds: number): string {
  if (milliseconds < MILLISECONDS_PER_MINUTE) return formatMilliseconds(milliseconds)

  const seconds = Math.round(milliseconds / 1000)
  return `${formatNumber(Math.floor(seconds / 60))} min ${seconds % 60} s`
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(LOCALE, {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString(LOCALE, { dateStyle: 'short' })
}

export function formatLongDate(date: Date): string {
  return date.toLocaleDateString(LOCALE, { dateStyle: 'long' })
}

export function formatMonth(date: Date): string {
  return date.toLocaleDateString(LOCALE, { month: 'long', year: 'numeric' })
}

export function formatCount(count: number, singular: string, plural: string): string {
  return `${formatNumber(count)} ${count === 1 ? singular : plural}`
}
