import { useId, type ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { PillarName } from '../../types'
import { APP_TAGLINE } from '../../utils/brand'
import { PILLAR_LABELS, TYPE_DESCRIPTIONS } from '../../utils/labels'
import { HOME_PATH } from '../../utils/routes'
import { PILLAR_BG } from '../../utils/tones'
import { BrandMark } from '../ui/BrandMark'
import { BrandName } from '../ui/BrandName'
import { MetaList, type MetaItem } from '../ui/MetaList'
import { PingRings } from '../ui/PingRings'
import { TextLink } from '../ui/TextLink'
import { FOCUS_RING, OVERLINE, PAGE_TITLE } from '../ui/classes'

const PILLARS: PillarName[] = ['contract', 'performance', 'security']

const BENEFITS: MetaItem[] = [
  { label: 'Histórico', value: 'Cada avaliação entra numa lista com busca e filtros.' },
  { label: 'APIs salvas', value: 'Conjuntos de regras e a próxima avaliação já preenchida.' },
  { label: 'Privacidade', value: 'Só quem criou a avaliação abre o resultado.' },
]

interface AccountBenefitsProps {
  className?: string
}

function AccountBenefits({ className = '' }: AccountBenefitsProps) {
  const headingId = useId()

  return (
    <section aria-labelledby={headingId} className={`flex flex-col gap-3 ${className}`}>
      <h2 id={headingId} className={OVERLINE}>
        O que a conta guarda
      </h2>
      <MetaList items={BENEFITS} className="gap-y-3" />
    </section>
  )
}

interface AuthLayoutProps {
  title: string
  lead: ReactNode
  benefits?: boolean
  note?: string
  children: ReactNode
}

export function AuthLayout({ title, lead, benefits = false, note, children }: AuthLayoutProps) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-2">
      <div className="flex min-h-dvh flex-col">
        <header className="flex items-center justify-between gap-3 px-4 pt-5 sm:px-6 lg:justify-end">
          <Link
            to={HOME_PATH}
            className={`inline-flex items-center gap-2.5 rounded-sm text-[15px] font-bold max-lg:min-h-11 text-ink lg:hidden [font-variation-settings:"wdth"_108] ${FOCUS_RING}`}
          >
            <BrandMark />
            <BrandName />
          </Link>
          <TextLink to={HOME_PATH} tone="muted" leadingIcon={ArrowLeft}>
            Voltar ao início
          </TextLink>
        </header>

        <main className="flex flex-1 flex-col items-center px-4 pt-10 pb-12 sm:px-6 lg:justify-center lg:pt-10">
          <div className="flex w-full max-w-104 flex-col gap-6">
            <div className="flex flex-col gap-6 sm:rounded-card sm:border sm:border-border sm:bg-surface sm:p-6 sm:shadow-card">
              <div className="flex flex-col gap-1.5">
                <h1 className={PAGE_TITLE}>{title}</h1>
                <p className="text-ink-secondary">{lead}</p>
              </div>
              {children}
            </div>

            {benefits ? <AccountBenefits className="lg:hidden" /> : null}
            {note ? <p className="text-sm text-ink-secondary">{note}</p> : null}
          </div>
        </main>
      </div>

      <aside
        aria-label="Sobre o produto"
        className="relative isolate hidden overflow-hidden border-l border-border bg-surface px-12 py-12 lg:flex lg:flex-col lg:justify-center xl:px-20"
      >
        <div className="flex w-full max-w-md flex-col gap-10">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4 text-ink [font-variation-settings:'wdth'_108]">
              <span className="relative inline-flex shrink-0">
                <PingRings />
                <BrandMark className="h-14" />
              </span>
              <span className="font-display text-[34px] leading-10 font-bold tracking-[-0.02em]">
                <BrandName />
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <p className="font-display text-xl leading-7 font-semibold text-balance text-ink">
                {APP_TAGLINE}
              </p>
              <p className="text-ink-secondary">
                Parte só da especificação OpenAPI, sem acesso ao código da API.
              </p>
            </div>
          </div>

          <ul className="flex flex-col gap-4">
            {PILLARS.map((pillar) => (
              <li key={pillar} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className={`mt-0.5 h-10 w-1 shrink-0 rounded-xs ${PILLAR_BG[pillar]}`}
                />
                <div className="flex min-w-0 flex-col">
                  <span className="font-semibold text-ink">{PILLAR_LABELS[pillar]}</span>
                  <span className="text-sm text-ink-secondary">{TYPE_DESCRIPTIONS[pillar]}</span>
                </div>
              </li>
            ))}
          </ul>

          {benefits ? <AccountBenefits /> : null}
        </div>
      </aside>
    </div>
  )
}
