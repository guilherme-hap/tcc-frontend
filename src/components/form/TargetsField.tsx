import { Plus, Trash2 } from 'lucide-react'
import type { HttpMethod } from '../../types'
import { Button } from '../ui/Button'
import { FieldMessages, SelectInput, TextArea, TextInput } from '../ui/Field'
import { IconButton } from '../ui/IconButton'
import {
  HTTP_METHODS,
  MAX_TARGETS,
  acceptsBody,
  createTargetDraft,
  pathPlaceholders,
  type FormErrors,
  type TargetDraft,
} from './formState'

interface PathParamFieldsProps {
  target: TargetDraft
  position: number
  errors: FormErrors
  onChange: (pathParams: Record<string, string>) => void
}

function PathParamFields({ target, position, errors, onChange }: PathParamFieldsProps) {
  const names = pathPlaceholders(target.path.trim())
  const required = target.method === 'DELETE'

  if (names.length === 0) return null

  return (
    <fieldset className="flex min-w-0 flex-col gap-2 sm:ml-7">
      <legend className="mb-2 text-[13px] text-ink-secondary">
        {required
          ? 'Valores dos parâmetros do path. Em DELETE todos são obrigatórios: nenhum valor é gerado, para não excluir dados reais.'
          : 'Valores dos parâmetros do path. Vazio, o valor é gerado a partir da especificação.'}
      </legend>
      <ul className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
        {names.map((name, index) => {
          const id = `target-${target.id}-param-${index}`
          const error = errors[`targets.${target.id}.pathParams.${name}`]

          return (
            <li key={name} className="flex min-w-0 flex-col gap-1">
              <div className="flex min-w-0 items-center gap-2">
                <label
                  htmlFor={id}
                  className="max-w-2/5 shrink-0 truncate font-mono text-[13px] text-ink-secondary"
                >
                  {`{${name}}`}
                </label>
                <TextInput
                  id={id}
                  mono
                  aria-label={`Valor de {${name}} no endpoint ${position}`}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? `${id}-message` : undefined}
                  value={target.pathParams[name] ?? ''}
                  onChange={(event) =>
                    onChange({ ...target.pathParams, [name]: event.target.value })
                  }
                  placeholder={required ? 'Obrigatório' : 'Gerado'}
                  className="flex-1"
                />
              </div>
              <FieldMessages id={id} error={error} />
            </li>
          )
        })}
      </ul>
    </fieldset>
  )
}

interface TargetsFieldProps {
  targets: TargetDraft[]
  errors: FormErrors
  onChange: (targets: TargetDraft[]) => void
}

export function TargetsField({ targets, errors, onChange }: TargetsFieldProps) {
  const updateTarget = (id: string, patch: Partial<TargetDraft>) => {
    onChange(targets.map((target) => (target.id === id ? { ...target, ...patch } : target)))
  }

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <ul className="flex flex-col gap-3">
        {targets.map((target, index) => {
          const pathError = errors[`targets.${target.id}.path`]
          const methodError = errors[`targets.${target.id}.method`]
          const payloadError = errors[`targets.${target.id}.payload`]
          const position = index + 1

          return (
            <li key={target.id} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="hidden w-5 shrink-0 text-right font-mono text-xs font-medium text-ink-muted sm:block"
                >
                  {position}
                </span>
                <SelectInput
                  mono
                  aria-label={`Método do endpoint ${position}`}
                  aria-invalid={methodError ? true : undefined}
                  aria-describedby={methodError ? `target-${target.id}-method-message` : undefined}
                  value={target.method}
                  onChange={(event) =>
                    updateTarget(target.id, { method: event.target.value as HttpMethod })
                  }
                  className="w-26 shrink-0 sm:w-29"
                >
                  {HTTP_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </SelectInput>
                <TextInput
                  mono
                  aria-label={`Path do endpoint ${position}`}
                  aria-invalid={pathError ? true : undefined}
                  aria-describedby={pathError ? `target-${target.id}-path-message` : undefined}
                  value={target.path}
                  onChange={(event) => updateTarget(target.id, { path: event.target.value })}
                  placeholder="/pets/{petId}"
                  className="flex-1"
                />
                <IconButton
                  icon={Trash2}
                  label={`Remover endpoint ${position}`}
                  disabled={targets.length === 1}
                  onClick={() => onChange(targets.filter((item) => item.id !== target.id))}
                />
              </div>
              {pathError || methodError ? (
                <div className="flex flex-col gap-1 sm:ml-7">
                  <FieldMessages id={`target-${target.id}-method`} error={methodError} />
                  <FieldMessages id={`target-${target.id}-path`} error={pathError} />
                </div>
              ) : null}
              <PathParamFields
                target={target}
                position={position}
                errors={errors}
                onChange={(pathParams) => updateTarget(target.id, { pathParams })}
              />
              {acceptsBody(target.method) ? (
                <div className="flex flex-col gap-1.5 sm:ml-7">
                  <TextArea
                    aria-label={`Payload JSON do endpoint ${position}`}
                    aria-invalid={payloadError ? true : undefined}
                    aria-describedby={`target-${target.id}-payload-message`}
                    value={target.payload}
                    onChange={(event) => updateTarget(target.id, { payload: event.target.value })}
                    rows={3}
                    placeholder='{ "name": "Rex" }'
                  />
                  <FieldMessages
                    id={`target-${target.id}-payload`}
                    error={payloadError}
                    hint="Payload JSON opcional. Vazio, um payload sintético é gerado a partir da especificação."
                  />
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>
      <div>
        <Button
          icon={Plus}
          disabled={targets.length >= MAX_TARGETS}
          onClick={() => onChange([...targets, createTargetDraft()])}
        >
          Adicionar endpoint
        </Button>
      </div>
    </div>
  )
}
