import { ChevronRight, Link2, Lock, Play, TriangleAlert, type LucideIcon } from 'lucide-react'
import type { EvaluationVisibility, IValidationIssue, PillarName } from '../../types'
import { formatCount, formatNumber, formatPercent } from '../../utils/format'
import {
  EXECUTION_GROUPS,
  PILLARS_BY_TYPE,
  PILLAR_LABELS,
  TYPE_LABELS,
  TYPE_TITLES,
  VISIBILITY_LABELS,
} from '../../utils/labels'
import { PILLAR_BG } from '../../utils/tones'
import { Badge, type BadgeTone } from '../ui/Badge'
import { Button } from '../ui/Button'
import { CodeBlock } from '../ui/CodeBlock'
import { Icon } from '../ui/Icon'
import { Kbd } from '../ui/Kbd'
import { MetaList, type MetaItem } from '../ui/MetaList'
import { MiddleTruncate } from '../ui/MiddleTruncate'
import { Notice } from '../ui/Notice'
import { FOCUS_RING, OVERLINE, RAIL, TEXT_LINK } from '../ui/classes'
import { DEFAULTS_LABEL, describeRules } from './describe'
import {
  MAX_TOTAL_DURATION_SECONDS,
  buildRequestPreview,
  estimateLoadDuration,
  parseDecimal,
  usesBaseUrl,
  usesTargets,
  type EvaluationFormState,
} from './formState'

const VISIBILITY_TONES: Record<EvaluationVisibility, BadgeTone> = {
  private: 'accent',
  anonymous: 'neutral',
}

const VISIBILITY_ICONS: Record<EvaluationVisibility, LucideIcon> = {
  private: Lock,
  anonymous: Link2,
}

const VISIBILITY_NOTES: Record<EvaluationVisibility, string> = {
  private: 'O resultado só abre com a sessão de quem criou a avaliação.',
  anonymous: 'O resultado abre pelo link, para qualquer pessoa que o tenha. Guarde o endereço.',
}

export interface SummaryAccount {
  savedApiName: string | null
}

function pillarWeight(form: EvaluationFormState, pillar: PillarName): number {
  if (form.type !== 'full') return 1
  if (!form.customWeights) return 1 / 3

  const value = parseDecimal(form.weights[pillar]) / 100
  return Number.isFinite(value) && value > 0 ? value : 0
}

function pillarDetail(form: EvaluationFormState, pillar: PillarName): string {
  if (pillar === 'contract') {
    const rules = describeRules(form)
    return rules === DEFAULTS_LABEL ? 'Regras padrão do Spectral' : rules
  }
  if (pillar === 'performance') {
    const seconds = formatNumber(estimateLoadDuration(form))
    return `${formatCount(form.targets.length, 'endpoint', 'endpoints')} · ${seconds} s de ${MAX_TOTAL_DURATION_SECONDS} s`
  }
  return 'Oito verificações em quatro camadas'
}

function exceedsTotalDuration(form: EvaluationFormState): boolean {
  return usesTargets(form.type) && estimateLoadDuration(form) > MAX_TOTAL_DURATION_SECONDS
}

function hostLabel(baseUrl: string | undefined): string {
  if (!baseUrl) return 'a URL base da especificação'
  try {
    return new URL(baseUrl).host
  } catch {
    return baseUrl
  }
}

interface LoadTargetProps {
  form: EvaluationFormState
  baseUrl: string | undefined
  confirming: boolean
}

function LoadTarget({ form, baseUrl, confirming }: LoadTargetProps) {
  const over = exceedsTotalDuration(form)

  return (
    <div
      className={`flex min-w-0 flex-col gap-1 rounded-md border px-3 py-2 text-sm ${confirming ? 'border-warning/40 bg-warning-dim' : 'border-border bg-bg'}`}
    >
      <span className={`font-medium ${over ? 'text-error' : 'text-ink'}`}>
        {formatCount(form.targets.length, 'endpoint', 'endpoints')} · {formatNumber(estimateLoadDuration(form))} s
        {over ? ` (limite de ${MAX_TOTAL_DURATION_SECONDS} s)` : ''}
      </span>
      {baseUrl ? (
        <MiddleTruncate text={baseUrl} className="font-mono text-xs text-ink-secondary" />
      ) : (
        <span className="text-ink-secondary">Na URL base da especificação</span>
      )}
      {confirming ? (
        <span role="status" className="font-medium text-warning">
          Clique de novo para enviar a carga a {hostLabel(baseUrl)}.
        </span>
      ) : null}
    </div>
  )
}

interface CompositionProps {
  form: EvaluationFormState
}

