import { Bookmark, ChevronRight, History, Lock, Plus, type LucideIcon } from 'lucide-react'
import { AccountTip } from '../components/account/AccountTip'
import { RecentEvaluations } from '../components/home/RecentEvaluations'
import { SavedApisPreview } from '../components/home/SavedApisPreview'
import { TypeRow } from '../components/home/TypeRow'
import { Block } from '../components/ui/Block'
import { Icon } from '../components/ui/Icon'
import { LinkButton } from '../components/ui/LinkButton'
import { Notice } from '../components/ui/Notice'
import { BODY, FOCUS_RING, FRAME, OVERLINE, RAIL } from '../components/ui/classes'
import { useDocumentTitle, useSession, useWideLayout } from '../hooks'
import { APP_TAGLINE } from '../utils/brand'
import { TYPE_ORDER } from '../utils/labels'
import { HISTORY_PATH, NEW_EVALUATION_PATH } from '../utils/routes'

interface Step {
  title: string
  description: string
  accountNote?: string
}

const STEPS: Step[] = [
  {
    title: 'Informe a especificação',
    description: 'A URL do documento OpenAPI, em JSON ou YAML. A URL base da API é opcional.',
    accountNote: 'Uma API salva preenche os dois campos.',
  },
  {
    title: 'A avaliação roda em segundo plano',
    description: 'O pedido entra em uma fila e a tela de resultado atualiza sozinha.',
  },
  {
    title: 'Leia a nota e o detalhe',
    description:
      'Cada pilar recebe uma nota de 0 a 100, com as regras violadas, as zonas do Apdex e as verificações de segurança.',
    accountNote: 'O resultado fica no histórico da conta.',
  },
]

interface TipBenefit {
  icon: LucideIcon
  label: string
}

const TIP_BENEFITS: TipBenefit[] = [
  { icon: History, label: 'Histórico de avaliações' },
  { icon: Bookmark, label: 'APIs e conjuntos de regras salvos' },
  { icon: Lock, label: 'Resultados que só abrem para quem os criou' },
]

export function HomePage() {
  useDocumentTitle('Início')
  const { user } = useSession()
  const wide = useWideLayout()
  const collapsed = user !== null && !wide

  const StepTitle = collapsed ? 'p' : 'h3'
  const steps = (
    <ol className="flex flex-col gap-4">
      {STEPS.map((step, index) => (
        <li
          key={step.title}
          className="relative ml-2 flex flex-col gap-0.5 border-l border-border-hover pb-1 pl-5 last:border-l-transparent"
        >
          <span
            aria-hidden="true"
            className="absolute top-0 -left-2 inline-flex size-4 items-center justify-center rounded-full border border-border-control bg-surface font-mono text-[10px] leading-none font-medium text-ink-secondary"
          >
            {index + 1}
          </span>
          <StepTitle className="leading-4 font-semibold text-ink">{step.title}</StepTitle>
          <p className="text-sm text-ink-secondary">
            {step.description}
            {user && step.accountNote ? ` ${step.accountNote}` : null}
          </p>
        </li>
      ))}
    </ol>
  )

  return (
    <div className={FRAME}>
      <aside aria-label="Apresentação do auditor" className={RAIL}>
        <div className="flex flex-col gap-3">
          <h1 className="font-display text-[28px] leading-8 font-bold tracking-[-0.02em] text-balance text-ink">
            {APP_TAGLINE}
          </h1>
          <p className="text-sm leading-5 text-ink-secondary">
            Com a especificação OpenAPI e a URL base, o auditor mede contrato, desempenho e
            segurança e devolve uma nota de 0 a 100 para cada pilar, com o cálculo à mostra.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <LinkButton to={NEW_EVALUATION_PATH} variant="primary" size="lg" icon={Plus}>
              Nova avaliação
            </LinkButton>
            {user ? (
              <LinkButton to={HISTORY_PATH} size="lg" icon={History}>
                Ver histórico
              </LinkButton>
            ) : null}
          </div>
        </div>

        {collapsed ? (
          <details className="group border-t border-border">
            <summary
              className={`flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-sm text-sm font-medium text-ink-secondary [&::-webkit-details-marker]:hidden ${FOCUS_RING}`}
            >
              <Icon
                icon={ChevronRight}
                size={14}
                className="transition-transform duration-150 group-open:rotate-90"
              />
              Como funciona
            </summary>
            <div className="pt-2 pb-2">{steps}</div>
          </details>
        ) : (
          <section className="flex flex-col gap-3">
            <h2 className={OVERLINE}>Como funciona</h2>
            {steps}
          </section>
        )}

        <div className="lg:mt-auto">
          <Notice tone="warning" title="O teste de carga envia requisições reais.">
            Use apenas contra um ambiente descartável, nunca produção.
          </Notice>
        </div>
      </aside>

      <div className={BODY}>
        {user ? (
          <div className="@container">
            <div className="grid grid-cols-1 items-start gap-3 @4xl:grid-cols-[minmax(0,1fr)_22rem]">
              <RecentEvaluations />
              <SavedApisPreview />
            </div>
          </div>
        ) : null}

        <div className="@container">
          <Block title="Comece por um tipo de avaliação" flush>
            <ul className="flex flex-col">
              {TYPE_ORDER.map((type) => (
                <TypeRow key={type} type={type} />
              ))}
            </ul>
          </Block>
        </div>

        {user ? null : (
          <AccountTip id="home" title="Com uma conta, as avaliações ficam guardadas">
            <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-ink">
              {TIP_BENEFITS.map((benefit) => (
                <li key={benefit.label} className="inline-flex items-center gap-1.5">
                  <Icon icon={benefit.icon} size={14} className="text-accent-ink" />
                  {benefit.label}
                </li>
              ))}
            </ul>
          </AccountTip>
        )}
      </div>
    </div>
  )
}
