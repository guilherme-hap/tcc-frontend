import type { PillarName } from '../../types'
import { formatNumber } from '../../utils/format'
import { PILLAR_LABELS } from '../../utils/labels'
import { CheckboxField, FieldMessages, TextField } from '../ui/Field'
import { sumWeights, type EvaluationFormState, type FormErrors } from './formState'

const PILLARS: PillarName[] = ['contract', 'performance', 'security']

interface WeightsFieldsProps {
  form: EvaluationFormState
  errors: FormErrors
  onChange: (patch: Partial<EvaluationFormState>) => void
}

export function WeightsFields({ form, errors, onChange }: WeightsFieldsProps) {
  return (
    <div className="flex min-w-0 flex-col gap-5">
      <CheckboxField
        id="customWeights"
        label="Personalizar os pesos dos pilares"
        description="Por padrão, cada pilar vale 1/3 da nota final."
        checked={form.customWeights}
        onChange={(customWeights) => onChange({ customWeights })}
      />
      {form.customWeights ? (
        <div className="flex flex-col gap-2 sm:ml-7">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {PILLARS.map((pillar) => (
              <TextField
                key={pillar}
                id={`weight-${pillar}`}
                label={PILLAR_LABELS[pillar]}
                inputMode="decimal"
                mono
                suffix="%"
                aria-invalid={errors.weights ? true : undefined}
                value={form.weights[pillar]}
                onChange={(event) =>
                  onChange({ weights: { ...form.weights, [pillar]: event.target.value } })
                }
              />
            ))}
          </div>
          <FieldMessages
            id="weights"
            error={errors.weights}
            hint={`Soma atual: ${formatNumber(sumWeights(form.weights))}%`}
          />
        </div>
      ) : null}
    </div>
  )
}
