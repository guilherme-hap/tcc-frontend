import { useRef } from 'react'
import { Pencil, Play, Trash2 } from 'lucide-react'
import type { SavedApi } from '../../types'
import { formatDateTime } from '../../utils/format'
import { savedApiEvaluationPath } from '../../utils/routes'
import { editButtonId } from '../../utils/savedApi'
import { applySavedApi } from '../form/accountState'
import { describeOptions, describeRules } from '../form/describe'
import { createInitialFormState } from '../form/formState'
import { Button } from '../ui/Button'
import { ConfirmBar } from '../ui/ConfirmBar'
import { LinkButton } from '../ui/LinkButton'
import { MetaList } from '../ui/MetaList'
import { CARD } from '../ui/classes'

interface SavedApiCardProps {
  api: SavedApi
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

  return (
    <li className={`flex min-w-0 flex-col ${CARD} ${isConfirming ? 'border-error/40' : 'border-border'}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-base font-semibold tracking-[-0.01em] wrap-anywhere text-ink">
              {api.name}
            </h2>
          </div>
          <span className="text-xs text-ink-secondary">
            Atualizada em{' '}
            <span className="font-mono tabular-nums">{formatDateTime(api.updatedAt)}</span>
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <LinkButton
            to={savedApiEvaluationPath(api.id)}
            icon={Play}
            label={`Avaliar ${api.name}`}
          >
            Avaliar
          </LinkButton>
          <Button
            id={editButtonId(api.id)}
            variant="ghost"
            icon={Pencil}
            aria-label={`Editar ${api.name}`}
            onClick={onEdit}
          >
            Editar
          </Button>
          <Button
            ref={removeRef}
            variant="ghost"
            icon={Trash2}
            aria-label={`Excluir ${api.name}`}
            onClick={onAskRemove}
          >
            Excluir
          </Button>
        </div>
      </div>
      {isConfirming ? (
        <ConfirmBar
          title={`Excluir "${api.name}"?`}
          description="A exclusão não pode ser desfeita. As avaliações já feitas continuam no histórico."
          confirmLabel="Excluir API"
          pending={isDeleting}
          error={deleteError}
          className="border-t"
          onConfirm={onRemove}
          onCancel={() => {
            onCancelRemove()
            removeRef.current?.focus()
          }}
        />
      ) : null}
      <MetaList
        className="border-t border-border px-4 py-3"
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
    </li>
  )
}
