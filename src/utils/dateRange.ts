const DAY_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

export interface DayRange {
  from: string | null
  to: string | null
}

export interface DayRangePreset extends DayRange {
  label: string
}

export function toDayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function parseDayKey(key: string | null): Date | null {
  const match = key ? DAY_KEY_PATTERN.exec(key) : null
  if (!match) return null

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return toDayKey(date) === key ? date : null
}

export function fromDayKey(key: string): Date {
  return parseDayKey(key) ?? new Date(Number.NaN)
}

export function shiftDay(key: string, days: number): string {
  const date = fromDayKey(key)
  return toDayKey(new Date(date.getFullYear(), date.getMonth(), date.getDate() + days))
}

export function todayKey(): string {
  return toDayKey(new Date())
}

export function rangeEnd({ from, to }: DayRange): string | null {
  return to ?? from
}

export function pickDay(range: DayRange, day: string): DayRange {
  if (range.from === null || range.to !== null) return { from: day, to: null }
  if (day < range.from) return { from: day, to: null }
  return { from: range.from, to: day }
}

export function rangeToInstants(range: DayRange): { from?: string; to?: string } {
  const end = rangeEnd(range)
  if (range.from === null || end === null) return {}

  return {
    from: fromDayKey(range.from).toISOString(),
    to: fromDayKey(shiftDay(end, 1)).toISOString(),
  }
}

export function buildPresets(today: string): DayRangePreset[] {
  return [
    { label: 'Hoje', from: today, to: today },
    { label: 'Últimos 7 dias', from: shiftDay(today, -6), to: today },
    { label: 'Últimos 30 dias', from: shiftDay(today, -29), to: today },
    { label: 'Este mês', from: `${today.slice(0, 8)}01`, to: today },
    { label: 'Qualquer data', from: null, to: null },
  ]
}

export function isSameRange(a: DayRange, b: DayRange): boolean {
  return a.from === b.from && rangeEnd(a) === rangeEnd(b)
}
