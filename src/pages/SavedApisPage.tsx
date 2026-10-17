import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Bookmark, ChevronRight } from 'lucide-react'
import { SavedApiCard } from '../components/savedApis/SavedApiCard'
import { SavedApiForm } from '../components/savedApis/SavedApiForm'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Icon } from '../components/ui/Icon'
import { Notice } from '../components/ui/Notice'
import { BODY, CARD, FOCUS_RING, FRAME, PAGE_TITLE, RAIL } from '../components/ui/classes'
import { SAVED_APIS_KEY, useDocumentTitle, useSavedApis, useWideLayout } from '../hooks'
import { deleteSavedApi } from '../services'
import { formatNumber } from '../utils/format'
import { editButtonId } from '../utils/savedApi'

const SKELETON_CARDS = 3

export function SavedApisPage() {
  useDocumentTitle('APIs salvas')
  const queryClient = useQueryClient()
  const wide = useWideLayout()
  const { apis, isLoading, error, refetch } = useSavedApis()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const removal = useMutation({
    mutationFn: deleteSavedApi,
    onSuccess: async (_result, id) => {
      await queryClient.invalidateQueries({ queryKey: [SAVED_APIS_KEY] })
      setConfirmingId(null)
      setEditingId((current) => (current === id ? null : current))
    },
  })

  const editing = apis?.find((api) => api.id === editingId) ?? null
  const count = apis?.length ?? 0

  const form = (
    <SavedApiForm
      key={editing?.id ?? 'new'}
      editing={editing}
      showTitle={wide}
      onDone={() => {
        const id = editingId
        setEditingId(null)
        if (id) requestAnimationFrame(() => document.getElementById(editButtonId(id))?.focus())
      }}
    />
  )

  return (
    <div className={FRAME}>
      <aside aria-label="Resumo e cadastro de APIs" className={RAIL}>
        <div className="flex flex-col gap-3">
          <h1 className={PAGE_TITLE}>APIs salvas</h1>
          <p className="text-sm leading-5 text-ink-secondary">
            Especificação, URL base e padrões de cada API, para a próxima avaliação começar
            preenchida. A lista mostra primeiro as mais recentes.
          </p>
        </div>

        <p className="flex items-baseline gap-2.5">
          <span className="num text-[44px] leading-none text-ink">
            {apis ? formatNumber(count) : '–'}
          </span>
          <span className="text-sm text-ink-secondary">
            {count === 1 ? 'API' : 'APIs'} na conta
          </span>
        </p>

        {wide ? (
          <section className="border-t border-border pt-5">{form}</section>
        ) : (
          <details open={editing ? true : undefined} className="group border-t border-border">
            <summary
              className={`flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-sm text-sm font-medium text-ink-secondary [&::-webkit-details-marker]:hidden ${FOCUS_RING}`}
            >
              <Icon
                icon={ChevronRight}
                size={14}
                className="transition-transform duration-150 group-open:rotate-90"
              />
              {editing ? 'Editar API' : 'Salvar uma API'}
            </summary>
            <div className="pt-2 pb-2">{form}</div>
          </details>
        )}
      </aside>

      <section aria-label="Lista de APIs salvas" className={BODY}>
        {isLoading ? (
          <div role="status" aria-label="Carregando APIs salvas" className="flex flex-col gap-3">
            {Array.from({ length: SKELETON_CARDS }, (_, index) => (
              <div
                key={index}
                className={`h-44 animate-pulse border-border motion-reduce:animate-none ${CARD}`}
              />
            ))}
          </div>
        ) : error ? (
          <>
            <Notice tone="error" title="Não foi possível carregar as APIs salvas.">
              {error}
            </Notice>
            <div>
              <Button onClick={refetch}>Tentar de novo</Button>
            </div>
          </>
        ) : apis && apis.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {apis.map((api) => (
              <SavedApiCard
                key={api.id}
                api={api}
                isEditing={api.id === editingId}
                isConfirming={api.id === confirmingId}
                isDeleting={removal.isPending}
                deleteError={removal.error?.message ?? null}
                onEdit={() => {
                  setEditingId(api.id)
                  setConfirmingId(null)
                }}
                onAskRemove={() => {
                  removal.reset()
                  setConfirmingId(api.id)
                }}
                onCancelRemove={() => setConfirmingId(null)}
                onRemove={() => removal.mutate(api.id)}
              />
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={Bookmark}
            title="Nenhuma API salva"
            description='Cadastre uma API pelo formulário ou marque "Salvar esta API na conta" ao criar uma avaliação.'
          />
        )}
      </section>
    </div>
  )
}
