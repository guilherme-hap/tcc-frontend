import { SEVERITY_LABELS, SEVERITY_ORDER } from '../../utils/labels'
import { Disclosure } from '../ui/Disclosure'
import { CheckboxField, FieldMessages, TextField } from '../ui/Field'
import { RuleCatalogFields } from './RuleCatalogFields'
import { RuleSetFields } from './RuleSetFields'
import { describeRules } from './describe'
import type { EvaluationFormState, FormErrors } from './formState'

interface ContractRulesFieldsProps {
  form: EvaluationFormState
  errors: FormErrors
  open: boolean
  hasAccount: boolean
  onToggle: (open: boolean) => void
  onChange: (patch: Partial<EvaluationFormState>) => void
}

export function ContractRulesFields({
  form,
  errors,
  open,
  hasAccount,
  onToggle,
  onChange,
}: ContractRulesFieldsProps) {
  return (
    <Disclosure
      title="Regras do contrato"
      aside={describeRules(form)}
      open={open}
      onToggle={onToggle}
      className="relative z-4"
    >
      <div className="flex min-w-0 flex-col gap-5">
        {hasAccount ? <RuleSetFields form={form} onChange={onChange} /> : null}
        <RuleCatalogFields form={form} onChange={onChange} />

        <CheckboxField
          id="customSeverityWeights"
          label="Personalizar os pesos por severidade"
          description="Por padrão: Erro 0,5208, Aviso 0,2708, Informação 0,1458, Dica 0,0625 e Desconhecida 0."
          checked={form.customSeverityWeights}
          onChange={(customSeverityWeights) => onChange({ customSeverityWeights })}
        />
        {form.customSeverityWeights ? (
          <div className="flex flex-col gap-2 sm:ml-7">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              {SEVERITY_ORDER.map((severity) => (
                <TextField
                  key={severity}
                  id={`severity-weight-${severity}`}
                  label={SEVERITY_LABELS[severity]}
                  inputMode="decimal"
                  mono
                  aria-invalid={errors.severityWeights ? true : undefined}
                  aria-describedby="severityWeights-message"
                  value={form.severityWeights[severity]}
                  onChange={(event) =>
                    onChange({
                      severityWeights: { ...form.severityWeights, [severity]: event.target.value },
                    })
                  }
                />
              ))}
            </div>
            <FieldMessages
              id="severityWeights"
              error={errors.severityWeights}
              hint="Cada regra violada pesa o valor da sua severidade. Só a proporção entre os pesos importa: eles não precisam somar 1."
            />
          </div>
        ) : null}
      </div>
    </Disclosure>
  )
}
