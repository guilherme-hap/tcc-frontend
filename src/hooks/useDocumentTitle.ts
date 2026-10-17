import { useEffect } from 'react'

const APP_TITLE = 'Auditor de APIs'

export function useDocumentTitle(title: string | null) {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_TITLE}` : APP_TITLE
    return () => {
      document.title = APP_TITLE
    }
  }, [title])
}
