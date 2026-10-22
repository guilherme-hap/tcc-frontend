import type { IFirstFailure } from '../../types'
import { formatNumber } from '../../utils/format'
import { TRANSPORT_ERROR_LABELS } from '../../utils/labels'
import { InfoTip } from '../ui/InfoTip'

function transportLabel(errorCode: string): string | undefined {
  return TRANSPORT_ERROR_LABELS[errorCode]
}

export function FirstFailureLine({ failure }: { failure: IFirstFailure }) {
  const { statusCode, errorCode } = failure
  const label = errorCode === null ? undefined : transportLabel(errorCode)

  return (
    <p className="text-sm text-ink-secondary">
      Primeira falha:{' '}
      {statusCode !== null ? <span className="font-mono text-ink">HTTP {statusCode}</span> : null}
      {statusCode !== null && errorCode !== null ? ' · ' : null}
      {errorCode !== null ? (
        <>
          <span className="font-mono text-ink">{errorCode}</span>
          {label ? `, ${label}` : null}
        </>
      ) : null}
    </p>
  )
}

interface FirstFailureDetailProps {
  failure: IFirstFailure
  run: number | undefined
}

export function FirstFailureDetail({ failure, run }: FirstFailureDetailProps) {
  const { statusCode, errorCode, bodySnippet } = failure
  const label = errorCode === null ? undefined : transportLabel(errorCode)

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <h5 className="text-sm font-medium text-ink">
          Primeira falha{run !== undefined ? ` (execução ${formatNumber(run)})` : ''}
        </h5>
        <InfoTip label="Primeira falha">
          O código do primeiro 5xx e o do primeiro erro de conexão ou timeout vistos no teste, para
          indicar o que conferir na API. O corpo vem de uma única requisição de sondagem feita depois
          do teste, com os mesmos cabeçalhos (os valores deles são omitidos do texto), e só aparece se
          ela também devolver 5xx. Métodos que alteram dados não são sondados. Não entra na nota.
        </InfoTip>
      </div>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
        {statusCode !== null ? (
          <div className="flex flex-col gap-0.5">
            <dt className="text-sm text-ink-secondary">Primeiro 5xx</dt>
            <dd className="font-mono text-sm font-medium text-ink">HTTP {statusCode}</dd>
          </div>
        ) : null}
        {errorCode !== null ? (
          <div className="flex flex-col gap-0.5">
            <dt className="text-sm text-ink-secondary">Primeiro erro de conexão ou timeout</dt>
            <dd className="text-sm text-ink">
              <span className="font-mono font-medium">{errorCode}</span>
              {label ? <span className="text-ink-secondary">, {label}</span> : null}
            </dd>
          </div>
        ) : null}
      </dl>
      {bodySnippet ? (
        <figure className="flex min-w-0 flex-col gap-1">
          <figcaption className="text-xs text-ink-secondary">Início do corpo da resposta 5xx</figcaption>
          <pre className="rounded-md border border-border bg-well px-3 py-2 font-mono text-xs leading-5 break-all whitespace-pre-wrap text-ink">
            {bodySnippet}
          </pre>
        </figure>
      ) : statusCode !== null ? (
        <p className="text-xs text-ink-secondary">Sem corpo da resposta para mostrar.</p>
      ) : null}
    </div>
  )
}
