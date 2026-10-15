import { useSyncExternalStore } from 'react'

const WIDE_QUERY = '(min-width: 67.5rem)'

function subscribe(onChange: () => void): () => void {
  const query = window.matchMedia(WIDE_QUERY)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

function getSnapshot(): boolean {
  return window.matchMedia(WIDE_QUERY).matches
}

export function useWideLayout(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => true)
}
