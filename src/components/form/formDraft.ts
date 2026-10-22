import { TYPE_ORDER } from '../../utils/labels'
import { createInitialFormState, createTargetDraft, type EvaluationFormState } from './formState'

const STORAGE_KEY = 'auditor.form-draft'

export function saveFormDraft(form: EvaluationFormState): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(form))
  } catch {
    return
  }
}

export function readFormDraft(): EvaluationFormState | null {
  try {
    const parsed: unknown = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null')
    if (typeof parsed !== 'object' || parsed === null) return null

    const initial = createInitialFormState()
    const draft = { ...initial, ...parsed }
    if (!TYPE_ORDER.includes(draft.type) || !Array.isArray(draft.targets)) return null

    return {
      ...draft,
      numericOptions: { ...initial.numericOptions, ...draft.numericOptions },
      targets: draft.targets.map((target) => ({ ...createTargetDraft(), ...target })),
    }
  } catch {
    return null
  }
}

export function clearFormDraft(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    return
  }
}
