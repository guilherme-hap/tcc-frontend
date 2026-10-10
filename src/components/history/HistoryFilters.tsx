import { useEffect, useEffectEvent, useId, useState } from 'react'
import { CalendarDays, ChevronDown, RotateCcw, Search } from 'lucide-react'
import type { EvaluationStatus, EvaluationType } from '../../types'
import { fromDayKey, rangeEnd, type DayRange } from '../../utils/dateRange'
import { formatDate } from '../../utils/format'
import { STATUS_LABELS, STATUS_ORDER, TYPE_LABELS, TYPE_ORDER } from '../../utils/labels'
import { Button } from '../ui/Button'
import { TextInput } from '../ui/Field'
import { Icon } from '../ui/Icon'
import { Listbox, type ListboxOption } from '../ui/Listbox'
import { FOCUS_RING } from '../ui/classes'
import type { HistoryFilters as Filters } from './useHistoryFilters'

const SEARCH_DELAY_MS = 300
const ALL = ''

const TYPE_OPTIONS: ListboxOption<EvaluationType | typeof ALL>[] = [
  { value: ALL, label: 'Todos os tipos' },
  ...TYPE_ORDER.map((type) => ({ value: type, label: TYPE_LABELS[type] })),
]

const STATUS_OPTIONS: ListboxOption<EvaluationStatus | typeof ALL>[] = [
  { value: ALL, label: 'Todos os status' },
  ...STATUS_ORDER.map((status) => ({ value: status, label: STATUS_LABELS[status] })),
]

function describeRange(range: DayRange): string {
  const end = rangeEnd(range)
  if (range.from === null || end === null) return 'Qualquer data'

  const from = formatDate(fromDayKey(range.from))
  return end === range.from ? from : `${from} – ${formatDate(fromDayKey(end))}`
}

interface SearchBoxProps {
  value: string
  onCommit: (value: string) => void
}

function SearchBox({ value, onCommit }: SearchBoxProps) {
  const id = useId()
  const [draft, setDraft] = useState(value)
  const commit = useEffectEvent(onCommit)
  const term = draft.trim()

  useEffect(() => {
    if (term === value) return

    const timer = setTimeout(() => commit(term), SEARCH_DELAY_MS)
    return () => clearTimeout(timer)
  }, [term, value])

  return (
    <div className="flex min-w-0 flex-[999_1_17.5rem] flex-col gap-1.5">
      <label htmlFor={id} className="font-medium text-ink">
        Especificação
      </label>
      <div className="relative">
        <Icon
          icon={Search}
          className="pointer-events-none absolute top-2.5 left-3 text-ink-secondary"
        />
        <TextInput
          id={id}
          type="search"
          mono
          placeholder="localhost:4010/openapi.json"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className="w-full pl-9"
        />
      </div>
    </div>
  )
}

interface HistoryFiltersProps {
  filters: Filters
  hasFilters: boolean
  resetKey: number
  rangePanelId: string
  rangeOpen: boolean
  onToggleRange: () => void
  onChange: (patch: Partial<Filters>) => void
  onClear: () => void
}

export function HistoryFilters({
  filters,
  hasFilters,
  resetKey,
  rangePanelId,
  rangeOpen,
  onToggleRange,
  onChange,
  onClear,
}: HistoryFiltersProps) {
  const rangeId = useId()

  return (
    <div
      role="search"
      aria-label="Filtros do histórico"
      className="flex flex-wrap items-end gap-x-4 gap-y-3 border-b border-border px-5 py-4"
    >
      <SearchBox
        key={resetKey}
        value={filters.search}
        onCommit={(search) => onChange({ search })}
      />
      <Listbox
        label="Tipo"
        options={TYPE_OPTIONS}
        value={filters.type ?? ALL}
        onChange={(type) => onChange({ type: type || null })}
        className="flex-[1_1_10rem]"
      />
      <Listbox
        label="Status"
        options={STATUS_OPTIONS}
        value={filters.status ?? ALL}
        onChange={(status) => onChange({ status: status || null })}
        className="flex-[1_1_10rem]"
      />
      <div className="flex min-w-0 flex-[1_1_13.75rem] flex-col gap-1.5">
        <span id={`${rangeId}-label`} className="font-medium text-ink">
          Período
        </span>
        <button
          type="button"
          aria-expanded={rangeOpen}
          aria-controls={rangePanelId}
          aria-labelledby={`${rangeId}-label ${rangeId}-value`}
          onClick={onToggleRange}
          className={`flex h-9 w-full cursor-pointer items-center gap-2 rounded-md border bg-well px-3 text-ink transition-colors duration-150 ${rangeOpen ? 'border-accent-ink' : 'border-border-control hover:border-ink-muted'} ${FOCUS_RING}`}
        >
          <Icon icon={CalendarDays} className="text-ink-secondary" />
          <span
            id={`${rangeId}-value`}
            className="min-w-0 flex-1 truncate text-left font-mono text-[13px] tabular-nums"
          >
            {describeRange(filters)}
          </span>
          <Icon icon={ChevronDown} size={14} className="text-ink-secondary" />
        </button>
      </div>
      <Button variant="ghost" icon={RotateCcw} disabled={!hasFilters} onClick={onClear}>
        Limpar filtros
      </Button>
    </div>
  )
}
