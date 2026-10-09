import { Play } from 'lucide-react'
import type { PillarName } from '../../types'
import { formatNumber } from '../../utils/format'
import { EXECUTION_STEPS, PILLARS_BY_TYPE, PILLAR_LABELS, TYPE_LABELS } from '../../utils/labels'
import { Button } from '../ui/Button'
import { CodeBlock } from '../ui/CodeBlock'
import { Kbd } from '../ui/Kbd'
import { KeyValue, type KeyValueItem } from '../ui/KeyValue'
import { Notice } from '../ui/Notice'
import { Panel } from '../ui/Panel'
import {
  MAX_TARGETS,
  MAX_TOTAL_DURATION_SECONDS,
  buildRequestPreview,
  estimateLoadDuration,
  usesContractRules,
  usesTargets,
  type EvaluationFormState,
} from './formState'

const PILLARS: PillarName[] = ['contract', 'performance', 'security']

function buildFacts(form: EvaluationFormState): KeyValueItem[] {
  const facts: KeyValueItem[] = [
    { label: 'Tipo', value: TYPE_LABELS[form.type] },
    {
      label: 'Pilares',
      value: PILLARS_BY_TYPE[form.type].map((pillar) => PILLAR_LABELS[pillar]).join(', '),
    },
  ]

  if (usesContractRules(form.type)) {
    const changed = Object.keys(form.rulesConfig).length
    facts.push({
      label: 'Regras do contrato',
      value:
        changed === 0 ? 'Padrões' : `${changed} ${changed === 1 ? 'alterada' : 'alteradas'}`,
    })
  }

  if (usesTargets(form.type)) {
    facts.push(
      { label: 'Endpoints', value: `${form.targets.length} de ${MAX_TARGETS}`, mono: true },
      {
        label: 'Duração estimada da carga',
        value: `${formatNumber(estimateLoadDuration(form))} s de ${MAX_TOTAL_DURATION_SECONDS} s`,
        mono: true,
      },
    )
  }

  if (form.type === 'full') {
    facts.push({
      label: 'Pesos',
      value: form.customWeights
        ? PILLARS.map((pillar) => `${form.weights[pillar].trim() || '0'}%`).join(' · ')
        : '1/3 para cada pilar',
      mono: form.customWeights,
    })
  }

  return facts
}

interface RequestSummaryProps {
  form: EvaluationFormState
  hasErrors: boolean
  isSending: boolean
  submitError: string | null
  submitDetails: string[]
}

export function RequestSummary({
  form,
  hasErrors,
  isSending,
  submitError,
  submitDetails,
}: RequestSummaryProps) {
  const preview = buildRequestPreview(form)

  return (
    <Panel title="Resumo do pedido" description="O que será enviado ao iniciar.">
      <div className="flex min-w-0 flex-col gap-5">
        <KeyValue items={buildFacts(form)} />

        <div className="flex flex-col gap-3">
          <h3 className="text-[11px] leading-4 font-medium tracking-[0.08em] text-ink-secondary uppercase">
            Ordem de execução
          </h3>
          <ol className="flex flex-col gap-2">
            {EXECUTION_STEPS[form.type].map((step, index) => (
              <li key={step} className="flex items-start gap-2 text-[13px] text-ink">
                <span
                  aria-hidden="true"
                  className="inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-border bg-glass-raised font-mono text-[11px] font-medium text-ink-secondary"
                >
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <CodeBlock
          title={`POST /api/evaluations/${preview.type}`}
          code={JSON.stringify(preview.payload, null, 2)}
        />

        {submitError ? (
          <Notice tone="error" title="A avaliação não foi aceita.">
            <p>
              {submitError}
              {hasErrors ? ' Revise os campos destacados.' : null}
            </p>
            {submitDetails.length > 0 ? (
              <ul className="mt-2 flex list-disc flex-col gap-1 pl-4">
                {submitDetails.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            ) : null}
          </Notice>
        ) : hasErrors ? (
          <Notice tone="error" title="Revise os campos destacados antes de enviar." />
        ) : null}

        <div className="flex flex-col gap-3">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            icon={Play}
            loading={isSending}
            className="w-full"
          >
            {isSending ? 'Enviando…' : 'Iniciar avaliação'}
          </Button>
          <p className="hidden items-center justify-center gap-2 text-[13px] text-ink-secondary sm:flex">
            <Kbd>Ctrl ↵</Kbd> envia de qualquer campo
          </p>
        </div>
      </div>
    </Panel>
  )
}
