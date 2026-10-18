import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { HOME_PATH } from '../../utils/routes'
import { BrandMark } from '../ui/BrandMark'
import { BrandName } from '../ui/BrandName'
import { MetaList, type MetaItem } from '../ui/MetaList'
import { TextLink } from '../ui/TextLink'
import { FOCUS_RING, OVERLINE, PAGE_TITLE } from '../ui/classes'

const BENEFITS: MetaItem[] = [
  { label: 'Histórico', value: 'Cada avaliação entra numa lista com busca e filtros.' },
  { label: 'APIs salvas', value: 'Conjuntos de regras e a próxima avaliação já preenchida.' },
  { label: 'Privacidade', value: 'Só quem criou a avaliação abre o resultado.' },
]

interface AuthLayoutProps {
  title: string
  lead: ReactNode
  benefits?: boolean
  note?: string
  children: ReactNode
}

export function AuthLayout({ title, lead, benefits = false, note, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between gap-3 px-4 pt-5 sm:px-6">
        <Link
          to={HOME_PATH}
          className={`inline-flex items-center gap-2.5 rounded-sm text-[15px] font-bold max-lg:min-h-11 text-ink [font-variation-settings:"wdth"_108] ${FOCUS_RING}`}
        >
          <BrandMark />
          <BrandName />
        </Link>
        <TextLink to={HOME_PATH} tone="muted" leadingIcon={ArrowLeft}>
          Voltar ao início
        </TextLink>
      </header>

      <main className="flex flex-1 flex-col items-center px-4 pt-10 pb-12 sm:px-6 lg:pt-20">
        <div className="flex w-full max-w-104 flex-col gap-6">
          <div className="flex flex-col gap-6 sm:rounded-card sm:border sm:border-border sm:bg-surface sm:p-6 sm:shadow-card">
            <div className="flex flex-col gap-1.5">
              <h1 className={PAGE_TITLE}>{title}</h1>
              <p className="text-ink-secondary">{lead}</p>
            </div>
            {children}
          </div>

          {benefits ? (
            <section aria-labelledby="account-benefits" className="flex flex-col gap-3">
              <h2 id="account-benefits" className={OVERLINE}>
                O que a conta guarda
              </h2>
              <MetaList items={BENEFITS} className="gap-y-3" />
            </section>
          ) : null}
          {note ? <p className="text-sm text-ink-secondary">{note}</p> : null}
        </div>
      </main>
    </div>
  )
}
