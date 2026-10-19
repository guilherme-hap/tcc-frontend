import { lazy, Suspense, type ComponentProps } from 'react'

const ScoreTrend = lazy(() =>
  import('./ScoreTrend').then((module) => ({ default: module.ScoreTrend })),
)

export function LazyScoreTrend(props: ComponentProps<typeof ScoreTrend>) {
  return (
    <Suspense
      fallback={
        <div
          role="status"
          aria-label="Carregando a evolução da nota"
          className="h-20 animate-pulse rounded-lg bg-surface motion-reduce:animate-none"
        />
      }
    >
      <ScoreTrend {...props} />
    </Suspense>
  )
}
