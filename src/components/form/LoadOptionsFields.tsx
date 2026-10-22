import { Plus, Trash2 } from 'lucide-react'
import { formatNumber } from '../../utils/format'
import { Button } from '../ui/Button'
import { Disclosure } from '../ui/Disclosure'
import { CheckboxField, FieldMessages, TextField, TextInput } from '../ui/Field'
import { IconButton } from '../ui/IconButton'
import { describeOptions } from './describe'
import {
  DEFAULT_REPETITIONS,
  DEFAULT_REST_INTERVAL_SECONDS,
  createHeaderDraft,
  type EvaluationFormState,
  type FormErrors,
  type HeaderDraft,
  loadLimit,
  type NumericOptionKey,
} from './formState'

interface NumericOptionField {
  key: NumericOptionKey
  label: string
  placeholder: string
  suffix?: string
  hint?: string
  info?: string
}

const NUMERIC_FIELDS: NumericOptionField[] = [
  {
    key: 'duration',
    label: 'Duração por endpoint',
    placeholder: '10',
    suffix: 's',
    info: 'Cada endpoint roda por esta duração, um de cada vez. O padrão é 10 s, ou 5 s em métodos que alteram dados. Numa execução, a soma de todos os endpoints não pode passar de 600 s.',
  },
  {
    key: 'connections',
    label: 'Conexões simultâneas',
    placeholder: '10',
    info: 'Quantas conexões ficam abertas ao mesmo tempo contra cada endpoint.',
  },
  {
    key: 'targetLatency',
    label: 'Tempo-alvo T do Apdex',
    placeholder: '1000',
    suffix: 'ms',
    hint: 'A duração precisa ser maior que 4 × T.',
    info: 'Uma resposta até T é satisfeita, até 4 × T é tolerada e acima disso é frustrada. É a base da nota de desempenho (Apdex).',
  },
  { key: 'maxRequests', label: 'Máximo de requisições', placeholder: 'Sem limite' },
  { key: 'requestsPerSecond', label: 'Requisições por segundo', placeholder: 'Sem limite' },
]

const MEASUREMENT_FIELDS: NumericOptionField[] = [
  {
    key: 'repetitions',
    label: 'Execuções',
    placeholder: String(DEFAULT_REPETITIONS),
    info: `Quantas vezes o teste passa por todos os endpoints. A nota de cada endpoint é a média do Apdex das execuções, e a variação entre elas mede a estabilidade. O padrão é ${DEFAULT_REPETITIONS}.`,
  },
  {
    key: 'restIntervalSeconds',
    label: 'Intervalo entre execuções',
    placeholder: String(DEFAULT_REST_INTERVAL_SECONDS),
    suffix: 's',
    info: `Pausa entre uma execução e a próxima, para a API voltar ao repouso. O padrão é ${DEFAULT_REST_INTERVAL_SECONDS} s; 0 tira a pausa.`,
  },
]

const QUICK_MODE_NOTE =
  'Roda uma execução só: a nota sai de uma única medida e a estabilidade entre execuções não é medida.'

function limitHint(field: NumericOptionField, allowHighLoad: boolean): string | undefined {
  if (field.hint) return field.hint

  const limit = loadLimit(field.key, allowHighLoad)
  if (limit === undefined) return undefined

  return `Máximo ${formatNumber(limit)}${field.suffix ? ` ${field.suffix}` : ''}.`
}

const ELEVATED_LOAD_NOTE = `Sobe os máximos para ${formatNumber(loadLimit('duration', true) ?? 0)} s por endpoint, ${formatNumber(loadLimit('connections', true) ?? 0)} conexões, ${formatNumber(loadLimit('maxRequests', true) ?? 0)} requisições e ${formatNumber(loadLimit('requestsPerSecond', true) ?? 0)} requisições por segundo.`

interface LoadOptionsFieldsProps {
  form: EvaluationFormState
  errors: FormErrors
  open: boolean
  onToggle: (open: boolean) => void
  onChange: (patch: Partial<EvaluationFormState>) => void
}

export function LoadOptionsFields({ form, errors, open, onToggle, onChange }: LoadOptionsFieldsProps) {
  return (
    <Disclosure
      title="Opções do teste de carga"
      aside={describeOptions(form)}
      open={open}
      onToggle={onToggle}
    >
      <LoadOptionsBody form={form} errors={errors} onChange={onChange} />
    </Disclosure>
  )
}

interface LoadOptionsBodyProps {
  form: EvaluationFormState
  errors: FormErrors
  onChange: (patch: Partial<EvaluationFormState>) => void
}

export function LoadOptionsBody({ form, errors, onChange }: LoadOptionsBodyProps) {
  const renderNumericField = (field: NumericOptionField) => (
    <TextField
      key={field.key}
      id={`option-${field.key}`}
      label={field.label}
      inputMode="decimal"
      mono
      placeholder={field.placeholder}
      suffix={field.suffix}
      hint={limitHint(field, form.allowHighLoad)}
      info={field.info}
      error={errors[`options.${field.key}`]}
      value={form.numericOptions[field.key]}
      onChange={(event) =>
        onChange({
          numericOptions: { ...form.numericOptions, [field.key]: event.target.value },
        })
      }
    />
  )

  const updateHeader = (id: string, patch: Partial<HeaderDraft>) => {
    onChange({
      headers: form.headers.map((header) => (header.id === id ? { ...header, ...patch } : header)),
    })
  }

  return (
    <div className="@container min-w-0">
      <div className="flex min-w-0 flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 @lg:grid-cols-3">
          {NUMERIC_FIELDS.map(renderNumericField)}
        </div>

        <fieldset className="flex min-w-0 flex-col gap-3">
          <legend className="mb-1 font-medium text-ink">Repetição do teste</legend>
          {form.quickMode ? null : (
            <div className="grid grid-cols-1 gap-4 @lg:grid-cols-3">
              {MEASUREMENT_FIELDS.map(renderNumericField)}
            </div>
          )}
          <CheckboxField
            id="quickMode"
            label="Modo rápido"
            description={QUICK_MODE_NOTE}
            error={errors.quickMode}
            checked={form.quickMode}
            onChange={(quickMode) => onChange({ quickMode })}
          />
        </fieldset>

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
                      <div className="flex min-w-0 flex-1 flex-col gap-2 @lg:flex-row">
                        <TextInput
                          mono
                          aria-label={`Nome do cabeçalho ${position}`}
                          aria-invalid={error ? true : undefined}
                          aria-describedby={error ? `header-${header.id}-message` : undefined}
                          value={header.name}
                          onChange={(event) =>
                            updateHeader(header.id, { name: event.target.value })
                          }
                          placeholder="Authorization"
                          className="flex-1 @lg:max-w-55"
                        />
                        <TextInput
                          mono
                          aria-label={`Valor do cabeçalho ${position}`}
                          value={header.value}
                          onChange={(event) =>
                            updateHeader(header.id, { value: event.target.value })
                          }
                          placeholder="Bearer ..."
                          className="flex-1"
                        />
                      </div>
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
          description={ELEVATED_LOAD_NOTE}
          checked={form.allowHighLoad}
          onChange={(allowHighLoad) => onChange({ allowHighLoad })}
        />
      </div>
    </div>
  )
}
