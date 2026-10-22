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
import { formatNumber } from '../../utils/format'
import { SEVERITY_ORDER } from '../../utils/labels'
import { INVALID_URL_MESSAGE, isHttpUrl } from '../../utils/validation'

export const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

export const MAX_TARGETS = 20
export const MAX_TOTAL_DURATION_SECONDS = 600
export const DEFAULT_REPETITIONS = 3
export const DEFAULT_REST_INTERVAL_SECONDS = 5

const DEFAULT_DURATION_SECONDS = 10
const DEFAULT_MUTATING_DURATION_SECONDS = 5
const MASKED_HEADER_VALUE = '••••••••'

const MUTATING_METHODS: HttpMethod[] = ['POST', 'PUT', 'PATCH', 'DELETE']
const BODY_METHODS: HttpMethod[] = ['POST', 'PUT', 'PATCH']
const WEIGHT_SUM_TOLERANCE = 0.001
const HEADER_NAME_PATTERN = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/
const SERVER_HEADERS_PATH = 'loadTestOptions.headers.'
const DECIMAL_PATTERN = /^\d+(?:[.,]\d+)?$/
const INTEGER_PATTERN = /^\d+$/
const THOUSANDS_PATTERN = /^[1-9]\d{0,2}(?:\.\d{3})+$/
const PATH_PLACEHOLDER = /\{([^}]+)\}/g
const MAX_MIN_SCORE = 100

export interface TargetDraft {
  id: string
  method: HttpMethod
  path: string
  payload: string
  pathParams: Record<string, string>
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
  | 'repetitions'
  | 'restIntervalSeconds'

export interface EvaluationFormState {
  type: EvaluationType
  openApiUrl: string
  apiBaseUrl: string
  targets: TargetDraft[]
  numericOptions: Record<NumericOptionKey, string>
  headers: HeaderDraft[]
  allowMutatingMethods: boolean
  allowHighLoad: boolean
  quickMode: boolean
  customWeights: boolean
  weights: Record<PillarName, string>
  rulesConfig: Record<string, boolean>
  customSeverityWeights: boolean
  severityWeights: Record<Severity, string>
  minScore: string
  savedApiId: string
  saveApi: boolean
  savedApiName: string
  ruleSetId: string
}

export type FormErrors = Record<string, string>

export type BuildResult =
  | { ok: true; request: EvaluationRequest }
  | { ok: false; errors: FormErrors }

const INTEGER_OPTIONS: NumericOptionKey[] = ['connections', 'maxRequests', 'repetitions']
const ZERO_ALLOWED_OPTIONS: NumericOptionKey[] = ['restIntervalSeconds']

export type MeasurementOptionKey = Extract<NumericOptionKey, 'repetitions' | 'restIntervalSeconds'>

type LimitedOptionKey = Exclude<NumericOptionKey, 'targetLatency' | MeasurementOptionKey>

const LOAD_LIMITS: Record<'default' | 'elevated', Record<LimitedOptionKey, number>> = {
  default: { duration: 60, connections: 50, maxRequests: 100_000, requestsPerSecond: 1_000 },
  elevated: { duration: 300, connections: 500, maxRequests: 1_000_000, requestsPerSecond: 10_000 },
}

const MEASUREMENT_LIMITS: Record<MeasurementOptionKey, number> = {
  repetitions: 10,
  restIntervalSeconds: 300,
}

export function loadLimit(key: NumericOptionKey, allowHighLoad: boolean): number | undefined {
  if (key === 'targetLatency') return undefined
  if (isMeasurementOption(key)) return MEASUREMENT_LIMITS[key]
  return LOAD_LIMITS[allowHighLoad ? 'elevated' : 'default'][key]
}

export const LOAD_OPTION_KEYS: NumericOptionKey[] = [
  'duration',
  'connections',
  'targetLatency',
  'maxRequests',
  'requestsPerSecond',
]

export const MEASUREMENT_OPTION_KEYS: MeasurementOptionKey[] = ['repetitions', 'restIntervalSeconds']

export const NUMERIC_OPTION_KEYS: NumericOptionKey[] = [...LOAD_OPTION_KEYS, ...MEASUREMENT_OPTION_KEYS]

export function isMeasurementOption(key: NumericOptionKey): key is MeasurementOptionKey {
  return (MEASUREMENT_OPTION_KEYS as NumericOptionKey[]).includes(key)
}

export const DEFAULT_SEVERITY_WEIGHTS: Record<Severity, string> = {
  Error: '0,5208',
  Warning: '0,2708',
  Info: '0,1458',
  Hint: '0,0625',
  Unknown: '0',
}

export function createTargetDraft(): TargetDraft {
  return { id: crypto.randomUUID(), method: 'GET', path: '', payload: '', pathParams: {} }
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
      repetitions: '',
      restIntervalSeconds: '',
    },
    headers: [],
    allowMutatingMethods: false,
    allowHighLoad: false,
    quickMode: false,
    customWeights: false,
    weights: { contract: '33,33', performance: '33,33', security: '33,34' },
    rulesConfig: {},
    customSeverityWeights: false,
    severityWeights: DEFAULT_SEVERITY_WEIGHTS,
    minScore: '',
    savedApiId: '',
    saveApi: false,
    savedApiName: '',
    ruleSetId: '',
  }
}

