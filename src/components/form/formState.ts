import type {
  EvaluationRequest,
  EvaluationType,
  HttpMethod,
  ILoadTestOptions,
  IPerformanceTarget,
  IValidationIssue,
  PillarName,
  PillarWeights,
  Severity,
} from '../../types'
import { SEVERITY_ORDER } from '../../utils/labels'

export const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

export const MAX_TARGETS = 20
export const MAX_TOTAL_DURATION_SECONDS = 600

const DEFAULT_DURATION_SECONDS = 10
const DEFAULT_MUTATING_DURATION_SECONDS = 5
const MASKED_HEADER_VALUE = '••••••••'

const MUTATING_METHODS: HttpMethod[] = ['POST', 'PUT', 'PATCH', 'DELETE']
const BODY_METHODS: HttpMethod[] = ['POST', 'PUT', 'PATCH']
const WEIGHT_SUM_TOLERANCE = 0.1

export interface TargetDraft {
  id: string
  method: HttpMethod
  path: string
  payload: string
}

export interface HeaderDraft {
  id: string
  name: string
  value: string
}

export type NumericOptionKey =
  | 'duration'
  | 'connections'
  | 'targetLatency'
  | 'maxRequests'
  | 'requestsPerSecond'

export interface EvaluationFormState {
  type: EvaluationType
  openApiUrl: string
  apiBaseUrl: string
  targets: TargetDraft[]
  numericOptions: Record<NumericOptionKey, string>
  headers: HeaderDraft[]
  allowMutatingMethods: boolean
  allowHighLoad: boolean
  customWeights: boolean
  weights: Record<PillarName, string>
  rulesConfig: Record<string, boolean>
  customSeverityWeights: boolean
  severityWeights: Record<Severity, string>
}

export type FormErrors = Record<string, string>

export type BuildResult =
  | { ok: true; request: EvaluationRequest }
  | { ok: false; errors: FormErrors }

const INTEGER_OPTIONS: NumericOptionKey[] = ['connections', 'maxRequests']

export const NUMERIC_OPTION_KEYS: NumericOptionKey[] = [
  'duration',
  'connections',
  'targetLatency',
  'maxRequests',
  'requestsPerSecond',
]

export function createTargetDraft(): TargetDraft {
  return { id: crypto.randomUUID(), method: 'GET', path: '', payload: '' }
}

export function createHeaderDraft(): HeaderDraft {
  return { id: crypto.randomUUID(), name: '', value: '' }
}

export function createInitialFormState(type: EvaluationType = 'full'): EvaluationFormState {
  return {
    type,
    openApiUrl: '',
    apiBaseUrl: '',
    targets: [createTargetDraft()],
    numericOptions: {
      duration: '',
      connections: '',
      targetLatency: '',
      maxRequests: '',
      requestsPerSecond: '',
    },
    headers: [],
    allowMutatingMethods: false,
    allowHighLoad: false,
    customWeights: false,
    weights: { contract: '33,33', performance: '33,33', security: '33,34' },
    rulesConfig: {},
    customSeverityWeights: false,
    severityWeights: {
      Error: '0,5208',
      Warning: '0,2708',
      Info: '0,1458',
      Hint: '0,0625',
      Unknown: '0',
    },
  }
}

export function isMutatingMethod(method: HttpMethod): boolean {
  return MUTATING_METHODS.includes(method)
}

export function acceptsBody(method: HttpMethod): boolean {
  return BODY_METHODS.includes(method)
}

export function usesTargets(type: EvaluationType): boolean {
  return type === 'full' || type === 'performance'
}

export function usesContractRules(type: EvaluationType): boolean {
  return type === 'full' || type === 'contract'
}

export function usesBaseUrl(type: EvaluationType): boolean {
  return type !== 'contract'
}

export function hasMutatingTarget(form: EvaluationFormState): boolean {
  return usesTargets(form.type) && form.targets.some((target) => isMutatingMethod(target.method))
}

