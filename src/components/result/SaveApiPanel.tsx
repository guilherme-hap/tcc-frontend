import { useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { SAVED_APIS_KEY } from '../../hooks'
import { ApiError, SAVED_API_EXISTS_CODE, createSavedApi } from '../../services'
import type { EvaluationRecord } from '../../types'
import { toSavedDefaults } from '../../utils/savedApi'
import { Button } from '../ui/Button'
import { TextField } from '../ui/Field'

interface SaveApiPanelProps {
  evaluation: EvaluationRecord
  onSaved: () => void
  onCancel: () => void
}

export function SaveApiPanel({ evaluation, onSaved, onCancel }: SaveApiPanelProps) {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState<string | undefined>()

  const mutation = useMutation({
    mutationFn: createSavedApi,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [SAVED_APIS_KEY] })
      onSaved()
    },
    onError: (error) => {
      if (error instanceof ApiError && error.code === SAVED_API_EXISTS_CODE) {
        void queryClient.invalidateQueries({ queryKey: [SAVED_APIS_KEY] })
      }
    },
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (mutation.isPending) return

    mutation.reset()
    const trimmed = name.trim()
    setNameError(trimmed ? undefined : 'Informe o nome da API.')
    if (!trimmed) return

    mutation.mutate({
      name: trimmed,
      openApiUrl: evaluation.openApiUrl,
      apiBaseUrl: evaluation.apiBaseUrl ?? undefined,
      defaultSettings: toSavedDefaults(evaluation.requestSettings ?? {}),
    })
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="flex flex-wrap items-start gap-3 rounded-card border border-border bg-glass px-5 py-4"
    >
      <div className="max-w-90 min-w-0 flex-[1_1_16rem]">
        <TextField
          id="save-api-name"
          name="name"
          label="Nome da API"
          placeholder="Catálogo de produtos"
          autoFocus
          error={nameError ?? mutation.error?.message}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-2 pt-6.5">
        <Button type="submit" variant="primary" loading={mutation.isPending}>
          Salvar API
        </Button>
        <Button variant="ghost" disabled={mutation.isPending} onClick={onCancel}>
          Cancelar
        </Button>
      </div>
      <p className="basis-full text-ink-secondary">
        Guarda a especificação e a URL base desta avaliação para as próximas.
      </p>
    </form>
  )
}
