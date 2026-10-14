import { useRef } from 'react'
import { Pencil, Play, Trash2 } from 'lucide-react'
import type { SavedApi } from '../../types'
import { formatDateTime } from '../../utils/format'
import { savedApiEvaluationPath } from '../../utils/routes'
import { applySavedApi } from '../form/accountState'
import { describeOptions, describeRules } from '../form/describe'
import { createInitialFormState } from '../form/formState'
import { Button } from '../ui/Button'
import { ConfirmBar } from '../ui/ConfirmBar'
import { KeyValue } from '../ui/KeyValue'
import { LinkButton } from '../ui/LinkButton'
import { CARD } from '../ui/classes'

interface SavedApiCardProps {
  api: SavedApi
  isEditing: boolean
  isConfirming: boolean
  isDeleting: boolean
  deleteError: string | null
  onEdit: () => void
  onAskRemove: () => void
  onCancelRemove: () => void
  onRemove: () => void
}

export function SavedApiCard({
  api,
  isEditing,
  isConfirming,
  isDeleting,
  deleteError,
  onEdit,
  onAskRemove,
  onCancelRemove,
  onRemove,
}: SavedApiCardProps) {
  const removeRef = useRef<HTMLButtonElement>(null)
  const defaults = applySavedApi(createInitialFormState(), api)
  const border = isConfirming
    ? 'border-error/40'
    : isEditing
      ? 'border-accent-ink/55'
      : 'border-border'

  return (
    <li className={`flex min-w-0 flex-col ${CARD} ${border}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="font-display text-base font-semibold tracking-[-0.01em] wrap-anywhere text-ink">
            {api.name}
          </h2>
          <span className="text-[13px] text-ink-secondary">
            Atualizada em{' '}
            <span className="font-mono tabular-nums">{formatDateTime(api.updatedAt)}</span>
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            ref={removeRef}
            variant="ghost"
            icon={Trash2}
            aria-label={`Excluir ${api.name}`}
            onClick={onAskRemove}
          >
            Excluir
          </Button>
          <Button variant="ghost" icon={Pencil} aria-label={`Editar ${api.name}`} onClick={onEdit}>
            Editar
          </Button>
          <LinkButton
            to={savedApiEvaluationPath(api.id)}
            icon={Play}
            label={`Avaliar ${api.name}`}
          >
            Avaliar
          </LinkButton>
        </div>
      </div>
      {isConfirming ? (
        <ConfirmBar
          title={`Excluir "${api.name}"?`}
          description="A exclusão não pode ser desfeita. As avaliações já feitas continuam no histórico."
          confirmLabel="Excluir API"
          pending={isDeleting}
          error={deleteError}
          className="border-b"
          onConfirm={onRemove}
          onCancel={() => {
            onCancelRemove()
            removeRef.current?.focus()
          }}
        />
      ) : null}
      <div className="px-5 pt-2 pb-3">
        <KeyValue
          items={[
            { label: 'Especificação', value: api.openApiUrl, mono: true },
            {
              label: 'URL base',
              value: api.apiBaseUrl ?? 'Primeiro servidor da especificação',
              mono: api.apiBaseUrl !== null,
            },
            { label: 'Regras do contrato', value: describeRules(defaults) },
            { label: 'Opções do teste de carga', value: describeOptions(defaults) },
          ]}
        />
      </div>
    </li>
  )
}
