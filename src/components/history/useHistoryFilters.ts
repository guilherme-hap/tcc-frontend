import { useSearchParams } from 'react-router-dom'
import type { EvaluationListQuery, EvaluationStatus, EvaluationType } from '../../types'
import { parseDayKey, rangeToInstants, type DayRange } from '../../utils/dateRange'
import { STATUS_FILTER_STATUSES, STATUS_ORDER, TYPE_ORDER } from '../../utils/labels'
import { TYPE_PARAM } from '../../utils/routes'

export const HISTORY_PAGE_SIZE = 10

const SEARCH_PARAM = 'q'
const STATUS_PARAM = 'status'
const FROM_PARAM = 'de'
const TO_PARAM = 'ate'
const PAGE_PARAM = 'pagina'
const TREND_PARAM = 'grafico'

export interface HistoryFilters extends DayRange {
  search: string
  type: EvaluationType | null
  status: EvaluationStatus | null
}

export interface UseHistoryFiltersResult {
  filters: HistoryFilters
  page: number
  trend: EvaluationType | null
  hasFilters: boolean
  update: (patch: Partial<HistoryFilters>) => void
  setPage: (page: number) => void
  setTrend: (trend: EvaluationType | null) => void
  clear: () => void
}

const EMPTY_FILTERS: HistoryFilters = { search: '', type: null, status: null, from: null, to: null }

function readFilters(params: URLSearchParams): HistoryFilters {
  const from = parseDayKey(params.get(FROM_PARAM)) ? params.get(FROM_PARAM) : null
  const to = parseDayKey(params.get(TO_PARAM)) ? params.get(TO_PARAM) : null

  return {
    search: params.get(SEARCH_PARAM)?.trim() ?? '',
    type: TYPE_ORDER.find((type) => type === params.get(TYPE_PARAM)) ?? null,
    status: STATUS_ORDER.find((status) => status === params.get(STATUS_PARAM)) ?? null,
    from,
    to: from !== null && to !== null && to >= from ? to : null,
  }
}

function readPage(params: URLSearchParams): number {
  const page = Number(params.get(PAGE_PARAM))
  return Number.isInteger(page) && page >= 1 ? page : 1
}

function readTrend(params: URLSearchParams): EvaluationType | null {
  return TYPE_ORDER.find((type) => type === params.get(TREND_PARAM)) ?? null
}

function writeParams(
  filters: HistoryFilters,
  page: number,
  trend: EvaluationType | null,
): URLSearchParams {
  const params = new URLSearchParams()

  if (filters.search) params.set(SEARCH_PARAM, filters.search)
  if (filters.type) params.set(TYPE_PARAM, filters.type)
  if (filters.status) params.set(STATUS_PARAM, filters.status)
  if (filters.from) params.set(FROM_PARAM, filters.from)
  if (filters.from && filters.to) params.set(TO_PARAM, filters.to)
  if (page > 1) params.set(PAGE_PARAM, String(page))
  if (trend) params.set(TREND_PARAM, trend)

  return params
}

export function toHistoryQuery(filters: HistoryFilters, page: number): EvaluationListQuery {
  return {
    page,
    limit: HISTORY_PAGE_SIZE,
    search: filters.search || undefined,
    type: filters.type ?? undefined,
    status: filters.status ? STATUS_FILTER_STATUSES[filters.status] : undefined,
    ...rangeToInstants(filters),
  }
}

export function useHistoryFilters(): UseHistoryFiltersResult {
  const [params, setParams] = useSearchParams()
  const filters = readFilters(params)
  const page = readPage(params)
  const trend = readTrend(params)

  const apply = (next: HistoryFilters, nextPage: number, nextTrend = trend) => {
    setParams(writeParams(next, nextPage, nextTrend), { replace: true })
  }

  return {
    filters,
    page,
    trend,
    hasFilters: Boolean(filters.search || filters.type || filters.status || filters.from),
    update: (patch) => apply({ ...filters, ...patch }, 1),
    setPage: (nextPage) => apply(filters, nextPage),
    setTrend: (nextTrend) => apply(filters, page, nextTrend),
    clear: () => apply(EMPTY_FILTERS, 1),
  }
}
