import type { CustomRule, CustomRuleInput, CustomRuleUpdate } from '../types'
import { api, handleError } from './api'

const BASE_PATH = '/api/user/rules'

export async function listCustomRules(): Promise<CustomRule[]> {
  try {
    const { data } = await api.get<CustomRule[]>(BASE_PATH)
    return data
  } catch (err) {
    handleError(err)
  }
}

export async function createCustomRule(input: CustomRuleInput): Promise<CustomRule> {
  try {
    const { data } = await api.post<CustomRule>(BASE_PATH, input)
    return data
  } catch (err) {
    handleError(err)
  }
}

export async function updateCustomRule({
  id,
  changes,
}: {
  id: string
  changes: CustomRuleUpdate
}): Promise<CustomRule> {
  try {
    const { data } = await api.put<CustomRule>(`${BASE_PATH}/${id}`, changes)
    return data
  } catch (err) {
    handleError(err)
  }
}

export async function deleteCustomRule(id: string): Promise<void> {
  try {
    await api.delete(`${BASE_PATH}/${id}`)
  } catch (err) {
    handleError(err)
  }
}
