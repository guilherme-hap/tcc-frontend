import { formatCount, formatMilliseconds } from '../../utils/format'
import { NUMERIC_OPTION_KEYS, parseLoadOption, type EvaluationFormState } from './formState'

export const DEFAULTS_LABEL = 'Valores padrão'

export function describeRules(form: EvaluationFormState): string {
  const parts: string[] = []
  const changed = Object.keys(form.rulesConfig).length

  if (changed > 0) parts.push(formatCount(changed, 'regra alterada', 'regras alteradas'))
  if (form.customSeverityWeights) parts.push('pesos por severidade')

  return parts.length > 0 ? parts.join(' · ') : DEFAULTS_LABEL
}

export function describeOptions(form: EvaluationFormState): string {
  const parts: string[] = []

  const latency = parseLoadOption(form.numericOptions.targetLatency)
  if (form.numericOptions.targetLatency.trim() && Number.isFinite(latency) && latency > 0) {
    parts.push(`T = ${formatMilliseconds(latency)}`)
  }

  const changed = NUMERIC_OPTION_KEYS.filter(
    (key) => key !== 'targetLatency' && form.numericOptions[key].trim(),
  ).length
  if (changed > 0) parts.push(formatCount(changed, 'limite alterado', 'limites alterados'))

  const headers = form.headers.filter((header) => header.name.trim()).length
  if (headers > 0) parts.push(formatCount(headers, 'cabeçalho', 'cabeçalhos'))

  if (form.allowHighLoad) parts.push('carga elevada')

  return parts.length > 0 ? parts.join(' · ') : DEFAULTS_LABEL
}
