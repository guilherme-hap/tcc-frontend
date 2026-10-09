import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ContractRulesFields } from '../components/form/ContractRulesFields'
import { LoadOptionsFields } from '../components/form/LoadOptionsFields'
import { RequestSummary } from '../components/form/RequestSummary'
import { TargetsField } from '../components/form/TargetsField'
import { TypeSelector } from '../components/form/TypeSelector'
import { WeightsFields } from '../components/form/WeightsFields'
import {
  MAX_TARGETS,
  buildEvaluationRequest,
  createInitialFormState,
  hasMutatingTarget,
  mapServerIssues,
  usesBaseUrl,
  usesContractRules,
  usesTargets,
  type EvaluationFormState,
  type FormErrors,
} from '../components/form/formState'
import { Badge } from '../components/ui/Badge'
import { CheckboxField, TextField } from '../components/ui/Field'
import { Panel } from '../components/ui/Panel'
import { ApiError, createEvaluation } from '../services'
import { TYPE_ORDER } from '../utils/labels'
import { TYPE_PARAM, evaluationPath } from '../utils/routes'

function hasLoadOptionError(errors: FormErrors): boolean {
  return Object.keys(errors).some((key) => key.startsWith('options.') || key.startsWith('headers.'))
}

export function NewEvaluationPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState<EvaluationFormState>(() => {
    const requested = searchParams.get(TYPE_PARAM)
    return createInitialFormState(TYPE_ORDER.find((type) => type === requested))
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loadOptionsOpen, setLoadOptionsOpen] = useState(false)
  const [contractRulesOpen, setContractRulesOpen] = useState(false)
  const [submitDetails, setSubmitDetails] = useState<string[]>([])

  const mutation = useMutation({
    mutationFn: createEvaluation,
    onSuccess: ({ evaluationId }) => navigate(evaluationPath(evaluationId)),
  })

  const update = (patch: Partial<EvaluationFormState>) => {
    setForm((current) => ({ ...current, ...patch }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (mutation.isPending) return

    mutation.reset()
    setSubmitDetails([])
    const result = buildEvaluationRequest(form)

    if (!result.ok) {
      setErrors(result.errors)
      if (hasLoadOptionError(result.errors)) setLoadOptionsOpen(true)
      if (result.errors.severityWeights) setContractRulesOpen(true)
      return
    }

    setErrors({})
    mutation.mutate(result.request, {
      onError: (error) => {
        if (!(error instanceof ApiError) || error.issues.length === 0) return

        const mapped = mapServerIssues(form, error.issues)
        setErrors(mapped.errors)
        setSubmitDetails(mapped.unmatched.map((issue) => issue.message))
        if (hasLoadOptionError(mapped.errors)) setLoadOptionsOpen(true)
        if (mapped.errors.severityWeights) setContractRulesOpen(true)
      },
    })
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault()
      event.currentTarget.requestSubmit()
    }
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl leading-8 font-semibold tracking-[-0.01em] text-ink">
          Nova avaliação
        </h1>
        <p className="max-w-[64ch] text-ink-secondary">
          Informe a especificação OpenAPI e a URL base da API. A avaliação roda em segundo plano e
          o resultado aparece assim que terminar.
        </p>
      </div>

      <form
        noValidate
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]"
      >
        <div className="flex min-w-0 flex-col gap-4">
          <Panel
            title="Tipo de avaliação"
            description="Define quais pilares rodam e quais campos o pedido exige."
          >
            <TypeSelector value={form.type} onChange={(type) => update({ type })} />
          </Panel>

          <Panel
            title="Alvo"
            description="A API é avaliada de fora: só a especificação e a URL base são necessárias."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                id="openApiUrl"
                label="URL da especificação OpenAPI"
                type="url"
                mono
                placeholder="https://api.exemplo.com/openapi.json"
                hint="JSON ou YAML, OpenAPI 3.x ou Swagger 2.0."
                error={errors.openApiUrl}
                value={form.openApiUrl}
                onChange={(event) => update({ openApiUrl: event.target.value })}
              />
              {usesBaseUrl(form.type) ? (
                <TextField
                  id="apiBaseUrl"
                  label="URL base da API"
                  optional
                  type="url"
                  mono
                  placeholder="https://api.exemplo.com"
                  hint="Vazia, usa o primeiro servidor declarado na especificação."
                  error={errors.apiBaseUrl}
                  value={form.apiBaseUrl}
                  onChange={(event) => update({ apiBaseUrl: event.target.value })}
                />
              ) : null}
            </div>
          </Panel>

          {usesContractRules(form.type) ? (
            <ContractRulesFields
              form={form}
              errors={errors}
              open={contractRulesOpen}
              onToggle={setContractRulesOpen}
              onChange={update}
            />
          ) : null}

          {usesTargets(form.type) ? (
            <>
              <Panel
                title="Endpoints do teste de carga"
                description="Paths como aparecem na especificação. Parâmetros entre chaves são preenchidos com valores de exemplo; os testes rodam um endpoint por vez."
                aside={
                  <Badge mono>
                    {form.targets.length} de {MAX_TARGETS}
                  </Badge>
                }
              >
                <div className="flex min-w-0 flex-col gap-5">
                  <TargetsField
                    targets={form.targets}
                    errors={errors}
                    onChange={(targets) => update({ targets })}
                  />
                  {hasMutatingTarget(form) ? (
                    <div className="rounded-md border border-warning/40 bg-warning-dim px-4 py-3">
                      <CheckboxField
                        id="allowMutatingMethods"
                        label="Autorizo o teste com métodos que alteram dados"
                        description="POST, PUT, PATCH e DELETE são enviados de verdade. Use apenas contra um ambiente descartável, nunca produção."
                        error={errors.allowMutatingMethods}
                        checked={form.allowMutatingMethods}
                        onChange={(allowMutatingMethods) => update({ allowMutatingMethods })}
                      />
                    </div>
                  ) : null}
                </div>
              </Panel>
              <LoadOptionsFields
                form={form}
                errors={errors}
                open={loadOptionsOpen}
                onToggle={setLoadOptionsOpen}
                onChange={update}
              />
            </>
          ) : null}

          {form.type === 'full' ? (
            <Panel title="Pesos dos pilares" description="Quanto cada pilar vale na nota final.">
              <WeightsFields form={form} errors={errors} onChange={update} />
            </Panel>
          ) : null}
        </div>

        <aside
          aria-label="Resumo do pedido"
          className="min-w-0 rounded-card [scrollbar-color:var(--border-hover)_transparent] [scrollbar-width:thin] lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6.5rem)] lg:overflow-y-auto"
        >
          <RequestSummary
            form={form}
            hasErrors={Object.keys(errors).length > 0}
            isSending={mutation.isPending}
            submitError={mutation.isError ? mutation.error.message : null}
            submitDetails={submitDetails}
          />
        </aside>
      </form>
    </>
  )
}
