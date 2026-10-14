import { useState, type ReactNode } from 'react'
import { LayoutDashboard } from 'lucide-react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { AccountTip } from '../components/account/AccountTip'
import { ContractSection } from '../components/result/ContractSection'
import { PerformanceSection } from '../components/result/PerformanceSection'
import { PillarPlaceholder } from '../components/result/PillarPlaceholder'
import { ResultHeader } from '../components/result/ResultHeader'
import { ResultStats } from '../components/result/ResultStats'
import { ScoreSummary } from '../components/result/ScoreSummary'
import { ScoringParameters } from '../components/result/ScoringParameters'
import { SecuritySection } from '../components/result/SecuritySection'
import { StatusNotice } from '../components/result/StatusNotice'
import { Button } from '../components/ui/Button'
import { Notice } from '../components/ui/Notice'
import { TabPanel, Tabs, type TabItem } from '../components/ui/Tabs'
import { FOCUS_RING, GLASS } from '../components/ui/classes'
import { useEvaluationPolling, useSession } from '../hooks'
import type { EvaluationRecord, PillarName } from '../types'
import { PILLAR_ICONS } from '../utils/icons'
import { PILLARS_BY_TYPE, PILLAR_LABELS } from '../utils/labels'
import { LOGIN_PATH, NEW_EVALUATION_PATH, type ResultLocationState } from '../utils/routes'

type TabId = 'overview' | PillarName

const TABS_ID = 'resultado'

const SUMMARY_GRID =
  'grid grid-cols-1 gap-3 *:only:col-span-full lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]'

function ResultSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Carregando avaliação"
      className="flex flex-col gap-6"
    >
      <div className="h-8 w-64 animate-pulse rounded-md bg-glass-raised motion-reduce:animate-none" />
      <div className={`h-60 animate-pulse border-border motion-reduce:animate-none ${GLASS}`} />
      <div className={`h-48 animate-pulse border-border motion-reduce:animate-none ${GLASS}`} />
    </div>
  )
}

function pillarScore(evaluation: EvaluationRecord, pillar: PillarName): number | undefined {
  return evaluation.pillarScores?.[pillar]
}

function hasPillarResult(evaluation: EvaluationRecord, pillar: PillarName): boolean {
  if (pillar === 'contract') return evaluation.spectralResult !== null
  if (pillar === 'performance') return evaluation.performanceResults !== null
  return evaluation.securityResult !== null
}

function renderPillar(evaluation: EvaluationRecord, pillar: PillarName): ReactNode {
  const score = pillarScore(evaluation, pillar)

  if (pillar === 'contract' && evaluation.spectralResult) {
    return <ContractSection result={evaluation.spectralResult} score={score} />
  }
  if (pillar === 'performance' && evaluation.performanceResults) {
    return (
      <PerformanceSection
        results={evaluation.performanceResults}
        targets={evaluation.targets}
        score={score}
      />
    )
  }
  if (pillar === 'security' && evaluation.securityResult) {
    return (
      <SecuritySection
        checks={evaluation.securityResult}
        layerWeights={evaluation.scoring?.security?.layerWeights}
        breakdown={evaluation.scoreBreakdown}
        score={score}
      />
    )
  }
  return null
}

function pillarCount(evaluation: EvaluationRecord, pillar: PillarName): number | undefined {
  if (pillar === 'contract') return evaluation.spectralResult?.summary.violatedRules
  if (pillar === 'security') {
    return evaluation.securityResult?.filter((check) => check.status !== 'pass').length
  }
  return undefined
}

interface ResultBodyProps {
  evaluation: EvaluationRecord
  isActive: boolean
}