export function parseDecimal(value: string): number {
  return Number(value.trim().replace(',', '.'))
}

export function estimateLoadDuration(form: EvaluationFormState): number {
  const custom = parseDecimal(form.numericOptions.duration)
  if (form.numericOptions.duration.trim() && Number.isFinite(custom) && custom > 0) {
    return form.targets.length * custom
  }
  return form.targets.reduce(
    (total, target) =>
      total +
      (isMutatingMethod(target.method)
        ? DEFAULT_MUTATING_DURATION_SECONDS
        : DEFAULT_DURATION_SECONDS),
    0,
  )
}

export function sumWeights(weights: Record<PillarName, string>): number {
  return Object.values(weights).reduce((sum, value) => sum + (parseDecimal(value) || 0), 0)
}

function isHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value)
    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}

function buildTargets(form: EvaluationFormState, errors: FormErrors): IPerformanceTarget[] {
  return form.targets.map((draft) => {
    const path = draft.path.trim()
    const target: IPerformanceTarget = { path, method: draft.method }

    if (!path) {
      errors[`targets.${draft.id}.path`] = 'Informe o path do endpoint.'
    } else if (draft.method === 'DELETE' && path.includes('{')) {
      errors[`targets.${draft.id}.path`] =
        'DELETE exige um path concreto, sem parâmetros entre chaves.'
    }

    if (acceptsBody(draft.method) && draft.payload.trim()) {
      try {
        target.payload = JSON.parse(draft.payload)
      } catch {
        errors[`targets.${draft.id}.payload`] = 'O payload precisa ser um JSON válido.'
      }
    }

    return target
  })
}

function buildLoadTestOptions(
  form: EvaluationFormState,
  errors: FormErrors,
  maskHeaderValues: boolean,
): ILoadTestOptions | undefined {
  const options: ILoadTestOptions = {}

  for (const key of NUMERIC_OPTION_KEYS) {
    const raw = form.numericOptions[key].trim()
    if (!raw) continue

    const value = parseDecimal(raw)
    if (!Number.isFinite(value) || value <= 0) {
      errors[`options.${key}`] = 'Informe um número maior que zero.'
    } else if (INTEGER_OPTIONS.includes(key) && !Number.isInteger(value)) {
      errors[`options.${key}`] = 'Informe um número inteiro.'
    } else {
      options[key] = value
    }
  }

  const headers: Record<string, string> = {}
  for (const header of form.headers) {
    const name = header.name.trim()
    if (!name && !header.value.trim()) continue
    if (!name) {
      errors[`headers.${header.id}`] = 'Informe o nome do cabeçalho.'
      continue
    }
    headers[name] = maskHeaderValues ? MASKED_HEADER_VALUE : header.value
  }
  if (Object.keys(headers).length > 0) options.headers = headers

  if (hasMutatingTarget(form)) {
    if (form.allowMutatingMethods) {
      options.allowMutatingMethods = true
    } else {
      errors.allowMutatingMethods = 'Confirme para testar métodos que alteram dados.'
    }
  }

  if (form.allowHighLoad) options.allowHighLoad = true

  return Object.keys(options).length > 0 ? options : undefined
}

function buildWeights(form: EvaluationFormState, errors: FormErrors): PillarWeights | undefined {
  if (!form.customWeights) return undefined

  const pillars = Object.keys(form.weights) as PillarName[]
  const weights: PillarWeights = {}

  for (const pillar of pillars) {
    const value = parseDecimal(form.weights[pillar])
    if (!form.weights[pillar].trim() || !Number.isFinite(value) || value < 0) {
      errors.weights = 'Informe os três pesos como números a partir de zero.'
      return undefined
    }
    weights[pillar] = value / 100
  }

  if (Math.abs(sumWeights(form.weights) - 100) > WEIGHT_SUM_TOLERANCE) {
    errors.weights = 'Os pesos precisam somar 100%.'
    return undefined
  }

  return weights
}

