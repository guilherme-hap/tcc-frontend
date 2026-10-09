import type { IValidationIssue } from '../types'

export class ApiError extends Error {
  readonly code: string | null
  readonly issues: IValidationIssue[]

  constructor(message: string, code: string | null = null, issues: IValidationIssue[] = []) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.issues = issues
  }
}
