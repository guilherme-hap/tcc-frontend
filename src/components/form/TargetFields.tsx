import { ArrowRight, Bookmark } from 'lucide-react'
import type { SavedApi } from '../../types'
import { SAVED_APIS_PATH } from '../../utils/routes'
import { findSavedApiBySpec } from '../../utils/savedApi'
import { Button } from '../ui/Button'
import { CheckboxField, TextField } from '../ui/Field'
import { Listbox } from '../ui/Listbox'
import { Panel } from '../ui/Panel'
import { TextLink } from '../ui/TextLink'
import { applySavedApi } from './accountState'
import { usesBaseUrl, type EvaluationFormState, type FormErrors } from './formState'

const NONE = ''

interface TargetFieldsProps {
  form: EvaluationFormState
  errors: FormErrors
  savedApis: SavedApi[] | null
  specBaseUrl?: string
  onChange: (patch: Partial<EvaluationFormState>) => void
}

export function TargetFields({
  form,
  errors,
  savedApis,
  specBaseUrl,
  onChange,
}: TargetFieldsProps) {
  const selected = savedApis?.find((api) => api.id === form.savedApiId) ?? null
  const duplicate = selected ? null : findSavedApiBySpec(savedApis, form.openApiUrl)

  return (
    <Panel
      title="Alvo"
      description="A API é avaliada de fora: só a especificação e a URL base são necessárias."
      className="relative z-5"
      aside={
        savedApis ? (
          <TextLink to={SAVED_APIS_PATH} trailingIcon={ArrowRight}>
            Gerenciar APIs salvas
          </TextLink>
        ) : null
      }
    >
      <div className="flex min-w-0 flex-col gap-4">
        {savedApis ? (
          <Listbox
            label="API salva"
            icon={Bookmark}
            options={[
              { value: NONE, label: 'Nenhuma, preencher à mão' },
              ...savedApis.map((api) => ({ value: api.id, label: api.name })),
            ]}
            value={selected?.id ?? NONE}
            onChange={(id) =>
              onChange(applySavedApi(form, savedApis.find((api) => api.id === id) ?? null))
            }
            hint={
              selected
                ? 'Especificação, URL base e padrões desta API já estão aplicados. Qualquer campo pode ser alterado só para este pedido.'
                : 'Sem API salva, os campos começam vazios.'
            }
            controlClassName="max-w-105"
          />
        ) : null}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            id="openApiUrl"
            label="URL da especificação OpenAPI"
            type="url"
            mono
            placeholder="https://api.exemplo.com/openapi.json"
            hint="JSON ou YAML, OpenAPI 3.x ou Swagger 2.0."
            error={errors.openApiUrl}
            value={form.openApiUrl}
            onChange={(event) => onChange({ openApiUrl: event.target.value })}
          />
          {usesBaseUrl(form.type) ? (
            <TextField
              id="apiBaseUrl"
              label="URL base da API"
              optional
              type="url"
              mono
              placeholder={specBaseUrl ?? 'https://api.exemplo.com'}
              hint={
                specBaseUrl
                  ? `Vazia, usa ${specBaseUrl}, lida da especificação.`
                  : 'Vazia, usa o primeiro servidor declarado na especificação.'
              }
              error={errors.apiBaseUrl}
              value={form.apiBaseUrl}
              onChange={(event) => onChange({ apiBaseUrl: event.target.value })}
            />
          ) : null}
        </div>
        {duplicate ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-well px-4 py-3">
            <p className="min-w-0 text-ink-secondary">
              Esta especificação já está salva na conta como{' '}
              <span className="font-medium wrap-anywhere text-ink">{duplicate.name}</span>.
            </p>
            <Button onClick={() => onChange(applySavedApi(form, duplicate))}>
              Usar a API salva
            </Button>
          </div>
        ) : savedApis && !selected ? (
          <div className="flex flex-col gap-3 rounded-md border border-border bg-well px-4 py-3">
            <CheckboxField
              id="saveApi"
              label="Salvar esta API na conta"
              description="Guarda a especificação, a URL base e, como padrão da API, as regras do contrato e as opções do teste de carga deste pedido."
              checked={form.saveApi}
              onChange={(saveApi) => onChange({ saveApi })}
            />
            {form.saveApi ? (
              <div className="max-w-90 sm:ml-7">
                <TextField
                  id="savedApiName"
                  label="Nome da API"
                  placeholder="Catálogo de produtos"
                  error={errors.savedApiName}
                  value={form.savedApiName}
                  onChange={(event) => onChange({ savedApiName: event.target.value })}
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </Panel>
  )
}
