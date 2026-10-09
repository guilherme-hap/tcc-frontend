import { ArrowRight, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/ui/Icon'
import { LinkButton } from '../components/ui/LinkButton'
import { Notice } from '../components/ui/Notice'
import { Panel } from '../components/ui/Panel'
import { FOCUS_RING, GLASS, OVERLINE } from '../components/ui/classes'
import { TYPE_ICONS } from '../utils/icons'
import { TYPE_INPUTS, TYPE_ORDER, TYPE_SUMMARIES, TYPE_TITLES } from '../utils/labels'
import { NEW_EVALUATION_PATH, newEvaluationPath } from '../utils/routes'

interface Step {
  title: string
  description: string
}

const STEPS: Step[] = [
  {
    title: 'Informe a especificação',
    description: 'A URL do documento OpenAPI, em JSON ou YAML. A URL base da API é opcional.',
  },
  {
    title: 'A avaliação roda em segundo plano',
    description: 'O pedido entra em uma fila e a tela de resultado atualiza sozinha.',
  },
  {
    title: 'Leia a nota e o detalhe',
    description:
      'Cada pilar recebe uma nota de 0 a 100, com as regras violadas, as zonas do Apdex e as verificações de segurança.',
  },
]

export function HomePage() {
  return (
    <>
      <section
        aria-labelledby="home-title"
        className="grid grid-cols-1 gap-x-3 gap-y-8 pt-4 lg:grid-cols-2 lg:pt-10 lg:pb-4"
      >
        <div className="flex min-w-0 flex-col items-start gap-5">
          <p className={OVERLINE}>Auditoria black-box de APIs REST</p>
          <h1
            id="home-title"
            className="max-w-[18ch] font-display text-[32px] leading-[1.1] font-semibold tracking-[-0.03em] text-balance text-ink sm:text-[44px]"
          >
            Avalie uma API de fora para dentro
          </h1>
          <p className="max-w-[58ch] text-base leading-6 text-ink-secondary">
            Com a especificação OpenAPI e a URL base, o auditor mede contrato, desempenho e
            segurança e devolve uma nota de 0 a 100 para cada pilar, com o cálculo à mostra.
          </p>
          <LinkButton
            to={NEW_EVALUATION_PATH}
            variant="primary"
            size="lg"
            icon={Plus}
            className="lg:mt-auto"
          >
            Nova avaliação
          </LinkButton>
        </div>

        <Panel title="Como funciona">
          <ol className="flex h-full flex-col justify-between gap-4">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-glass-raised font-mono text-xs font-medium text-ink-secondary"
                >
                  {index + 1}
                </span>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <h3 className="font-medium text-ink">{step.title}</h3>
                  <p className="text-[13px] text-ink-secondary">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </Panel>
      </section>

      <section aria-labelledby="home-types" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2
            id="home-types"
            className="font-display text-base font-semibold tracking-[-0.01em] text-ink"
          >
            Comece por um tipo de avaliação
          </h2>
          <p className="text-ink-secondary">
            Cada atalho abre o formulário com o tipo já escolhido.
          </p>
        </div>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TYPE_ORDER.map((type) => (
            <li key={type} className="flex min-w-0">
              <Link
                to={newEvaluationPath(type)}
                className={`group flex min-w-0 flex-1 flex-col gap-3 border-border p-4 hover:border-border-hover hover:bg-glass-raised ${GLASS} ${FOCUS_RING}`}
              >
                <span className="flex items-center justify-between gap-3">
                  <span
                    aria-hidden="true"
                    className="inline-flex size-9 items-center justify-center rounded-md border border-accent-ink/30 bg-accent-dim text-accent-ink"
                  >
                    <Icon icon={TYPE_ICONS[type]} size={18} />
                  </span>
                  <Icon
                    icon={ArrowRight}
                    className="text-ink-muted transition-[color,translate] duration-150 group-hover:translate-x-0.5 group-hover:text-ink motion-reduce:transition-none"
                  />
                </span>
                <span className="flex flex-col gap-1">
                  <span className="font-medium text-ink">{TYPE_TITLES[type]}</span>
                  <span className="text-[13px] text-ink-secondary">{TYPE_SUMMARIES[type]}</span>
                </span>
                <span className="mt-auto flex flex-col gap-1 border-t border-border pt-3">
                  <span className={OVERLINE}>Entrada</span>
                  <span className="text-[13px] text-ink">{TYPE_INPUTS[type]}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Notice tone="warning" title="O teste de carga envia requisições reais.">
        Use apenas contra um ambiente descartável, nunca produção.
      </Notice>
    </>
  )
}
