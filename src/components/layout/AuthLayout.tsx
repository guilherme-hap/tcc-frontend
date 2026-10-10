import type { ReactNode } from 'react'
import { ArrowLeft, Bookmark, History, Lock, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { HOME_PATH } from '../../utils/routes'
import { Icon } from '../ui/Icon'
import { TextLink } from '../ui/TextLink'
import { FOCUS_RING, GLASS, OVERLINE } from '../ui/classes'

interface Benefit {
  icon: LucideIcon
  title: string
  description: string
}

const BENEFITS: Benefit[] = [
  {
    icon: History,
    title: 'Histórico.',
    description: 'Cada avaliação entra em uma lista com busca e filtros.',
  },
  {
    icon: Bookmark,
    title: 'APIs e conjuntos de regras salvos.',
    description: 'A próxima avaliação já começa preenchida.',
  },
  {
    icon: Lock,
    title: 'Resultados privados.',
    description: 'Só quem criou a avaliação abre o resultado.',
  },
]

interface AuthLayoutProps {
  title: string
  lead: ReactNode
  note?: string
  children: ReactNode
}

export function AuthLayout({ title, lead, note, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="px-4 py-5 sm:px-6">
        <TextLink to={HOME_PATH} tone="muted" leadingIcon={ArrowLeft}>
          Início
        </TextLink>
      </div>
      <main className="flex flex-1 flex-col items-center gap-8 px-4 pt-8 pb-16 sm:px-6">
        <div className="flex w-full max-w-100 flex-col gap-6">
          <div className="flex flex-col items-center gap-5 text-center">
            <Link
              to={HOME_PATH}
              className={`rounded-sm font-display text-[15px] font-semibold tracking-[-0.01em] text-ink ${FOCUS_RING}`}
            >
              Auditor de APIs
            </Link>
            <div className="flex flex-col gap-1.5">
              <h1 className="font-display text-[28px] leading-[34px] font-semibold tracking-[-0.02em] text-ink">
                {title}
              </h1>
              <p className="text-ink-secondary">{lead}</p>
            </div>
          </div>
          {children}
        </div>
        <section
          aria-labelledby="account-benefits"
          className={`flex w-full max-w-100 flex-col gap-3 border-border p-4 ${GLASS}`}
        >
          <h2 id="account-benefits" className={OVERLINE}>
            Com a sessão aberta
          </h2>
          <ul className="flex flex-col gap-2.5 text-[13px] text-ink-secondary">
            {BENEFITS.map((benefit) => (
              <li key={benefit.title} className="flex items-start gap-2.5">
                <span className="flex h-5 items-center text-accent-ink">
                  <Icon icon={benefit.icon} />
                </span>
                <span>
                  <strong className="font-medium text-ink">{benefit.title}</strong>{' '}
                  {benefit.description}
                </span>
              </li>
            ))}
          </ul>
          {note ? (
            <p className="border-t border-border pt-3 text-[13px] text-ink-secondary">{note}</p>
          ) : null}
        </section>
      </main>
    </div>
  )
}
