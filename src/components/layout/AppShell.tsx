import { LogOut, Plus, TriangleAlert } from 'lucide-react'
import { Link, NavLink, Outlet, useLocation, useMatch } from 'react-router-dom'
import { useSession } from '../../hooks'
import type { AuthUser } from '../../types'
import { APP_NAME } from '../../utils/brand'
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
import { BrandMark } from '../ui/BrandMark'
import { LinkButton } from '../ui/LinkButton'
import { Icon } from '../ui/Icon'
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
      <nav aria-label="Principal" className="flex flex-wrap gap-1 max-sm:order-last max-sm:basis-full">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={`inline-flex h-8 items-center rounded-md px-2.5 max-lg:h-11 text-sm font-medium text-ink-secondary transition-colors duration-150 hover:text-ink aria-[current=page]:bg-surface-raised aria-[current=page]:text-ink ${FOCUS_RING}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="ml-auto flex min-w-0 flex-wrap items-center gap-2">
        {showNewEvaluation ? (
          <LinkButton to={NEW_EVALUATION_PATH} variant="primary" icon={Plus}>
            <span className="max-sm:sr-only">Nova avaliação</span>
          </LinkButton>
        ) : null}
        <span className="inline-flex h-9 min-w-0 items-center gap-2 rounded-full border border-border pr-3 pl-1.5 max-sm:pr-1.5 text-sm text-ink-secondary">
          <span
            aria-hidden="true"
            className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-dim font-mono text-[11px] font-semibold text-accent-ink uppercase"
          >
            {user.email.charAt(0)}
          </span>
          <span className="sr-only">Sessão aberta como</span>
          <span className="max-w-48 truncate max-sm:sr-only">{user.email}</span>
        </span>
        <LinkButton to={LOGOUT_PATH} variant="ghost" icon={LogOut}>
          <span className="max-sm:sr-only">Sair</span>
        </LinkButton>
      </div>
    </>
  )
}

function VisitorNav({ showNewEvaluation, expired }: NavProps & { expired: boolean }) {
  const location = useLocation()
  const state: AuthRedirectState = { from: `${location.pathname}${location.search}` }

  return (
    <nav aria-label="Principal" className="ml-auto flex flex-wrap items-center gap-2">
      {expired ? (
        <p
          role="status"
          className="inline-flex items-center gap-2 rounded-md border border-warning/40 bg-warning-dim px-2.5 py-1 text-sm text-warning"
        >
          <Icon icon={TriangleAlert} size={14} />
          <span>
            Sessão expirada
            <span className="max-md:sr-only">: você continua como visitante e as novas avaliações ficam anônimas.</span>
          </span>
        </p>
      ) : null}
      {showNewEvaluation ? (
        <LinkButton to={NEW_EVALUATION_PATH} variant="primary" icon={Plus}>
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
  const { user, expired } = useSession()
  const isHome = useMatch(HOME_PATH) !== null
  const isNew = useMatch(NEW_EVALUATION_PATH) !== null
  const isResult = useMatch(EVALUATION_PATH_PATTERN) !== null && !isNew
  const current = isNew ? 'Nova avaliação' : isResult ? 'Resultado da avaliação' : null

  return (
    <div className="min-h-screen">
      <header className="z-10 border-b border-border bg-surface/70 backdrop-blur-overlay sm:sticky sm:top-0">
        <div
          className={`flex min-h-13 w-full flex-wrap items-center gap-y-2 px-4 py-2 sm:px-6 ${user ? 'gap-x-5' : 'gap-x-3'}`}
        >
          <Link
            to={HOME_PATH}
            aria-current={!user && isHome ? 'page' : undefined}
            className={`inline-flex items-center gap-2.5 rounded-sm text-[15px] font-bold max-lg:min-h-11 text-ink [font-variation-settings:"wdth"_108] ${FOCUS_RING}`}
          >
            <BrandMark />
            {APP_NAME}
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
                  <span aria-current="page" className="text-sm text-ink-secondary">
                    {current}
                  </span>
                </>
              ) : null}
              <VisitorNav showNewEvaluation={isResult} expired={expired} />
            </>
          )}
        </div>
      </header>
      <main className="flex w-full flex-col">
        <Outlet />
      </main>
    </div>
  )
}
