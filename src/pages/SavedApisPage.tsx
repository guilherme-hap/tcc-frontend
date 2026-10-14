import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Bookmark } from 'lucide-react'
import { SavedApiCard } from '../components/savedApis/SavedApiCard'
import { SavedApiForm } from '../components/savedApis/SavedApiForm'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Notice } from '../components/ui/Notice'
import { CARD } from '../components/ui/classes'
import { SAVED_APIS_KEY, useSavedApis } from '../hooks'
import { deleteSavedApi } from '../services'

const SKELETON_CARDS = 3

export function SavedApisPage() {
  const queryClient = useQueryClient()
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

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl leading-8 font-semibold tracking-[-0.01em] text-ink">
          APIs salvas
        </h1>
        <p className="max-w-[72ch] text-ink-secondary">
          Especificação, URL base e padrões de cada API, para a próxima avaliação começar
          preenchida. A lista mostra primeiro as mais recentes.
        </p>
      </div>
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section aria-label="Lista de APIs salvas" className="flex min-w-0 flex-col gap-3">
          {isLoading ? (
            <div role="status" aria-label="Carregando APIs salvas" className="flex flex-col gap-3">
              {Array.from({ length: SKELETON_CARDS }, (_, index) => (
                <div
                  key={index}
                  className={`h-52 animate-pulse border-border motion-reduce:animate-none ${CARD}`}
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
              description='Preencha o formulário ao lado ou marque "Salvar esta API na conta" ao criar uma avaliação.'
            />
          )}
        </section>
        <SavedApiForm
          key={editing?.id ?? 'new'}
          editing={editing}
          onDone={() => setEditingId(null)}
        />
      </div>
    </>
  )
}
