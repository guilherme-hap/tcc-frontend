import { useId, type ReactNode } from 'react'
import { Lightbulb, X } from 'lucide-react'
import { useDismissedTip, type TipId } from '../../hooks'
import { LOGIN_PATH, REGISTER_PATH } from '../../utils/routes'
import { Icon } from '../ui/Icon'
import { IconButton } from '../ui/IconButton'
import { LinkButton } from '../ui/LinkButton'
import { OVERLINE } from '../ui/classes'

interface AccountTipProps {
  id: TipId
  title: string
  stacked?: boolean
  children: ReactNode
}

const SURFACE = 'rounded-card border border-accent-ink/30 bg-accent-dim px-5 py-4 shadow-card'

function TipIcon() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-accent-ink/30 bg-bg/50 text-accent-ink"
    >
      <Icon icon={Lightbulb} size={18} />
    </span>
  )
}

function TipLinks() {
  return (
    <>
      <LinkButton to={REGISTER_PATH}>Criar conta</LinkButton>
      <LinkButton to={LOGIN_PATH} variant="ghost">
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
    <div className="flex min-w-0 flex-col gap-0.5">
      <p className={`${OVERLINE} text-accent-ink`}>Dica</p>
      <h2 id={titleId} className="font-medium text-ink">
        {title}
      </h2>
    </div>
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
