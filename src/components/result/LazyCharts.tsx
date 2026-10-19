import { lazy, Suspense, type ComponentProps } from 'react'

const RunLatencyChart = lazy(() =>
  import('./RunLatencyChart').then((module) => ({ default: module.RunLatencyChart })),
)
const RunScoreChart = lazy(() =>
  import('./RunScoreChart').then((module) => ({ default: module.RunScoreChart })),
)
const ScoreTrendChart = lazy(() =>
  import('../history/ScoreTrendChart').then((module) => ({ default: module.ScoreTrendChart })),
)
const SeriesChart = lazy(() =>
  import('./SeriesChart').then((module) => ({ default: module.SeriesChart })),
)

function ChartFallback({ height }: { height: string }) {
  return (
    <div
      role="status"
      aria-label="Carregando gráfico"
      className={`${height} animate-pulse rounded-md bg-well motion-reduce:animate-none`}
    />
  )
}

export function LazyRunLatencyChart(props: ComponentProps<typeof RunLatencyChart>) {
  return (
    <Suspense fallback={<ChartFallback height="h-56" />}>
      <RunLatencyChart {...props} />
    </Suspense>
  )
}

export function LazyRunScoreChart(props: ComponentProps<typeof RunScoreChart>) {
  return (
    <Suspense fallback={<ChartFallback height="h-80" />}>
      <RunScoreChart {...props} />
    </Suspense>
  )
}

export function LazySeriesChart(props: ComponentProps<typeof SeriesChart>) {
  return (
    <Suspense fallback={<ChartFallback height="h-96" />}>
      <SeriesChart {...props} />
    </Suspense>
  )
}

export function LazyScoreTrendChart(props: ComponentProps<typeof ScoreTrendChart>) {
  return (
    <Suspense fallback={<ChartFallback height="h-56" />}>
      <ScoreTrendChart {...props} />
    </Suspense>
  )
}
