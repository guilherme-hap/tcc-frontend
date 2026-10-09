export interface IValidationIssue {
  path: string
  message: string
}

export interface ApiErrorBody {
  error: string
  code: string
  issues?: IValidationIssue[]
}