function Composition({ form }: CompositionProps) {
  const pillars = PILLARS_BY_TYPE[form.type]
  const weights = pillars.map((pillar) => pillarWeight(form, pillar))
  const total = weights.reduce((sum, weight) => sum + weight, 0)

  return (
    <div
      role="img"
      aria-label={`Pilares da avaliação: ${pillars.map((pillar) => PILLAR_LABELS[pillar]).join(', ')}`}
      className="flex h-2 gap-0.5"
    >
      {pillars.map((pillar, index) => (
        <span
          key={pillar}
          className={`min-w-0.5 rounded-xs transition-[flex-grow] duration-200 motion-reduce:transition-none ${PILLAR_BG[pillar]}`}
          style={{ flexGrow: total > 0 ? weights[index] : 1 }}
        />
      ))}
    </div>
  )
}

function buildMeta(
  form: EvaluationFormState,
  account: SummaryAccount | null,
  baseUrl: string | undefined,
): MetaItem[] {
  const openApiUrl = form.openApiUrl.trim()
  const minScore = form.minScore.trim()
  const meta: MetaItem[] = [
    {
      label: 'Especificação',
      value: openApiUrl || <span className="font-sans text-ink-muted">Não informada</span>,
      mono: openApiUrl !== '',
    },
  ]

  if (usesBaseUrl(form.type)) {
    meta.push({
      label: 'URL base',
      value: baseUrl || 'A da especificação',
      mono: Boolean(baseUrl),
    })
  }
  if (account) {
    meta.push({
      label: 'API salva',
      value: account.savedApiName
        ? form.saveApi
          ? `${account.savedApiName}; nova configuração será salva`
          : account.savedApiName
        : form.saveApi
          ? 'Será salva ao iniciar'
          : 'Nenhuma',
    })
  }
  meta.push({ label: 'Nota mínima', value: minScore || 'Sem nota mínima', mono: minScore !== '' })

  return meta
}

function GoToErrorButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mt-1 cursor-pointer self-start text-accent-ink underline underline-offset-2 max-lg:-my-3 max-lg:py-3 ${TEXT_LINK}`}
    >
      Ir ao primeiro campo
    </button>
  )
}

interface RequestSummaryProps {
  form: EvaluationFormState
  account: SummaryAccount | null
  hasErrors: boolean
  onGoToError: () => void
  isSending: boolean
  submitError: string | null
  submitDetails: IValidationIssue[]
  confirming: boolean
  baseUrl: string | undefined
}

interface MobileSubmitBarProps {
  form: EvaluationFormState
  anonymous: boolean
  confirming: boolean
  baseUrl: string | undefined
  isSending: boolean
  message: string | null
}

export function MobileSubmitBar({
  form,
  anonymous,
  confirming,
  baseUrl,
  isSending,
  message,
}: MobileSubmitBarProps) {
  return (
    <div className="sticky bottom-0 z-10 flex items-center gap-3 border-t border-border bg-surface px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 lg:hidden">
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="flex min-w-0 items-center justify-between gap-2">
          <span className="truncate font-semibold text-ink">{TYPE_LABELS[form.type]}</span>
          {usesTargets(form.type) ? (
            <span className="inline-flex shrink-0 items-center gap-1 text-xs text-warning">
              <Icon icon={TriangleAlert} size={12} />
              Carga real
            </span>
          ) : null}
        </span>
        {message ? (
          <span className="text-xs leading-4 text-error">{message}</span>
        ) : confirming ? (
          <span role="status" className="text-xs leading-4 font-medium text-warning">
            Toque de novo para enviar a carga a {hostLabel(baseUrl)}
          </span>
        ) : (
          <span className="flex items-center gap-3">
            <span className="min-w-0 flex-1">
              <Composition form={form} />
            </span>
            {anonymous ? (
              <span className="inline-flex shrink-0 items-center gap-1 text-xs text-ink-secondary">
                <Icon icon={Link2} size={12} />
                Anônima
              </span>
            ) : null}
          </span>
        )}
      </div>
      <Button type="submit" variant="primary" size="lg" icon={Play} loading={isSending}>
        {isSending ? 'Enviando…' : confirming ? 'Confirmar' : 'Iniciar'}
      </Button>
    </div>
  )
}

export function RequestSummary({
  form,
  account,
  hasErrors,
  onGoToError,
  isSending,
  submitError,
  submitDetails,
  confirming,
  baseUrl,
}: RequestSummaryProps) {
  const preview = buildRequestPreview(form)
  const visibility: EvaluationVisibility = account ? 'private' : 'anonymous'
  const groups = EXECUTION_GROUPS[form.type]
  const isFull = form.type === 'full'

  return (
    <aside aria-label="Resumo do pedido" className={`${RAIL} max-lg:order-last lg:order-first`}>
      <div className="flex flex-col gap-3">
        <h2 className="font-display text-base font-semibold tracking-[-0.01em] text-ink">
          {TYPE_TITLES[form.type]}
        </h2>
        <Composition form={form} />
        <div className="flex flex-col items-start gap-2">
          <Badge tone={VISIBILITY_TONES[visibility]} icon={VISIBILITY_ICONS[visibility]}>
            {VISIBILITY_LABELS[visibility]}
          </Badge>
          <p className="text-sm text-ink-secondary">{VISIBILITY_NOTES[visibility]}</p>
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <h3 className={OVERLINE}>Ordem de execução</h3>
        <ol className="flex flex-col gap-3">
          {groups.map((group, index) => (
            <li
              key={group.label}
              className="relative ml-2 flex flex-col gap-1.5 border-l border-border-hover pl-5"
            >
              <p className={OVERLINE}>
                <span
                  aria-hidden="true"
                  className="absolute top-0 -left-2 inline-flex size-4 items-center justify-center rounded-full border border-border-control bg-surface font-mono text-[10px] leading-none font-medium tracking-normal text-ink-secondary"
                >
                  {index + 1}
                </span>
                {group.label}
              </p>
              <ul className="flex flex-col gap-1.5">
                {group.pillars.map((pillar) => (
                  <li
                    key={pillar}
                    className="flex flex-col gap-0.5 rounded-md border border-border bg-bg px-3 py-2"
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className={`size-2.5 shrink-0 rounded-xs ${PILLAR_BG[pillar]}`}
                      />
                      <span className="font-semibold text-ink">{PILLAR_LABELS[pillar]}</span>
                      {isFull ? (
                        <span className="ml-auto font-mono text-xs whitespace-nowrap text-ink-secondary">
                          peso {formatPercent(pillarWeight(form, pillar))}
                        </span>
                      ) : null}
                    </span>
                    <span
                      className={`text-sm ${pillar === 'performance' && exceedsTotalDuration(form) ? 'text-error' : 'text-ink-secondary'}`}
                    >
                      {pillarDetail(form, pillar)}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-2">
        <h3 className={OVERLINE}>Dados do pedido</h3>
        <MetaList items={buildMeta(form, account, baseUrl)} />
      </section>

      <details className="group border-t border-border">
        <summary
          className={`flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-sm text-sm font-medium text-ink-secondary [&::-webkit-details-marker]:hidden ${FOCUS_RING}`}
        >
          <Icon
            icon={ChevronRight}
            size={14}
            className="transition-transform duration-150 group-open:rotate-90"
          />
          Pedido em JSON
        </summary>
        <div className="pb-1">
          <CodeBlock
            title={`POST /api/evaluations/${preview.type}`}
            code={JSON.stringify(preview.payload, null, 2)}
          />
        </div>
      </details>

      <div className="flex flex-col gap-3 border-t border-border bg-surface pt-4 lg:sticky lg:bottom-0 lg:z-1 lg:-mx-6 lg:-mb-5 lg:mt-auto lg:px-6 lg:pb-5">
        {submitError ? (
          <Notice tone="error" title="A avaliação não foi aceita.">
            <p>
              {submitError}
              {hasErrors ? ' Revise os campos destacados.' : null}
            </p>
            {submitDetails.length > 0 ? (
              <ul className="mt-2 flex list-disc flex-col gap-1 pl-4">
                {submitDetails.map((issue, index) => (
                  <li key={index}>
                    {issue.path ? <span className="font-mono text-sm">{issue.path}: </span> : null}
                    {issue.message}
                  </li>
                ))}
              </ul>
            ) : null}
            {hasErrors ? <GoToErrorButton onClick={onGoToError} /> : null}
          </Notice>
        ) : hasErrors ? (
          <Notice tone="error" title="Revise os campos destacados antes de enviar.">
            <GoToErrorButton onClick={onGoToError} />
          </Notice>
        ) : null}
        {usesTargets(form.type) ? (
          <>
            <p className="flex items-start gap-2 text-sm text-ink-secondary">
              <span className="flex h-5 items-center text-warning">
                <Icon icon={TriangleAlert} size={14} />
              </span>
              O teste de carga envia requisições reais aos endpoints escolhidos. Use só contra um ambiente descartável.
            </p>
            <LoadTarget form={form} baseUrl={baseUrl} confirming={confirming} />
          </>
        ) : null}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          icon={Play}
          loading={isSending}
          className="w-full max-lg:hidden"
        >
          {isSending ? 'Enviando…' : confirming ? 'Confirmar e iniciar' : 'Iniciar avaliação'}
        </Button>
        <p
          className={`hidden items-center justify-center gap-2 text-sm sm:flex max-lg:sm:hidden ${confirming ? 'font-medium text-warning' : 'text-ink-secondary'}`}
        >
          {confirming ? (
            <>
              Pressione <Kbd>Ctrl ↵</Kbd> de novo para enviar
            </>
          ) : usesTargets(form.type) ? (
            <>
              <Kbd>Ctrl ↵</Kbd> duas vezes envia o pedido
            </>
          ) : (
            <>
              <Kbd>Ctrl ↵</Kbd> envia o pedido
            </>
          )}
        </p>
      </div>
    </aside>
  )
}
