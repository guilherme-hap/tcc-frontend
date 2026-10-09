import { Plus, Trash2 } from 'lucide-react'
import { formatMilliseconds } from '../../utils/format'
import { Button } from '../ui/Button'
import { Disclosure } from '../ui/Disclosure'
import { CheckboxField, FieldMessages, TextField, TextInput } from '../ui/Field'
import { IconButton } from '../ui/IconButton'
import {
  createHeaderDraft,
  parseDecimal,
  type EvaluationFormState,
  type FormErrors,
  type HeaderDraft,
  type NumericOptionKey,
} from './formState'

interface NumericOptionField {
  key: NumericOptionKey
  label: string
  placeholder: string
  suffix?: string
  hint?: string
}

const NUMERIC_FIELDS: NumericOptionField[] = [
  { key: 'duration', label: 'Duração por endpoint', placeholder: '10', suffix: 's' },
  { key: 'connections', label: 'Conexões simultâneas', placeholder: '10' },
  {
    key: 'targetLatency',
    label: 'Tempo-alvo T do Apdex',
    placeholder: '1000',
    suffix: 'ms',
    hint: 'A duração precisa ser maior que 4 × T.',
  },
  { key: 'maxRequests', label: 'Máximo de requisições', placeholder: 'Sem limite' },
  { key: 'requestsPerSecond', label: 'Requisições por segundo', placeholder: 'Sem limite' },
]

function describeOptions(form: EvaluationFormState): string {
  const parts: string[] = []

  const latency = parseDecimal(form.numericOptions.targetLatency)
  if (form.numericOptions.targetLatency.trim() && Number.isFinite(latency) && latency > 0) {
    parts.push(`T = ${formatMilliseconds(latency)}`)
  }

  const changed = NUMERIC_FIELDS.filter(
    (field) => field.key !== 'targetLatency' && form.numericOptions[field.key].trim(),
  ).length
  if (changed > 0) parts.push(`${changed} ${changed === 1 ? 'limite alterado' : 'limites alterados'}`)

  const headers = form.headers.filter((header) => header.name.trim()).length
  if (headers > 0) parts.push(`${headers} ${headers === 1 ? 'cabeçalho' : 'cabeçalhos'}`)

  if (form.allowHighLoad) parts.push('carga elevada')

  return parts.length > 0 ? parts.join(' · ') : 'Padrões'
}

interface LoadOptionsFieldsProps {
  form: EvaluationFormState
  errors: FormErrors
  open: boolean
  onToggle: (open: boolean) => void
  onChange: (patch: Partial<EvaluationFormState>) => void
}

export function LoadOptionsFields({ form, errors, open, onToggle, onChange }: LoadOptionsFieldsProps) {
  const updateHeader = (id: string, patch: Partial<HeaderDraft>) => {
    onChange({
      headers: form.headers.map((header) => (header.id === id ? { ...header, ...patch } : header)),
    })
  }

  return (
    <Disclosure
      title="Opções do teste de carga"
      aside={describeOptions(form)}
      open={open}
      onToggle={onToggle}
    >
      <div className="flex min-w-0 flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {NUMERIC_FIELDS.map((field) => (
            <TextField
              key={field.key}
              id={`option-${field.key}`}
              label={field.label}
              inputMode="decimal"
              mono
              placeholder={field.placeholder}
              suffix={field.suffix}
              hint={field.hint}
              error={errors[`options.${field.key}`]}
              value={form.numericOptions[field.key]}
              onChange={(event) =>
                onChange({
                  numericOptions: { ...form.numericOptions, [field.key]: event.target.value },
                })
              }
            />
          ))}
        </div>

        <fieldset className="flex min-w-0 flex-col gap-3">
          <legend className="mb-1 font-medium text-ink">Cabeçalhos das requisições</legend>
          <p className="text-ink-secondary">
            Use para endpoints protegidos, por exemplo Authorization. Os valores são apagados da
            fila quando a avaliação termina.
          </p>
          {form.headers.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {form.headers.map((header, index) => {
                const error = errors[`headers.${header.id}`]
                const position = index + 1

                return (
                  <li key={header.id} className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <TextInput
                        mono
                        aria-label={`Nome do cabeçalho ${position}`}
                        aria-invalid={error ? true : undefined}
                        aria-describedby={error ? `header-${header.id}-message` : undefined}
                        value={header.name}
                        onChange={(event) => updateHeader(header.id, { name: event.target.value })}
                        placeholder="Authorization"
                        className="flex-1 sm:max-w-55"
                      />
                      <TextInput
                        mono
                        aria-label={`Valor do cabeçalho ${position}`}
                        value={header.value}
                        onChange={(event) => updateHeader(header.id, { value: event.target.value })}
                        placeholder="Bearer ..."
                        className="flex-1"
                      />
                      <IconButton
                        icon={Trash2}
                        label={`Remover cabeçalho ${position}`}
                        onClick={() =>
                          onChange({ headers: form.headers.filter((item) => item.id !== header.id) })
                        }
                      />
                    </div>
                    <FieldMessages id={`header-${header.id}`} error={error} />
                  </li>
                )
              })}
            </ul>
          ) : null}
          <div>
            <Button
              icon={Plus}
              onClick={() => onChange({ headers: [...form.headers, createHeaderDraft()] })}
            >
              Adicionar cabeçalho
            </Button>
          </div>
        </fieldset>

        <CheckboxField
          id="allowHighLoad"
          label="Permitir carga elevada"
          description="Sobe os limites para 300 s, 500 conexões, 1 milhão de requisições e 10 mil requisições por segundo."
          checked={form.allowHighLoad}
          onChange={(allowHighLoad) => onChange({ allowHighLoad })}
        />
      </div>
    </Disclosure>
  )
}
