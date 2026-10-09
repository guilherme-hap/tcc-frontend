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
  type FormErrors,
  type TargetDraft,
} from './formState'

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
