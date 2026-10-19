import type { IPerformanceTarget, IStepProgress } from '../../types'
import { formatCount, formatNumber } from '../../utils/format'
import { PROGRESS_PHASE_LABELS } from '../../utils/labels'
import { liveElapsedSeconds } from '../../utils/steps'
import { Badge } from '../ui/Badge'

interface PerformanceProgressProps {
  progress: IStepProgress
  targets: IPerformanceTarget[] | null
  tickAt: number
  now: number
  limitedRequests: boolean
  showTarget?: boolean
}

export function PerformanceProgress({
  progress,
  targets,
  tickAt,
  now,
  limitedRequests,
  showTarget = true,
}: PerformanceProgressProps) {
  const { targetIndex, totalTargets, phase, expectedDurationSeconds, run, totalRuns } = progress
  const target = targets?.[targetIndex]
  const elapsed = liveElapsedSeconds(progress, tickAt, now)
  const fraction = expectedDurationSeconds > 0 ? elapsed / expectedDurationSeconds : 0
  const position = `Endpoint ${formatNumber(targetIndex + 1)} de ${formatNumber(totalTargets)}`
  const runLabel = totalRuns > 1 ? `Execução ${formatNumber(run)} de ${formatNumber(totalRuns)}` : null

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        {runLabel ? <span className="font-medium text-ink">{runLabel}</span> : null}
        {phase === 'RESTING' ? null : <span className="font-medium text-ink">{position}</span>}
        {showTarget && target ? (
          <span className="flex min-w-0 items-center gap-2">
            <Badge mono>{target.method ?? 'GET'}</Badge>
            <span title={target.path} className="truncate font-mono text-xs text-ink">
              {target.path}
            </span>
          </span>
        ) : null}
        <Badge tone={phase === 'RUNNING' ? 'accent' : 'neutral'}>
          {PROGRESS_PHASE_LABELS[phase]}
        </Badge>
      </div>
      {totalRuns > 1 ? (
        <div aria-hidden="true" className="flex h-1.5 gap-0.5">
          {Array.from({ length: totalRuns }, (_, index) => (
            <span
              key={index}
              className={`flex-1 rounded-xs ${index < run - 1 ? 'bg-pillar-performance' : index === run - 1 ? 'bg-pillar-performance/45' : 'bg-idle'}`}
            />
          ))}
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-label={`Teste de carga: ${position}`}
        aria-valuemin={0}
        aria-valuemax={expectedDurationSeconds}
        aria-valuenow={Math.round(elapsed)}
        aria-valuetext={
          phase === 'RUNNING'
            ? `${formatNumber(Math.floor(elapsed))} de ${formatNumber(expectedDurationSeconds)} segundos`
            : PROGRESS_PHASE_LABELS[phase]
        }
        className="flex h-2 gap-0.5"
      >
        {Array.from({ length: totalTargets }, (_, index) => (
          <span key={index} className="relative flex-1 overflow-hidden rounded-xs bg-idle">
            {index < targetIndex ? (
              <span className="absolute inset-0 bg-pillar-performance" />
            ) : index === targetIndex ? (
              <span
                className="absolute inset-y-0 left-0 bg-pillar-performance transition-[width] duration-300 ease-linear motion-reduce:transition-none"
                style={{ width: `${Math.min(100, fraction * 100)}%` }}
              />
            ) : null}
          </span>
        ))}
      </div>
      <p className="text-sm text-ink-secondary">
        {phase === 'QUEUED' ? (
          'Na fila do teste de carga: o auditor roda um teste de carga por vez.'
        ) : phase === 'RESTING' ? (
          `Aguardando ${formatNumber(expectedDurationSeconds)} s para a API voltar ao repouso antes da próxima execução.`
        ) : (
          <>
            <span className="font-mono text-ink tabular-nums">
              {formatNumber(Math.floor(elapsed))} de {formatNumber(expectedDurationSeconds)} s
            </span>
            {' · '}
            {formatCount(progress.responses, 'resposta', 'respostas')}
            {' · '}
            <span className={progress.errors > 0 ? 'text-error' : undefined}>
              {formatCount(progress.errors, 'erro', 'erros')}
            </span>
            {limitedRequests ? '. Com limite de requisições, o teste pode terminar antes.' : null}
          </>
        )}
      </p>
    </div>
  )
}
