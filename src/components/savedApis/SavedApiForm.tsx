import { useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { SAVED_APIS_KEY } from '../../hooks'
import { ApiError, SAVED_API_EXISTS_CODE, createSavedApi, updateSavedApi } from '../../services'
import type { SavedApi } from '../../types'
import { INVALID_URL_MESSAGE, isHttpUrl, issuesByField } from '../../utils/validation'
import { Button } from '../ui/Button'
import { TextField } from '../ui/Field'
import { Notice } from '../ui/Notice'
import { Panel } from '../ui/Panel'

const FIELDS = ['name', 'openApiUrl', 'apiBaseUrl'] as const

type SavedApiErrors = Partial<Record<(typeof FIELDS)[number], string>>

interface SavedApiFormProps {
  editing: SavedApi | null
  onDone: () => void
}

export function SavedApiForm({ editing, onDone }: SavedApiFormProps) {
  const queryClient = useQueryClient()
  const [name, setName] = useState(editing?.name ?? '')
  const [openApiUrl, setOpenApiUrl] = useState(editing?.openApiUrl ?? '')
  const [apiBaseUrl, setApiBaseUrl] = useState(editing?.apiBaseUrl ?? '')
  const [errors, setErrors] = useState<SavedApiErrors>({})

  const mutation = useMutation({
    mutationFn: () => {
      const values = { name: name.trim(), openApiUrl: openApiUrl.trim() }
      const base = apiBaseUrl.trim()

      return editing
        ? updateSavedApi({ id: editing.id, changes: { ...values, apiBaseUrl: base || null } })
        : createSavedApi({ ...values, apiBaseUrl: base || undefined })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [SAVED_APIS_KEY] })
      setName('')
      setOpenApiUrl('')
      setApiBaseUrl('')
      onDone()
    },
    onError: (error) => {
      if (!(error instanceof ApiError)) return

      setErrors(
        error.code === SAVED_API_EXISTS_CODE
          ? { openApiUrl: error.message }
          : issuesByField(error.issues, FIELDS),
      )
    },
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (mutation.isPending) return

    mutation.reset()
    const next: SavedApiErrors = {}
    if (!name.trim()) next.name = 'Informe o nome.'
    if (!isHttpUrl(openApiUrl.trim())) next.openApiUrl = INVALID_URL_MESSAGE
    if (apiBaseUrl.trim() && !isHttpUrl(apiBaseUrl.trim())) next.apiBaseUrl = INVALID_URL_MESSAGE
    setErrors(next)

    if (Object.keys(next).length === 0) mutation.mutate()
  }

  return (
    <Panel
      title={editing ? 'Editar API' : 'Salvar API'}
      description={
        editing
          ? 'As alterações valem para as próximas avaliações.'
          : 'Cadastre uma API sem precisar avaliar agora.'
      }
    >
      <form noValidate onSubmit={handleSubmit} className="flex min-w-0 flex-col gap-4">
        <TextField
          id="api-name"
          name="name"
          label="Nome"
          placeholder="Catálogo de produtos"
          autoFocus={editing !== null}
          error={errors.name}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <TextField
          id="api-spec"
          name="openApiUrl"
          label="URL da especificação OpenAPI"
          type="url"
          mono
          placeholder="https://api.exemplo.com/openapi.json"
          hint="JSON ou YAML, OpenAPI 3.x ou Swagger 2.0."
          error={errors.openApiUrl}
          value={openApiUrl}
          onChange={(event) => setOpenApiUrl(event.target.value)}
        />
        <TextField
          id="api-base"
          name="apiBaseUrl"
          label="URL base da API"
          optional
          type="url"
          mono
          placeholder="https://api.exemplo.com"
          hint="Vazia, usa o primeiro servidor declarado na especificação."
          error={errors.apiBaseUrl}
          value={apiBaseUrl}
          onChange={(event) => setApiBaseUrl(event.target.value)}
        />
        {mutation.isError && Object.keys(errors).length === 0 ? (
          <Notice tone="error" title="A API não foi salva.">
            {mutation.error.message}
          </Notice>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="primary" size="lg" loading={mutation.isPending}>
            {editing ? 'Salvar alterações' : 'Salvar API'}
          </Button>
          {editing ? (
            <Button variant="ghost" size="lg" disabled={mutation.isPending} onClick={onDone}>
              Cancelar
            </Button>
          ) : null}
        </div>
        <p className="border-t border-border pt-4 text-[13px] text-ink-secondary">
          As regras do contrato e as opções do teste de carga entram como padrão da API ao marcar
          "Salvar esta API na conta" em uma nova avaliação.
        </p>
      </form>
    </Panel>
  )
}
