import { useCallback, useEffect, useRef, useState } from 'react'

const INVALID_FIELD = '[aria-invalid="true"]'

export function useFocusFirstInvalid<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [request, setRequest] = useState(0)

  useEffect(() => {
    if (request === 0) return

    const field = ref.current?.querySelector<HTMLElement>(INVALID_FIELD)
    if (!field) return

    field.focus({ preventScroll: true })
    field.scrollIntoView({ block: 'center' })
  }, [request])

  const focusFirstInvalid = useCallback(() => setRequest((current) => current + 1), [])

  return { ref, focusFirstInvalid }
}
