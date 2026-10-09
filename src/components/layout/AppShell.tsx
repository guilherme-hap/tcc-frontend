import { Plus } from 'lucide-react'
import { Link, Outlet, useMatch } from 'react-router-dom'
import { EVALUATION_PATH_PATTERN, HOME_PATH, NEW_EVALUATION_PATH } from '../../utils/routes'
import { LinkButton } from '../ui/LinkButton'
import { FOCUS_RING } from '../ui/classes'

export function AppShell() {
  const isNew = useMatch(NEW_EVALUATION_PATH) !== null
  const isResult = useMatch(EVALUATION_PATH_PATTERN) !== null && !isNew
  const current = isNew ? 'Nova avaliação' : isResult ? 'Resultado da avaliação' : null

  return (
    <div className="min-h-screen">
      <header className="z-10 border-b border-border bg-bg/70 backdrop-blur-overlay sm:sticky sm:top-0">
        <div className="mx-auto flex min-h-14 w-full max-w-7xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5 sm:px-6">
          <Link
            to={HOME_PATH}
            aria-current={current === null ? 'page' : undefined}
            className={`rounded-sm font-display text-[15px] font-semibold tracking-[-0.01em] text-ink ${FOCUS_RING}`}
          >
            Auditor de APIs
          </Link>
          {current !== null ? (
            <>
              <span aria-hidden="true" className="text-ink-muted">
                /
              </span>
              <span aria-current="page" className="text-[13px] text-ink-secondary">
                {current}
              </span>
            </>
          ) : null}
          {isResult ? (
            <nav aria-label="Principal" className="ml-auto">
              <LinkButton to={NEW_EVALUATION_PATH} icon={Plus}>
                Nova avaliação
              </LinkButton>
            </nav>
          ) : null}
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pt-6 pb-10 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
