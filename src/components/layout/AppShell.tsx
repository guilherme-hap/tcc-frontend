import { LogOut, Plus } from 'lucide-react'
import { Link, NavLink, Outlet, useLocation, useMatch } from 'react-router-dom'
import { useSession } from '../../hooks'
import type { AuthUser } from '../../types'
import {
  EVALUATION_PATH_PATTERN,
  HISTORY_PATH,
  HOME_PATH,
  LOGIN_PATH,
  LOGOUT_PATH,
  NEW_EVALUATION_PATH,
  REGISTER_PATH,
  SAVED_APIS_PATH,
  type AuthRedirectState,
} from '../../utils/routes'
import { LinkButton } from '../ui/LinkButton'
import { FOCUS_RING } from '../ui/classes'

const NAV_ITEMS = [
  { to: HOME_PATH, label: 'Início' },
  { to: HISTORY_PATH, label: 'Histórico' },
  { to: SAVED_APIS_PATH, label: 'APIs salvas' },
]

interface NavProps {
  showNewEvaluation: boolean
}

function AccountNav({ user, showNewEvaluation }: NavProps & { user: AuthUser }) {
  return (
    <>
      <nav aria-label="Principal" className="flex flex-wrap gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={`inline-flex h-8 items-center rounded-md px-2.5 text-[13px] font-medium text-ink-secondary transition-colors duration-150 hover:text-ink aria-[current=page]:bg-glass-raised aria-[current=page]:text-ink ${FOCUS_RING}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="ml-auto flex min-w-0 flex-wrap items-center gap-2">
        {showNewEvaluation ? (
          <LinkButton to={NEW_EVALUATION_PATH} icon={Plus}>
            Nova avaliação
          </LinkButton>
        ) : null}
        <span className="inline-flex h-9 min-w-0 items-center gap-2 rounded-full border border-border pr-3 pl-1.5 text-[13px] text-ink-secondary">
          <span
            aria-hidden="true"
            className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-dim font-mono text-[11px] font-semibold text-accent-ink uppercase"
          >
            {user.email.charAt(0)}
          </span>
          <span className="sr-only">Sessão aberta como</span>
          <span className="max-w-48 truncate">{user.email}</span>
        </span>
        <LinkButton to={LOGOUT_PATH} variant="ghost" icon={LogOut}>
          Sair
        </LinkButton>
      </div>
    </>
  )
}

function VisitorNav({ showNewEvaluation }: NavProps) {
  const location = useLocation()
  const state: AuthRedirectState = { from: `${location.pathname}${location.search}` }

  return (
    <nav aria-label="Principal" className="ml-auto flex flex-wrap items-center gap-2">
      {showNewEvaluation ? (
        <LinkButton to={NEW_EVALUATION_PATH} icon={Plus}>
          Nova avaliação
        </LinkButton>
      ) : null}
      <LinkButton to={LOGIN_PATH} state={state} variant="ghost">
        Entrar
      </LinkButton>
      <LinkButton to={REGISTER_PATH} state={state}>
        Criar conta
      </LinkButton>
    </nav>
  )
}

export function AppShell() {
  const { user } = useSession()
  const isHome = useMatch(HOME_PATH) !== null
  const isNew = useMatch(NEW_EVALUATION_PATH) !== null
  const isResult = useMatch(EVALUATION_PATH_PATTERN) !== null && !isNew
  const current = isNew ? 'Nova avaliação' : isResult ? 'Resultado da avaliação' : null

  return (
    <div className="min-h-screen">
      <header className="z-10 border-b border-border bg-bg/70 backdrop-blur-overlay sm:sticky sm:top-0">
        <div
          className={`mx-auto flex min-h-14 w-full max-w-7xl flex-wrap items-center gap-y-2 px-4 py-2.5 sm:px-6 ${user ? 'gap-x-5' : 'gap-x-3'}`}
        >
          <Link
            to={HOME_PATH}
            aria-current={!user && isHome ? 'page' : undefined}
            className={`rounded-sm font-display text-[15px] font-semibold tracking-[-0.01em] text-ink ${FOCUS_RING}`}
          >
            Auditor de APIs
          </Link>
          {user ? (
            <AccountNav user={user} showNewEvaluation={!isHome && !isNew} />
          ) : (
            <>
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
              <VisitorNav showNewEvaluation={isResult} />
            </>
          )}
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pt-6 pb-10 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
