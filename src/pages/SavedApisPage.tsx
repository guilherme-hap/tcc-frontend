import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Bookmark, Plus } from 'lucide-react'
import { SavedApiCard } from '../components/savedApis/SavedApiCard'
import { SavedApiForm } from '../components/savedApis/SavedApiForm'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Notice } from '../components/ui/Notice'
import { BODY, CARD, FRAME, PAGE_TITLE, RAIL } from '../components/ui/classes'
import { SAVED_APIS_KEY, useDocumentTitle, useSavedApis } from '../hooks'
import { deleteSavedApi } from '../services'
import { formatNumber } from '../utils/format'
import { NEW_API_BUTTON_ID, editButtonId } from '../utils/savedApi'

const SKELETON_CARDS = 3

export function SavedApisPage() {
  useDocumentTitle('APIs salvas')
  const queryClient = useQueryClient()
  const { apis, isLoading, error, refetch } = useSavedApis()
  const [creating, setCreating] = useState(false)
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

  const closeForm = () => {
    const id = editingId
    setEditingId(null)
    setCreating(false)
    requestAnimationFrame(() =>
      document.getElementById(id ? editButtonId(id) : NEW_API_BUTTON_ID)?.focus(),
    )
  }

  return (
    <div className={FRAME}>
      <aside aria-label="Resumo das APIs salvas" className={RAIL}>
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

        {creating ? null : (
          <div className="border-t border-border pt-5">
            <Button
              id={NEW_API_BUTTON_ID}
              variant="secondary"
              size="lg"
              icon={Plus}
              onClick={() => {
                setEditingId(null)
                setConfirmingId(null)
                setCreating(true)
              }}
            >
              Cadastrar API
            </Button>
          </div>
        )}
      </aside>

      <section aria-label="Lista de APIs salvas" className={BODY}>
        {creating ? <SavedApiForm key="new" editing={null} onDone={closeForm} /> : null}
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
            {apis.map((api) =>
              api.id === editing?.id ? (
                <li key={api.id}>
                  <SavedApiForm key={api.id} editing={api} onDone={closeForm} />
                </li>
              ) : (
                <SavedApiCard
                  key={api.id}
                  api={api}
                  isConfirming={api.id === confirmingId}
                  isDeleting={removal.isPending}
                  deleteError={removal.error?.message ?? null}
                  onEdit={() => {
                    setCreating(false)
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
              ),
            )}
          </ul>
        ) : creating ? null : (
          <EmptyState
            icon={Bookmark}
            title="Nenhuma API salva"
            description='Cadastre uma API pelo botão ou marque "Salvar esta API na conta" ao criar uma avaliação.'
          />
        )}
      </section>
    </div>
  )
}
