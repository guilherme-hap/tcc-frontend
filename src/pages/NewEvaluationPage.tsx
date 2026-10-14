import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Bookmark, Check, History, type LucideIcon } from 'lucide-react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { AccountTip } from '../components/account/AccountTip'
import { ContractRulesFields } from '../components/form/ContractRulesFields'
import { LoadOptionsFields } from '../components/form/LoadOptionsFields'
import { RequestSummary } from '../components/form/RequestSummary'
import { TargetFields } from '../components/form/TargetFields'
import { TargetsField } from '../components/form/TargetsField'
import { TypeSelector } from '../components/form/TypeSelector'
import { WeightsFields } from '../components/form/WeightsFields'
import { applySavedApi, buildSubmission } from '../components/form/accountState'
import { clearFormDraft, readFormDraft, saveFormDraft } from '../components/form/formDraft'
import { pruneErrors } from '../components/form/formErrors'
import {
  MAX_TARGETS,
  createInitialFormState,
  hasMutatingTarget,
  mapServerIssues,
  usesContractRules,
  usesTargets,
  type EvaluationFormState,
  type FormErrors,
} from '../components/form/formState'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { CheckboxField, TextField } from '../components/ui/Field'
import { Icon } from '../components/ui/Icon'
import { Notice } from '../components/ui/Notice'
import { Panel } from '../components/ui/Panel'
import { TextLink } from '../components/ui/TextLink'
import { GLASS } from '../components/ui/classes'
import { EVALUATION_HISTORY_KEY, SAVED_APIS_KEY, useSavedApis, useSession } from '../hooks'
import { ApiError, createEvaluation, createSavedApi } from '../services'
import type {
  EvaluationRequest,
  EvaluationType,
  IValidationIssue,
  SavedApi,
  SavedApiInput,
} from '../types'
import { TYPE_ORDER } from '../utils/labels'
import {
  NEW_EVALUATION_PATH,
  SAVED_API_PARAM,
  TYPE_PARAM,
  evaluationPath,
  newEvaluationPath,
  type RestoreDraftState,
  type ResultLocationState,
} from '../utils/routes'

interface TipItem {
  icon: LucideIcon
  text: string
}

const TIP_ITEMS: TipItem[] = [
  { icon: History, text: 'A avaliação entra no histórico e o resultado fica privado.' },
  {
    icon: Bookmark,
    text: 'A API pode ser salva, com especificação, URL base e opções do teste de carga.',
  },
  {
    icon: Check,
    text: 'As regras alteradas e os pesos por severidade viram um conjunto reutilizável.',
  },
]

interface Submission {
  request: EvaluationRequest
  savedApi: SavedApiInput | null
}

interface Rejection {
  form: EvaluationFormState
  errors: FormErrors
}

async function submitEvaluation({ request, savedApi }: Submission) {
  const { evaluationId } = await createEvaluation(request)
  const state: ResultLocationState = {}
  if (!savedApi) return { evaluationId, state }

  try {
    await createSavedApi(savedApi)
    state.savedApi = 'saved'
  } catch {
    state.savedApi = 'failed'
  }
  return { evaluationId, state }
}

function hasLoadOptionError(errors: FormErrors): boolean {
  return Object.keys(errors).some((key) => key.startsWith('options.') || key.startsWith('headers.'))
}

function FormSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Carregando a API salva"
      className="flex flex-col gap-6"
    >
      <div className="h-8 w-56 animate-pulse rounded-md bg-glass-raised motion-reduce:animate-none" />
      <div className={`h-72 animate-pulse border-border motion-reduce:animate-none ${GLASS}`} />
    </div>
  )
}

interface SavedApiLoadErrorProps {
  message: string | null
  type: EvaluationType | undefined
  onRetry: () => void
}

