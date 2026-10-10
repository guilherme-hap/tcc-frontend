import type { IValidationIssue } from '../types'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const MIN_PASSWORD_LENGTH = 8

export const INVALID_URL_MESSAGE = 'Informe uma URL http ou https válida.'

export function isHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value)
    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}

export function isEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value)
}

export function issuesByField<K extends string>(
  issues: IValidationIssue[],
  fields: readonly K[],
): Partial<Record<K, string>> {
  const errors: Partial<Record<K, string>> = {}

  for (const issue of issues) {
    const field = fields.find((name) => name === issue.path)
    if (field && !errors[field]) errors[field] = issue.message
  }

  return errors
}
