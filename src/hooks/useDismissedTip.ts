import { useState } from 'react'

const STORAGE_KEY = 'auditor.dismissed-tips'

export type TipId = 'home' | 'new-evaluation' | 'result'

function readDismissed(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : []
  } catch {
    return []
  }
}

export function useDismissedTip(id: TipId): [boolean, () => void] {
  const [dismissed, setDismissed] = useState(() => readDismissed().includes(id))

  const dismiss = () => {
    setDismissed(true)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set([...readDismissed(), id])]))
    } catch {
      return
    }
  }

  return [dismissed, dismiss]
}