function FullResult({ evaluation, isActive }: ResultBodyProps) {
  const [tab, setTab] = useState<TabId>('overview')

  const items: TabItem<TabId>[] = [
    { id: 'overview', label: 'Visão geral', icon: LayoutDashboard },
    ...PILLARS_BY_TYPE.full.map(
      (pillar): TabItem<TabId> => ({
        id: pillar,
        label: PILLAR_LABELS[pillar],
        icon: PILLAR_ICONS[pillar],
        count: pillarCount(evaluation, pillar),
      }),
    ),
  ]

  return (
    <>
      <Tabs
        label="Seções do resultado"
        idPrefix={TABS_ID}
        items={items}
        value={tab}
        onChange={setTab}
      />
      <TabPanel idPrefix={TABS_ID} tab={tab} className="flex flex-col gap-6">
        {tab === 'overview' ? (
          <>
            <div className={SUMMARY_GRID}>
              <ScoreSummary evaluation={evaluation} isActive={isActive} onOpenPillar={setTab} />
              <ResultStats evaluation={evaluation} isActive={isActive} onOpenPillar={setTab} />
            </div>
            {evaluation.scoring ? <ScoringParameters scoring={evaluation.scoring} /> : null}
          </>
        ) : hasPillarResult(evaluation, tab) ? (
          renderPillar(evaluation, tab)
        ) : (
          <PillarPlaceholder pillar={tab} evaluation={evaluation} isActive={isActive} />
        )}
      </TabPanel>
    </>
  )
}

function SinglePillarResult({ evaluation, isActive }: ResultBodyProps) {
  const [pillar] = PILLARS_BY_TYPE[evaluation.evaluationType]

  return (
    <>
      <div className={SUMMARY_GRID}>
        <ScoreSummary evaluation={evaluation} isActive={isActive} />
        <ResultStats evaluation={evaluation} isActive={isActive} />
      </div>
      {renderPillar(evaluation, pillar)}
      {evaluation.scoring ? <ScoringParameters scoring={evaluation.scoring} /> : null}
    </>
  )
}

export function EvaluationResultPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useSession()
  const { evaluation, isLoading, isPaused, isPolling, isFetching, error, refetch } =
    useEvaluationPolling(id)
  const hasAccount = user !== null
  const savedApi = (location.state as ResultLocationState | null)?.savedApi

  const markApiSaved = () => {
    const state: ResultLocationState = { savedApi: 'saved' }
    navigate(location, { replace: true, state })
  }

  if (isLoading) {
    return (
      <>
        {isPaused ? <Notice title="Aguardando a conexão para carregar a avaliação." /> : null}
        <ResultSkeleton />
      </>
    )
  }

  if (!evaluation) {
    return (
      <>
        <Notice tone="error" title="Não foi possível carregar a avaliação.">
          {error ?? 'Avaliação não encontrada.'}
          {hasAccount ? null : ' Se ela foi criada com uma conta, entre para abrir o resultado.'}
        </Notice>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Button loading={isFetching} onClick={refetch}>
            Tentar de novo
          </Button>
          {hasAccount ? null : (
            <Link
              to={LOGIN_PATH}
              state={{ from: location.pathname }}
              className={`rounded-sm font-medium text-accent-ink underline underline-offset-4 ${FOCUS_RING}`}
            >
              Entrar
            </Link>
          )}
          <Link
            to={NEW_EVALUATION_PATH}
            className={`rounded-sm font-medium text-accent-ink underline underline-offset-4 ${FOCUS_RING}`}
          >
            Iniciar uma nova avaliação
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <ResultHeader
        key={evaluation.id}
        evaluation={evaluation}
        isActive={isPolling}
        hasAccount={hasAccount}
        apiSaved={savedApi === 'saved'}
        onApiSaved={markApiSaved}
      />
      {savedApi === 'failed' && hasAccount ? (
        <Notice tone="warning" title="A avaliação foi criada, mas a API não foi salva.">
          Use "Salvar API" acima para tentar de novo.
        </Notice>
      ) : null}
      {error ? (
        <Notice tone="warning" title="Não foi possível atualizar o resultado.">
          {error} Os dados abaixo são da última atualização; a página continua tentando.
        </Notice>
      ) : null}
      <StatusNotice evaluation={evaluation} />
      {!hasAccount && evaluation.visibility === 'anonymous' ? (
        <AccountTip id="result" title="Esta avaliação não está em nenhum histórico">
          <p className="max-w-[88ch] text-[13px] text-ink">
            Ela só abre por este endereço, para qualquer pessoa que o tenha. Com uma conta, as
            próximas avaliações entram no histórico, ficam privadas e a API pode ser salva para
            reavaliar sem redigitar.
          </p>
        </AccountTip>
      ) : null}
      {evaluation.evaluationType === 'full' ? (
        <FullResult evaluation={evaluation} isActive={isPolling} />
      ) : (
        <SinglePillarResult evaluation={evaluation} isActive={isPolling} />
      )}
    </>
  )
}
