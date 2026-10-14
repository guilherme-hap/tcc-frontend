import {
  hasMutatingTarget,
  usesBaseUrl,
  usesContractRules,
  usesTargets,
  type EvaluationFormState,
  type FormErrors,
  type NumericOptionKey,
} from './formState'

function sameValues<K extends string>(a: Record<K, string>, b: Record<K, string>): boolean {
  return (Object.keys(a) as K[]).every((key) => a[key] === b[key])
}

function stillApplies(
  key: string,
  submitted: EvaluationFormState,
  current: EvaluationFormState,
): boolean {
  const [root, id, field] = key.split('.')

  if (root === 'openApiUrl') return current.openApiUrl === submitted.openApiUrl
  if (root === 'apiBaseUrl') {
    return usesBaseUrl(current.type) && current.apiBaseUrl === submitted.apiBaseUrl
  }
  if (root === 'minScore') return current.minScore === submitted.minScore
  if (root === 'savedApiName') {
    return (
      current.saveApi && !current.savedApiId && current.savedApiName === submitted.savedApiName
    )
  }
  if (root === 'weights') {
    return (
      current.type === 'full' &&
      current.customWeights &&
      sameValues(current.weights, submitted.weights)
    )
  }
  if (root === 'severityWeights') {
    return (
      usesContractRules(current.type) &&
      current.customSeverityWeights &&
      sameValues(current.severityWeights, submitted.severityWeights)
    )
  }
  if (root === 'allowMutatingMethods') {
    return hasMutatingTarget(current) && !current.allowMutatingMethods
  }
  if (root === 'options') {
    const option = id as NumericOptionKey
    return (
      usesTargets(current.type) &&
      current.numericOptions[option] === submitted.numericOptions[option]
    )
  }
  if (root === 'headers') {
    const now = current.headers.find((header) => header.id === id)
    const then = submitted.headers.find((header) => header.id === id)
    return (
      usesTargets(current.type) &&
      now !== undefined &&
      then !== undefined &&
      now.name === then.name &&
      now.value === then.value
    )
  }
  if (root === 'targets') {
    const now = current.targets.find((target) => target.id === id)
    const then = submitted.targets.find((target) => target.id === id)
    if (!usesTargets(current.type) || !now || !then || now.method !== then.method) return false
    if (field === 'pathParams') {
      const name = key.slice(`targets.${id}.pathParams.`.length)
      return now.path === then.path && now.pathParams[name] === then.pathParams[name]
    }
    return field === 'path' || field === 'payload' ? now[field] === then[field] : true
  }
  return true
}

export function pruneErrors(
  errors: FormErrors,
  submitted: EvaluationFormState,
  current: EvaluationFormState,
): FormErrors {
  return Object.fromEntries(
    Object.entries(errors).filter(([key]) => stillApplies(key, submitted, current)),
  )
}
