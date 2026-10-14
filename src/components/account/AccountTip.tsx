import { useId, type ReactNode } from 'react'
import { Lightbulb, X } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useDismissedTip, type TipId } from '../../hooks'
import { LOGIN_PATH, REGISTER_PATH, type AuthRedirectState } from '../../utils/routes'
import { Icon } from '../ui/Icon'
import { IconButton } from '../ui/IconButton'
import { LinkButton } from '../ui/LinkButton'

interface AccountTipProps {
  id: TipId
  title: string
  stacked?: boolean
  children: ReactNode
}

const SURFACE = 'rounded-card border border-border bg-surface px-5 py-4 shadow-card'

function TipIcon() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-border-hover bg-surface-raised text-ink-secondary"
    >
      <Icon icon={Lightbulb} size={18} />
    </span>
  )
}

function TipLinks() {
  const location = useLocation()
  const state: AuthRedirectState = { from: `${location.pathname}${location.search}` }

  return (
    <>
      <LinkButton to={REGISTER_PATH} state={state}>
        Criar conta
      </LinkButton>
      <LinkButton to={LOGIN_PATH} state={state} variant="ghost">
        Entrar
      </LinkButton>
    </>
  )
}

export function AccountTip({ id, title, stacked = false, children }: AccountTipProps) {
  const titleId = useId()
  const [dismissed, dismiss] = useDismissedTip(id)

  if (dismissed) return null

  const heading = (
    <h2 id={titleId} className="min-w-0 font-semibold text-ink">
      {title}
    </h2>
  )
  const dismissButton = <IconButton icon={X} label="Dispensar dica" onClick={dismiss} />

  if (stacked) {
    return (
      <section aria-labelledby={titleId} className={`flex flex-col gap-3 ${SURFACE}`}>
        <div className="flex items-start gap-3">
          <TipIcon />
          <div className="min-w-0 flex-1">{heading}</div>
          {dismissButton}
        </div>
        {children}
        <div className="flex flex-wrap items-center gap-2">
          <TipLinks />
        </div>
      </section>
    )
  }

  return (
    <aside
      aria-labelledby={titleId}
      className={`flex flex-wrap items-center gap-x-6 gap-y-4 ${SURFACE}`}
    >
      <TipIcon />
      <div className="flex min-w-0 flex-[999_1_26rem] flex-col gap-2">
        {heading}
        {children}
      </div>
      <div className="flex flex-auto flex-wrap items-center justify-end gap-2">
        <TipLinks />
        {dismissButton}
      </div>
    </aside>
  )
}