function buildRulesConfig(form: EvaluationFormState): Record<string, boolean> | undefined {
  return Object.keys(form.rulesConfig).length > 0 ? form.rulesConfig : undefined
}

function buildSeverityWeights(
  form: EvaluationFormState,
  errors: FormErrors,
): Partial<Record<Severity, number>> | undefined {
  if (!form.customSeverityWeights) return undefined

  const weights: Partial<Record<Severity, number>> = {}

  for (const severity of SEVERITY_ORDER) {
    const value = parseDecimal(form.severityWeights[severity])
    if (!form.severityWeights[severity].trim() || !Number.isFinite(value) || value < 0) {
      errors.severityWeights = 'Informe os cinco pesos como números a partir de zero.'
      return undefined
    }
    weights[severity] = value
  }

  return weights
}

function assembleRequest(
  form: EvaluationFormState,
  errors: FormErrors,
  maskHeaderValues: boolean,
): EvaluationRequest {
  const openApiUrl = form.openApiUrl.trim()
  const apiBaseUrl = form.apiBaseUrl.trim()

  if (!isHttpUrl(openApiUrl)) {
    errors.openApiUrl = 'Informe uma URL http ou https válida.'
  }
  if (usesBaseUrl(form.type) && apiBaseUrl && !isHttpUrl(apiBaseUrl)) {
    errors.apiBaseUrl = 'Informe uma URL http ou https válida.'
  }

  const base = { openApiUrl, apiBaseUrl: apiBaseUrl || undefined }

  if (form.type === 'security') return { type: 'security', payload: base }

  const contract = {
    rulesConfig: buildRulesConfig(form),
    severityWeights: buildSeverityWeights(form, errors),
  }

  if (form.type === 'contract') return { type: 'contract', payload: { openApiUrl, ...contract } }

  const performance = {
    ...base,
    targets: buildTargets(form, errors),
    loadTestOptions: buildLoadTestOptions(form, errors, maskHeaderValues),
  }

  return form.type === 'performance'
    ? { type: 'performance', payload: performance }
    : {
        type: 'full',
        payload: { ...performance, ...contract, weights: buildWeights(form, errors) },
      }
}

export function buildEvaluationRequest(form: EvaluationFormState): BuildResult {
  const errors: FormErrors = {}
  const request = assembleRequest(form, errors, false)

  if (Object.keys(errors).length > 0) return { ok: false, errors }
  return { ok: true, request }
}

export function buildRequestPreview(form: EvaluationFormState): EvaluationRequest {
  return assembleRequest(form, {}, true)
}

export interface ServerIssueMapping {
  errors: FormErrors
  unmatched: IValidationIssue[]
}

function fieldKeyForIssue(form: EvaluationFormState, path: string): string | undefined {
  if (path === 'openApiUrl' || path === 'apiBaseUrl') return path
  if (path === 'weights' || path.startsWith('weights.')) return 'weights'
  if (path === 'severityWeights' || path.startsWith('severityWeights.')) return 'severityWeights'

  const [root, second, third] = path.split('.')

  if (root === 'targets' && third !== undefined) {
    const draft = form.targets[Number(second)]
    return draft ? `targets.${draft.id}.${third}` : undefined
  }
  if (root === 'loadTestOptions' && NUMERIC_OPTION_KEYS.includes(second as NumericOptionKey)) {
    return `options.${second}`
  }
  return undefined
}

export function mapServerIssues(
  form: EvaluationFormState,
  issues: IValidationIssue[],
): ServerIssueMapping {
  const errors: FormErrors = {}
  const unmatched: IValidationIssue[] = []

  for (const issue of issues) {
    const key = fieldKeyForIssue(form, issue.path)
    if (!key) {
      unmatched.push(issue)
    } else if (!errors[key]) {
      errors[key] = issue.message
    }
  }

  return { errors, unmatched }
}
