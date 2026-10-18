import { useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { SAVED_APIS_KEY, useFocusFirstInvalid } from '../../hooks'
import { ApiError, SAVED_API_EXISTS_CODE, createSavedApi, updateSavedApi } from '../../services'
import type { IValidationIssue, SavedApi, SavedApiDefaults } from '../../types'
import { INVALID_URL_MESSAGE, isHttpUrl } from '../../utils/validation'
import { applySavedApi, buildSavedDefaults } from '../form/accountState'
import { describeOptions, describeRules } from '../form/describe'
import { LoadOptionsBody } from '../form/LoadOptionsFields'
import { RuleCatalogFields } from '../form/RuleCatalogFields'
import {
  createInitialFormState,
  hasLoadOptionError,
  mapServerIssues,
  type EvaluationFormState,
  type FormErrors,
} from '../form/formState'
import { Button } from '../ui/Button'
import { Disclosure } from '../ui/Disclosure'
import { TextField } from '../ui/Field'
import { Notice } from '../ui/Notice'
import { CARD, OVERLINE } from '../ui/classes'

const DEFAULT_SETTINGS_PREFIX = 'defaultSettings.'

interface SavedApiFormProps {
  editing: SavedApi | null
  onDone: () => void
}

export function SavedApiForm({ editing, onDone }: SavedApiFormProps) {
  const queryClient = useQueryClient()
  const { ref: formRef, focusFirstInvalid } = useFocusFirstInvalid<HTMLFormElement>()
  const [name, setName] = useState(editing?.name ?? '')
  const [openApiUrl, setOpenApiUrl] = useState(editing?.openApiUrl ?? '')
  const [apiBaseUrl, setApiBaseUrl] = useState(editing?.apiBaseUrl ?? '')
  const [defaults, setDefaults] = useState<EvaluationFormState>(() =>
    editing ? applySavedApi(createInitialFormState(), editing) : createInitialFormState(),
  )
  const [errors, setErrors] = useState<FormErrors>({})
  const [unmatched, setUnmatched] = useState<IValidationIssue[]>([])
  const [rulesOpen, setRulesOpen] = useState(false)
  const [optionsOpen, setOptionsOpen] = useState(false)

  const update = (patch: Partial<EvaluationFormState>) =>
    setDefaults((current) => ({ ...current, ...patch }))

  const mutation = useMutation({
    mutationFn: (settings: SavedApiDefaults | undefined) => {
      const values = { name: name.trim(), openApiUrl: openApiUrl.trim() }
      const base = apiBaseUrl.trim()

      return editing
        ? updateSavedApi({
            id: editing.id,
            changes: { ...values, apiBaseUrl: base || null, defaultSettings: settings ?? null },
          })
        : createSavedApi({ ...values, apiBaseUrl: base || undefined, defaultSettings: settings })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [SAVED_APIS_KEY] })
      onDone()
    },
    onError: (error) => {
      if (!(error instanceof ApiError)) return

      if (error.code === SAVED_API_EXISTS_CODE) {
        setErrors({ openApiUrl: error.message })
        setUnmatched([])
        focusFirstInvalid()
        return
      }

      const mapped = mapServerIssues(
        defaults,
        error.issues.map((issue) => ({
          ...issue,
          path: issue.path.startsWith(DEFAULT_SETTINGS_PREFIX)
            ? issue.path.slice(DEFAULT_SETTINGS_PREFIX.length)
            : issue.path,
        })),
      )
      const next = { ...mapped.errors }
      const rest = mapped.unmatched.filter((issue) => {
        if (issue.path !== 'name') return true
        next.name ??= issue.message
        return false
      })

      setErrors(next)
      setUnmatched(rest)
      if (hasLoadOptionError(next)) setOptionsOpen(true)
      focusFirstInvalid()
    },
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (mutation.isPending) return

    mutation.reset()
    setUnmatched([])
    const next: FormErrors = {}
    if (!name.trim()) next.name = 'Informe o nome.'
    if (!isHttpUrl(openApiUrl.trim())) next.openApiUrl = INVALID_URL_MESSAGE
    if (apiBaseUrl.trim() && !isHttpUrl(apiBaseUrl.trim())) next.apiBaseUrl = INVALID_URL_MESSAGE

    const built = buildSavedDefaults(defaults)
    if (!built.ok) Object.assign(next, built.errors)

    setErrors(next)
    if (hasLoadOptionError(next)) setOptionsOpen(true)

    if (built.ok && Object.keys(next).length === 0) {
      mutation.mutate(built.defaults)
    } else {
      focusFirstInvalid()
    }
  }

  const hasFieldErrors = Object.keys(errors).length > 0

  return (
    <section
      aria-labelledby="saved-api-form-title"
      className={`flex min-w-0 flex-col ${CARD} border-accent-ink/55`}
    >
      <div className="flex flex-col gap-0.5 px-4 py-3">
        <h2 id="saved-api-form-title" className={OVERLINE}>
          {editing ? 'Editar API' : 'Cadastrar API'}
        </h2>
        <p className="text-sm text-ink-secondary">
          {editing
            ? 'As alterações valem para as próximas avaliações.'
            : 'Cadastre uma API sem precisar avaliar agora.'}
        </p>
      </div>
      <form
        ref={formRef}
        noValidate
        onSubmit={handleSubmit}
        className="@container flex min-w-0 flex-col gap-4 border-t border-border p-4"
      >
        <div className="grid min-w-0 grid-cols-1 gap-4 @2xl:grid-cols-2">
          <TextField
            id="api-name"
            name="name"
            label="Nome"
            placeholder="Catálogo de produtos"
            autoFocus
            error={errors.name}
            value={name}
            onChange={(event) => setName(event.target.value)}
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
          <div className="@2xl:col-span-2">
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
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <Disclosure
            title="Regras do contrato"
            aside={describeRules(defaults)}
            open={rulesOpen}
            onToggle={setRulesOpen}
          >
            <RuleCatalogFields form={defaults} onChange={update} />
          </Disclosure>
          <Disclosure
            title="Teste de carga"
            aside={describeOptions(defaults)}
            open={optionsOpen}
            onToggle={setOptionsOpen}
          >
            <LoadOptionsBody form={defaults} errors={errors} onChange={update} />
          </Disclosure>
        </div>
        <p className="text-sm text-ink-secondary">
          Estes padrões preenchem a nova avaliação da API. Pesos por severidade, nota mínima e
          endpoints não são guardados com ela.
        </p>

        {mutation.isError && (unmatched.length > 0 || !hasFieldErrors) ? (
          <Notice tone="error" title="A API não foi salva.">
            {unmatched.length > 0 ? (
              <ul className="flex list-disc flex-col gap-1 pl-4">
                {unmatched.map((issue) => (
                  <li key={`${issue.path}-${issue.message}`}>{issue.message}</li>
                ))}
              </ul>
            ) : (
              mutation.error.message
            )}
          </Notice>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="primary" size="lg" loading={mutation.isPending}>
            {editing ? 'Salvar alterações' : 'Cadastrar API'}
          </Button>
          <Button variant="ghost" size="lg" disabled={mutation.isPending} onClick={onDone}>
            Cancelar
          </Button>
        </div>
      </form>
    </section>
  )
}
