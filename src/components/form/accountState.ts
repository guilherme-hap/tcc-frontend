import type {
  CustomRule,
  EvaluationRequest,
  SavedApi,
  SavedApiInput,
  Severity,
  SeverityWeights,
} from '../../types'
import { SEVERITY_ORDER } from '../../utils/labels'
import { toSavedDefaults } from '../../utils/savedApi'
import {
  DEFAULT_SEVERITY_WEIGHTS,
  NUMERIC_OPTION_KEYS,
  buildEvaluationRequest,
  buildSeverityWeights,
  createHeaderDraft,
  type EvaluationFormState,
  type FormErrors,
  type NumericOptionKey,
} from './formState'

function toDraft(value: number | undefined): string {
  return value === undefined ? '' : String(value).replace('.', ',')
}

export function applySavedApi(
  form: EvaluationFormState,
  api: SavedApi | null,
): EvaluationFormState {
  const options = api?.defaultSettings?.loadTestOptions

  return {
    ...form,
    savedApiId: api?.id ?? '',
    saveApi: false,
    savedApiName: '',
    ruleSetId: '',
    openApiUrl: api?.openApiUrl ?? '',
    apiBaseUrl: api?.apiBaseUrl ?? '',
    rulesConfig: api?.defaultSettings?.rulesConfig ?? {},
    numericOptions: Object.fromEntries(
      NUMERIC_OPTION_KEYS.map((key) => [key, toDraft(options?.[key])]),
    ) as Record<NumericOptionKey, string>,
    headers: Object.entries(options?.headers ?? {}).map(([name, value]) => ({
      ...createHeaderDraft(),
      name,
      value,
    })),
    allowHighLoad: options?.allowHighLoad ?? false,
  }
}

export function applyRuleSet(
  form: EvaluationFormState,
  ruleSet: CustomRule | null,
): EvaluationFormState {
  const weights = ruleSet?.severityWeights ?? null

  return {
    ...form,
    ruleSetId: ruleSet?.id ?? '',
    rulesConfig: ruleSet?.rulesConfig ?? {},
    customSeverityWeights: weights !== null,
    severityWeights: Object.fromEntries(
      SEVERITY_ORDER.map((severity) => [
        severity,
        weights?.[severity] === undefined
          ? DEFAULT_SEVERITY_WEIGHTS[severity]
          : toDraft(weights[severity]),
      ]),
    ) as Record<Severity, string>,
  }
}

export type RuleSetResult =
  | { ok: true; rulesConfig: Record<string, boolean>; severityWeights: SeverityWeights | null }
  | { ok: false; error: string }

export function buildRuleSet(form: EvaluationFormState): RuleSetResult {
  const errors: FormErrors = {}
  const severityWeights = buildSeverityWeights(form, errors)

  if (errors.severityWeights) return { ok: false, error: errors.severityWeights }
  return { ok: true, rulesConfig: form.rulesConfig, severityWeights: severityWeights ?? null }
}

function toSavedApiInput(name: string, { payload }: EvaluationRequest): SavedApiInput {
  return {
    name,
    openApiUrl: payload.openApiUrl,
    apiBaseUrl: 'apiBaseUrl' in payload ? payload.apiBaseUrl : undefined,
    defaultSettings: toSavedDefaults({
      rulesConfig: 'rulesConfig' in payload ? payload.rulesConfig : undefined,
      loadTestOptions: 'loadTestOptions' in payload ? payload.loadTestOptions : undefined,
    }),
  }
}

export type SubmissionResult =
  | { ok: true; request: EvaluationRequest; savedApi: SavedApiInput | null }
  | { ok: false; errors: FormErrors }

export function buildSubmission(form: EvaluationFormState, hasAccount: boolean): SubmissionResult {
  const result = buildEvaluationRequest(form)
  const errors: FormErrors = result.ok ? {} : { ...result.errors }
  const savesApi = hasAccount && form.saveApi && !form.savedApiId
  const name = form.savedApiName.trim()

  if (savesApi && !name) errors.savedApiName = 'Informe o nome da API.'
  if (!result.ok || Object.keys(errors).length > 0) return { ok: false, errors }

  return {
    ok: true,
    request: result.request,
    savedApi: savesApi ? toSavedApiInput(name, result.request) : null,
  }
}