function SavedApiLoadError({ message, type, onRetry }: SavedApiLoadErrorProps) {
  return (
    <>
      <Notice tone="error" title="Não foi possível carregar a API salva deste link.">
        {message ?? 'Sem resposta do servidor do auditor.'}
      </Notice>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <Button onClick={onRetry}>Tentar de novo</Button>
        <TextLink to={type ? newEvaluationPath(type) : NEW_EVALUATION_PATH}>
          Continuar sem a API salva
        </TextLink>
      </div>
    </>
  )
}

interface EvaluationFormProps {
  initialType: EvaluationType | undefined
  initialApi: SavedApi | null
  missingApi: boolean
  restoresDraft: boolean
}

function EvaluationForm({
  initialType,
  initialApi,
  missingApi,
  restoresDraft,
}: EvaluationFormProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useSession()
  const { apis } = useSavedApis()
  const [enteredForm, setEnteredForm] = useState<EvaluationFormState>(() => {
    const draft = restoresDraft ? readFormDraft() : null
    if (draft) return draft

    const initial = createInitialFormState(initialType)
    return initialApi ? applySavedApi(initial, initialApi) : initial
  })
  const [rejection, setRejection] = useState<Rejection | null>(null)
  const [loadOptionsOpen, setLoadOptionsOpen] = useState(false)
  const [contractRulesOpen, setContractRulesOpen] = useState(false)
  const [submitDetails, setSubmitDetails] = useState<IValidationIssue[]>([])

  const hasAccount = user !== null
  const savedApis = hasAccount ? (apis ?? []) : null
  const selectedApi = savedApis?.find((api) => api.id === enteredForm.savedApiId) ?? null
  const form =
    selectedApi || !enteredForm.savedApiId ? enteredForm : { ...enteredForm, savedApiId: '' }
  const errors = rejection ? pruneErrors(rejection.errors, rejection.form, form) : {}

  const leaving = useRef({ form, keepsDraft: false })
  const submitted = useRef(false)

  const mutation = useMutation({
    mutationFn: submitEvaluation,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [EVALUATION_HISTORY_KEY] })
      void queryClient.invalidateQueries({ queryKey: [SAVED_APIS_KEY] })
    },
  })

  useEffect(() => {
    leaving.current = { form, keepsDraft: !hasAccount }
  })

  useEffect(() => {
    clearFormDraft()
    return () => {
      if (leaving.current.keepsDraft && !submitted.current) saveFormDraft(leaving.current.form)
    }
  }, [])

  const update = (patch: Partial<EvaluationFormState>) => {
    setEnteredForm((current) => ({ ...current, ...patch }))
  }

  const revealErrors = (next: FormErrors) => {
    setRejection({ form, errors: next })
    if (hasLoadOptionError(next)) setLoadOptionsOpen(true)
    if (next.severityWeights) setContractRulesOpen(true)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (mutation.isPending) return

    mutation.reset()
    setSubmitDetails([])
    const result = buildSubmission(form, hasAccount)

    if (!result.ok) {
      revealErrors(result.errors)
      return
    }

    setRejection(null)
    mutation.mutate(result, {
      onSuccess: ({ evaluationId, state }) => {
        submitted.current = true
        navigate(evaluationPath(evaluationId), { state })
      },
      onError: (error) => {
        if (!(error instanceof ApiError) || error.issues.length === 0) return

        const mapped = mapServerIssues(form, error.issues)
        revealErrors(mapped.errors)
        setSubmitDetails(mapped.unmatched)
      },
    })
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== 'Enter') return

    if (event.ctrlKey || event.metaKey) {
      event.preventDefault()
      event.currentTarget.requestSubmit()
    } else if (event.target instanceof HTMLInputElement) {
      event.preventDefault()
    }
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl leading-8 font-semibold tracking-[-0.01em] text-ink">
          Nova avaliação
        </h1>
        <p className="max-w-[64ch] text-ink-secondary">
          {hasAccount
            ? 'Parta de uma API salva ou informe a especificação OpenAPI e a URL base. A avaliação roda em segundo plano e o resultado entra no histórico assim que terminar.'
            : 'Informe a especificação OpenAPI e a URL base da API. A avaliação roda em segundo plano e o resultado aparece assim que terminar.'}
        </p>
      </div>

      {missingApi ? (
        <Notice tone="warning" title="A API salva deste link não foi encontrada na conta.">
          Ela pode ter sido excluída. Preencha os campos à mão ou escolha outra API salva.
        </Notice>
      ) : null}

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

          <TargetFields form={form} errors={errors} savedApis={savedApis} onChange={update} />

          {usesContractRules(form.type) ? (
            <ContractRulesFields
              form={form}
              errors={errors}
              open={contractRulesOpen}
              hasAccount={hasAccount}
              onToggle={setContractRulesOpen}
              onChange={update}
            />
          ) : null}

          {usesTargets(form.type) ? (
            <>
              <Panel
                title="Endpoints do teste de carga"
                description="Paths como aparecem na especificação. Cada parâmetro entre chaves recebe o valor informado ou, sem ele, um valor gerado a partir da especificação; os testes rodam um endpoint por vez."
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

          <Panel
            title="Critério de aprovação"
            description="Com uma nota mínima, o resultado diz se a avaliação foi aprovada ou reprovada. A execução e as notas não mudam."
          >
            <div className="max-w-90">
              <TextField
                id="minScore"
                label="Nota mínima"
                optional
                inputMode="decimal"
                mono
                placeholder="Sem nota mínima"
                hint="De 0 a 100, comparada com a nota final. Avaliação parcial ou que falhou é reprovada."
                error={errors.minScore}
                value={form.minScore}
                onChange={(event) => update({ minScore: event.target.value })}
              />
            </div>
          </Panel>
        </div>

        <aside
          aria-label="Resumo do pedido"
          className="flex min-w-0 flex-col gap-4 rounded-card [scrollbar-color:var(--border-hover)_transparent] [scrollbar-width:thin] lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6.5rem)] lg:overflow-y-auto"
        >
          <RequestSummary
            form={form}
            account={hasAccount ? { savedApiName: selectedApi?.name ?? null } : null}
            hasErrors={Object.keys(errors).length > 0}
            isSending={mutation.isPending}
            submitError={mutation.isError ? mutation.error.message : null}
            submitDetails={submitDetails}
          />
          {hasAccount ? null : (
            <AccountTip
              id="new-evaluation"
              title="Entre antes de iniciar para guardar esta avaliação"
              stacked
            >
              <ul className="flex flex-col gap-2 text-[13px] text-ink">
                {TIP_ITEMS.map((item) => (
                  <li key={item.text} className="flex items-start gap-2">
                    <span className="flex h-5 items-center text-accent-ink">
                      <Icon icon={item.icon} size={14} />
                    </span>
                    {item.text}
                  </li>
                ))}
              </ul>
            </AccountTip>
          )}
        </aside>
      </form>
    </>
  )
}

export function NewEvaluationPage() {
  const { user } = useSession()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { apis, isLoading, error, refetch } = useSavedApis()
  const apiParam = searchParams.get(SAVED_API_PARAM)
  const requestedApiId = user ? apiParam : null
  const requestedType = searchParams.get(TYPE_PARAM)
  const initialType = TYPE_ORDER.find((type) => type === requestedType)

  if (requestedApiId && isLoading) return <FormSkeleton />
  if (requestedApiId && !apis) {
    return <SavedApiLoadError message={error} type={initialType} onRetry={refetch} />
  }

  const initialApi = apis?.find((api) => api.id === requestedApiId) ?? null

  return (
    <EvaluationForm
      key={`${requestedType ?? ''}|${apiParam ?? ''}`}
      initialType={initialType}
      initialApi={initialApi}
      missingApi={requestedApiId !== null && initialApi === null}
      restoresDraft={(location.state as RestoreDraftState | null)?.restoreDraft === true}
    />
  )
}