export function hasLoadOptionError(errors: FormErrors): boolean {
  return Object.keys(errors).some(
    (key) => key === 'quickMode' || key.startsWith('options.') || key.startsWith('headers.'),
  )
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

export function pathPlaceholders(path: string): string[] {
  return [...new Set(Array.from(path.matchAll(PATH_PLACEHOLDER), (match) => match[1]))]
}

export function parseDecimal(value: string): number {
  const text = value.trim()
  return DECIMAL_PATTERN.test(text) ? Number(text.replace(',', '.')) : NaN
}

export function parseLoadOption(value: string): number {
  return THOUSANDS_PATTERN.test(value.trim()) ? NaN : parseDecimal(value)
}

function parsedMeasurementOption(
  form: EvaluationFormState,
  key: MeasurementOptionKey,
  fallback: number,
): number {
  const raw = form.numericOptions[key]
  const value = parseLoadOption(raw)
  const valid =
    raw.trim() !== '' &&
    Number.isFinite(value) &&
    value >= (ZERO_ALLOWED_OPTIONS.includes(key) ? 0 : 1) &&
    value <= MEASUREMENT_LIMITS[key] &&
    (!INTEGER_OPTIONS.includes(key) || INTEGER_PATTERN.test(raw.trim()))
  return valid ? value : fallback
}

export function estimateRunCount(form: EvaluationFormState): number {
  if (form.quickMode) return 1
  return parsedMeasurementOption(form, 'repetitions', DEFAULT_REPETITIONS)
}

export function estimateLoadTime(form: EvaluationFormState): number {
  const runs = estimateRunCount(form)
  const rest = parsedMeasurementOption(form, 'restIntervalSeconds', DEFAULT_REST_INTERVAL_SECONDS)
  return runs * estimateLoadDuration(form) + (runs - 1) * rest
}

export function estimateLoadDuration(form: EvaluationFormState): number {
  const custom = parseLoadOption(form.numericOptions.duration)
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

function buildTargets(form: EvaluationFormState, errors: FormErrors): IPerformanceTarget[] {
  return form.targets.map((draft) => {
    const path = draft.path.trim()
    const target: IPerformanceTarget = { path, method: draft.method }

    if (!path) {
      errors[`targets.${draft.id}.path`] = 'Informe o path do endpoint.'
    }

    const pathParams: Record<string, string> = {}
    for (const name of pathPlaceholders(path)) {
      const value = draft.pathParams[name]?.trim()
      if (value) {
        pathParams[name] = value
      } else if (draft.method === 'DELETE') {
        errors[`targets.${draft.id}.pathParams.${name}`] =
          'Informe o valor: em DELETE nenhum valor é gerado.'
      }
    }
    if (Object.keys(pathParams).length > 0) target.pathParams = pathParams

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

export function buildLoadTestOptions(
  form: EvaluationFormState,
  errors: FormErrors,
  maskHeaderValues: boolean,
): ILoadTestOptions | undefined {
  const options: ILoadTestOptions = {}

  for (const key of NUMERIC_OPTION_KEYS) {
    if (form.quickMode && isMeasurementOption(key)) continue
    const raw = form.numericOptions[key].trim()
    if (!raw) continue

    const value = parseLoadOption(raw)
    const allowsZero = ZERO_ALLOWED_OPTIONS.includes(key)
    if (THOUSANDS_PATTERN.test(raw)) {
      errors[`options.${key}`] = 'Escreva o número sem separador de milhar (ex.: 1500 ou 1,5).'
    } else if (!Number.isFinite(value) || value < 0 || (!allowsZero && value === 0)) {
      errors[`options.${key}`] = allowsZero
        ? 'Informe um número a partir de zero.'
        : 'Informe um número maior que zero.'
    } else if (INTEGER_OPTIONS.includes(key) && !INTEGER_PATTERN.test(raw)) {
      errors[`options.${key}`] = 'Informe um número inteiro, sem ponto nem vírgula.'
    } else {
      const limit = loadLimit(key, form.allowHighLoad)
      if (limit !== undefined && value > limit) {
        const raisable = !form.allowHighLoad && value <= (loadLimit(key, true) ?? 0)
        errors[`options.${key}`] =
          `O máximo é ${formatNumber(limit)}.${raisable ? ' Marque "Permitir carga elevada" para subir o limite.' : ''}`
      } else {
        options[key] = value
      }
    }
  }

  const total = options.duration === undefined ? 0 : form.targets.length * options.duration
  if (total > MAX_TOTAL_DURATION_SECONDS) {
    errors['options.duration'] =
      `${formatNumber(form.targets.length)} endpoints de ${formatNumber(options.duration ?? 0)} s somam ${formatNumber(total)} s, acima do limite de ${MAX_TOTAL_DURATION_SECONDS} s. Reduza a duração ou tire endpoints.`
  }

  const headers: Record<string, string> = {}
  for (const header of form.headers) {
    const name = header.name.trim()
    if (!name && !header.value.trim()) continue
    if (!name) {
      errors[`headers.${header.id}`] = 'Informe o nome do cabeçalho.'
      continue
    }
    if (!HEADER_NAME_PATTERN.test(name)) {
      errors[`headers.${header.id}`] =
        'Nome inválido: use letras, dígitos e hífens, sem espaços nem dois-pontos (ex.: X-Api-Key).'
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
  if (form.quickMode) options.mode = 'quick'

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

  const sum = pillars.reduce((total, pillar) => total + (weights[pillar] ?? 0), 0)
  if (Math.abs(sum - 1) > WEIGHT_SUM_TOLERANCE) {
    errors.weights = 'Os pesos precisam somar 100%.'
    return undefined
  }

  return weights
}

export function buildRulesConfig(form: EvaluationFormState): Record<string, boolean> | undefined {
  return Object.keys(form.rulesConfig).length > 0 ? form.rulesConfig : undefined
}

export function buildSeverityWeights(
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

function buildMinScore(form: EvaluationFormState, errors: FormErrors): number | undefined {
  const raw = form.minScore.trim()
  if (!raw) return undefined

  const value = parseDecimal(raw)
  if (!Number.isFinite(value) || value > MAX_MIN_SCORE) {
    errors.minScore = 'Informe um número de 0 a 100.'
    return undefined
  }
  return value
}

function assembleRequest(
  form: EvaluationFormState,
  errors: FormErrors,
  maskHeaderValues: boolean,
): EvaluationRequest {
  const openApiUrl = form.openApiUrl.trim()
  const apiBaseUrl = form.apiBaseUrl.trim()

  if (!isHttpUrl(openApiUrl)) {
    errors.openApiUrl = INVALID_URL_MESSAGE
  }
  if (usesBaseUrl(form.type) && apiBaseUrl && !isHttpUrl(apiBaseUrl)) {
    errors.apiBaseUrl = INVALID_URL_MESSAGE
  }

  const base = { openApiUrl, apiBaseUrl: apiBaseUrl || undefined }
  const gate = { minScore: buildMinScore(form, errors) }

  if (form.type === 'security') return { type: 'security', payload: { ...base, ...gate } }

  const contract = {
    rulesConfig: buildRulesConfig(form),
    severityWeights: buildSeverityWeights(form, errors),
  }

  if (form.type === 'contract') {
    return { type: 'contract', payload: { openApiUrl, ...contract, ...gate } }
  }

  const performance = {
    ...base,
    targets: buildTargets(form, errors),
    loadTestOptions: buildLoadTestOptions(form, errors, maskHeaderValues),
  }

  return form.type === 'performance'
    ? { type: 'performance', payload: { ...performance, ...gate } }
    : {
        type: 'full',
        payload: { ...performance, ...contract, weights: buildWeights(form, errors), ...gate },
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
  if (path === 'openApiUrl' || path === 'apiBaseUrl' || path === 'minScore') return path
  if (path === 'weights' || path.startsWith('weights.')) return 'weights'
  if (path === 'severityWeights' || path.startsWith('severityWeights.')) return 'severityWeights'

  if (path === 'loadTestOptions.mode') return 'quickMode'

  if (path.startsWith(SERVER_HEADERS_PATH)) {
    const name = path.slice(SERVER_HEADERS_PATH.length)
    const draft = form.headers.find((header) => header.name.trim() === name)
    return draft ? `headers.${draft.id}` : undefined
  }

  const [root, second, ...rest] = path.split('.')

  if (root === 'targets' && rest.length > 0) {
    const draft = form.targets[Number(second)]
    return draft ? `targets.${draft.id}.${rest.join('.')}` : undefined
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
