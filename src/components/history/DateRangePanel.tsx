import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  buildPresets,
  fromDayKey,
  isSameRange,
  pickDay,
  rangeEnd,
  shiftDay,
  toDayKey,
  todayKey,
  type DayRange,
} from '../../utils/dateRange'
import { formatDate, formatLongDate, formatMonth } from '../../utils/format'
import { Button } from '../ui/Button'
import { IconButton } from '../ui/IconButton'
import { FOCUS_RING, OVERLINE } from '../ui/classes'

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const GRID_DAYS = 42

const KEY_STEPS: Record<string, number> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -7,
  ArrowDown: 7,
}

function monthOf(day: string): string {
  return day.slice(0, 7)
}

function firstDayOf(month: string): string {
  return `${month}-01`
}

function dayClasses(isEdge: boolean, isInside: boolean, isCurrentMonth: boolean, isToday: boolean) {
  if (isEdge) return 'border-transparent bg-accent-fill text-on-accent'

  const tone = isCurrentMonth ? 'text-ink' : 'text-ink-muted'
  const fill = isInside ? 'bg-accent-dim' : 'hover:bg-glass-raised'
  return `${isToday ? 'border-border-control' : 'border-transparent'} ${fill} ${tone}`
}

interface DateRangePanelProps {
  id: string
  range: DayRange
  onChange: (range: DayRange) => void
  onClose: () => void
}

export function DateRangePanel({ id, range, onChange, onClose }: DateRangePanelProps) {
  const today = todayKey()
  const [month, setMonth] = useState(() => monthOf(range.from ?? today))
  const [cursor, setCursor] = useState(range.from ?? today)
  const gridRef = useRef<HTMLDivElement>(null)
  const focusPending = useRef(false)

  useEffect(() => {
    if (!focusPending.current) return
    focusPending.current = false
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-day="${cursor}"]`)?.focus()
  }, [cursor])

  const end = rangeEnd(range)
  const firstDay = firstDayOf(month)
  const gridStart = shiftDay(firstDay, -fromDayKey(firstDay).getDay())
  const days = Array.from({ length: GRID_DAYS }, (_, index) => shiftDay(gridStart, index))

  const showMonth = (day: string) => {
    setMonth(monthOf(day))
    setCursor(day)
  }

  const shiftMonth = (delta: number) => {
    const date = fromDayKey(firstDay)
    showMonth(toDayKey(new Date(date.getFullYear(), date.getMonth() + delta, 1)))
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = KEY_STEPS[event.key]
    if (step === undefined) return

    event.preventDefault()
    focusPending.current = true
    showMonth(shiftDay(cursor, step))
  }

  return (
    <div
      id={id}
      role="group"
      aria-label="Escolher período"
      className="flex flex-wrap items-start gap-x-8 gap-y-5 border-b border-border bg-well p-5"
    >
      <div className="flex flex-[0_1_11.25rem] flex-col gap-1">
        <span className={`pb-1 ${OVERLINE}`}>Atalhos</span>
        {buildPresets(today).map((preset) => {
          const isActive = isSameRange(preset, range)

          return (
            <button
              key={preset.label}
              type="button"
              aria-pressed={isActive}
              onClick={() => {
                onChange({ from: preset.from, to: preset.to })
                showMonth(preset.to ?? today)
              }}
              className={`flex h-8 cursor-pointer items-center rounded-md px-2.5 text-left text-[13px] font-medium transition-colors duration-150 hover:bg-glass-raised hover:text-ink ${isActive ? 'bg-glass-raised text-ink' : 'text-ink-secondary'} ${FOCUS_RING}`}
            >
              {preset.label}
            </button>
          )
        })}
      </div>

      <div className="flex min-w-0 flex-[0_1_18.75rem] flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <IconButton
            icon={ChevronLeft}
            label="Mês anterior"
            onClick={() => shiftMonth(-1)}
            variant="outline"
          />
          <span aria-live="polite" className="font-medium text-ink">
            {formatMonth(fromDayKey(firstDay))}
          </span>
          <IconButton
            icon={ChevronRight}
            label="Próximo mês"
            onClick={() => shiftMonth(1)}
            variant="outline"
          />
        </div>
        <div
          aria-hidden="true"
          className="grid grid-cols-7 gap-0.5 text-center text-[11px] leading-4 font-medium tracking-[0.08em] text-ink-muted"
        >
          {WEEKDAYS.map((weekday, index) => (
            <span key={index}>{weekday}</span>
          ))}
        </div>
        <div ref={gridRef} onKeyDown={handleKeyDown} className="grid grid-cols-7 gap-0.5">
          {days.map((day) => {
            const isEdge = day === range.from || (range.from !== null && day === end)
            const isInside = range.from !== null && end !== null && day > range.from && day < end
            const isToday = day === today
            const date = fromDayKey(day)

            return (
              <button
                key={day}
                type="button"
                data-day={day}
                tabIndex={day === cursor ? 0 : -1}
                aria-label={`${formatLongDate(date)}${isToday ? ', hoje' : ''}`}
                aria-pressed={isEdge || isInside}
                onClick={() => {
                  setCursor(day)
                  onChange(pickDay(range, day))
                }}
                className={`h-9 cursor-pointer rounded-md border font-mono text-[13px] tabular-nums transition-colors duration-150 ${dayClasses(isEdge, isInside, monthOf(day) === month, isToday)} ${FOCUS_RING}`}
              >
                {date.getDate()}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex min-w-0 flex-[1_1_12.5rem] flex-col gap-4">
        <dl className="flex flex-wrap gap-x-6 gap-y-3">
          <div className="flex flex-col gap-0.5">
            <dt className={OVERLINE}>De</dt>
            <dd className="font-mono text-[13px] text-ink tabular-nums">
              {range.from ? formatDate(fromDayKey(range.from)) : 'Sem limite'}
            </dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className={OVERLINE}>Até</dt>
            <dd className="font-mono text-[13px] text-ink tabular-nums">
              {end ? formatDate(fromDayKey(end)) : 'Sem limite'}
            </dd>
          </div>
        </dl>
        <p className="text-[13px] text-ink-secondary">
          Escolha o primeiro e o último dia. Um clique só filtra um único dia.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onClose}>Aplicar período</Button>
          <Button
            variant="ghost"
            disabled={range.from === null}
            onClick={() => onChange({ from: null, to: null })}
          >
            Limpar período
          </Button>
        </div>
      </div>
    </div>
  )
}
