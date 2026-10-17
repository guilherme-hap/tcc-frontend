import { useState } from 'react'
import { ListTree, RotateCcw, X } from 'lucide-react'
import type { UseSpecOperationsResult } from '../../hooks'
import type { ISpecOperation } from '../../types'
import { formatCount } from '../../utils/format'
import { isHttpUrl } from '../../utils/validation'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Checkbox, TextInput } from '../ui/Field'
import { Notice } from '../ui/Notice'
import { OVERLINE } from '../ui/classes'
import { MAX_TARGETS, type TargetDraft } from './formState'
import {
  addOperation,
  countFilledTargets,
  groupByTag,
  isTargetOf,
  matchesOperation,
  removeOperation,
} from './specOperations'

const BOX = 'flex min-w-0 flex-col gap-3 rounded-md border border-border bg-well px-4 py-3'

interface OperationRowProps {
  operation: ISpecOperation
  index: number
  selected: boolean
  disabled: boolean
  onToggle: (selected: boolean) => void
}

function OperationRow({ operation, index, selected, disabled, onToggle }: OperationRowProps) {
  const inputId = `operation-${index}`

  return (
    <li className="flex items-start gap-3 border-b border-border px-3 py-2.5 last:border-b-0">
      <Checkbox
        id={inputId}
        checked={selected}
        disabled={disabled}
        onChange={onToggle}
        aria-describedby={operation.summary ? `${inputId}-summary` : undefined}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Badge mono>{operation.method}</Badge>
          <label
            htmlFor={inputId}
            className={`font-mono text-sm font-medium break-all ${disabled ? 'text-ink-muted' : 'cursor-pointer text-ink'}`}
          >
            {operation.path}
          </label>
          {operation.deprecated ? <Badge tone="warning">Obsoleta</Badge> : null}
          {operation.requiresAuth ? <Badge>Exige autenticação</Badge> : null}
        </div>
        {operation.summary ? (
          <p id={`${inputId}-summary`} className="text-sm text-ink-secondary">
            {operation.summary}
          </p>
        ) : null}
      </div>
    </li>
  )
}

interface OperationPickerProps {
  openApiUrl: string
  requested: boolean
  operations: UseSpecOperationsResult
  targets: TargetDraft[]
  onRequest: () => void
  onClose: () => void
  onChange: (targets: TargetDraft[]) => void
}

export function OperationPicker({
  openApiUrl,
  requested,
  operations: { spec, isFetching, error, refetch },
  targets,
  onRequest,
  onClose,
  onChange,
}: OperationPickerProps) {
  const [search, setSearch] = useState('')
  const validUrl = isHttpUrl(openApiUrl)

  if (!requested || (!spec && !error)) {
    return (
      <div className={`${BOX} sm:flex-row sm:items-center sm:justify-between`}>
        <p className="min-w-0 text-ink-secondary">
          {validUrl
            ? 'Escolha os endpoints na lista de operações da especificação, ou digite abaixo.'
            : 'Informe a URL da especificação no painel Alvo para escolher os endpoints numa lista, ou digite abaixo.'}
        </p>
        <Button
          icon={ListTree}
          disabled={!validUrl}
          loading={requested && isFetching}
          onClick={onRequest}
        >
          Listar operações
        </Button>
      </div>
    )
  }

  if (!spec) {
    return (
      <div className="flex flex-col gap-3">
        <Notice tone="error" title="Não foi possível listar as operações da especificação.">
          {error} Os endpoints ainda podem ser digitados abaixo.
        </Notice>
        <div className="flex flex-wrap gap-2">
          <Button icon={RotateCcw} loading={isFetching} onClick={refetch}>
            Tentar de novo
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    )
  }

  const term = search.trim().toLowerCase()
  const groups = groupByTag(spec.operations.filter((operation) => matchesOperation(operation, term)))
  const full = countFilledTargets(targets) >= MAX_TARGETS
  const chosen = spec.operations.filter((operation) =>
    targets.some((target) => isTargetOf(target, operation)),
  ).length

  const toggle = (operation: ISpecOperation, selected: boolean) => {
    onChange(selected ? addOperation(targets, operation) : removeOperation(targets, operation))
  }

  return (
    <div className={BOX}>
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="font-medium text-ink">
            {spec.title ?? 'Especificação sem título'}
            {spec.oasVersion ? (
              <span className="ml-2 font-mono text-xs font-normal text-ink-secondary">
                OpenAPI {spec.oasVersion}
              </span>
            ) : null}
          </p>
          <p className="text-sm text-ink-secondary">
            {formatCount(spec.operations.length, 'operação', 'operações')} ·{' '}
            {formatCount(chosen, 'escolhida', 'escolhidas')}
            {full ? ` · limite de ${MAX_TARGETS} endpoints atingido` : ''}
          </p>
        </div>
        <Button variant="ghost" icon={X} onClick={onClose}>
          Fechar lista
        </Button>
      </div>
      {spec.operations.length === 0 ? (
        <p className="text-ink-secondary">
          A especificação não declara operações. Digite os endpoints abaixo.
        </p>
      ) : (
        <>
          <TextInput
            type="search"
            aria-label="Buscar operação por path ou resumo"
            placeholder="Buscar por path ou resumo"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          {groups.length > 0 ? (
            <div className="max-h-96 overflow-y-auto rounded-md border border-border bg-surface [scrollbar-color:var(--border-hover)_transparent] [scrollbar-width:thin]">
              {groups.map((group) => (
                <section key={group.tag} aria-label={group.tag}>
                  <h4
                    className={`sticky top-0 z-1 border-b border-border bg-surface-raised px-3 py-1.5 ${OVERLINE}`}
                  >
                    {group.tag}
                  </h4>
                  <ul>
                    {group.operations.map((operation) => {
                      const selected = targets.some((target) => isTargetOf(target, operation))
                      const index = spec.operations.indexOf(operation)

                      return (
                        <OperationRow
                          key={index}
                          operation={operation}
                          index={index}
                          selected={selected}
                          disabled={!selected && full}
                          onToggle={(next) => toggle(operation, next)}
                        />
                      )
                    })}
                  </ul>
                </section>
              ))}
            </div>
          ) : (
            <p className="text-ink-secondary">Nenhuma operação corresponde à busca.</p>
          )}
        </>
      )}
    </div>
  )
}
