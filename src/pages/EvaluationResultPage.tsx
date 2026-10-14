import { useState, type ReactNode } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { AccountTip } from '../components/account/AccountTip'
import { ContractSection } from '../components/result/ContractSection'
import { EndpointOverview } from '../components/result/EndpointOverview'
import { IssuesByEndpoint } from '../components/result/IssuesByEndpoint'
import { LatencyOverview } from '../components/result/LatencyOverview'
import { PendingList } from '../components/result/PendingList'
import { PerformanceSection } from '../components/result/PerformanceSection'
import { PillarPlaceholder } from '../components/result/PillarPlaceholder'
import { PillarTile } from '../components/result/PillarTile'
import { ResultRail } from '../components/result/ResultRail'
import { ResultToolbar } from '../components/result/ResultToolbar'
import { ScoringParameters } from '../components/result/ScoringParameters'
import { SecurityLayers } from '../components/result/SecurityLayers'
import { SecuritySection } from '../components/result/SecuritySection'
import { StatusNotice } from '../components/result/StatusNotice'
import { StepTimeline } from '../components/result/StepTimeline'
import { pillarPart } from '../components/result/pillarSummary'
import { sectionPanelId, sectionTabId, type SectionId } from '../components/result/sections'
import { Button } from '../components/ui/Button'
import { Notice } from '../components/ui/Notice'
import { CARD, FOCUS_RING, PAGE_CONTAINER } from '../components/ui/classes'
import { useEvaluationPolling, useSavedApis, useSession, type LiveSeries } from '../hooks'
import type { EvaluationRecord, PillarName } from '../types'
import { formatNumber, formatPercent } from '../utils/format'
import { PILLARS_BY_TYPE, PILLAR_LABELS } from '../utils/labels'
import { LOGIN_PATH, NEW_EVALUATION_PATH, type ResultLocationState } from '../utils/routes'
import { findSavedApiBySpec } from '../utils/savedApi'
import { finalScoreParts, securityScoreParts } from '../utils/scoreParts'
import { performanceProgress } from '../utils/steps'

const FRAME = 'lg:grid lg:grid-cols-[23.25rem_minmax(0,1fr)] lg:items-start'
const BODY = 'flex min-w-0 flex-col gap-5 px-4 pt-5 pb-10 sm:px-6 lg:px-7'
const CONTRACT_ONLY: PillarName[] = ['contract']
const SECURITY_ONLY: PillarName[] = ['security']
const STACK = 'min-w-0 flex-col gap-3'
const SECTION_TITLE = 'font-display text-[22px] leading-7 font-bold tracking-[-0.01em] text-ink'

function ResultSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Carregando avaliação" className={FRAME}>
      <div className="flex flex-col items-center gap-5 border-b border-border bg-surface px-6 py-5 lg:h-[calc(100dvh-53px)] lg:border-r lg:border-b-0">
        <div className="h-7 w-48 animate-pulse self-start rounded-md bg-surface-raised motion-reduce:animate-none" />
        <div className="size-52 animate-pulse rounded-full bg-surface-raised motion-reduce:animate-none" />
        <div className="h-40 w-full animate-pulse rounded-md bg-surface-raised motion-reduce:animate-none" />
      </div>
      <div className={BODY}>
        <div className="h-8 w-56 animate-pulse rounded-md bg-surface-raised motion-reduce:animate-none" />
        <div className={`h-44 animate-pulse border-border motion-reduce:animate-none ${CARD}`} />
        <div className={`h-60 animate-pulse border-border motion-reduce:animate-none ${CARD}`} />
      </div>
    </div>
  )
}

interface LiveState {
  isActive: boolean
  liveSeries: LiveSeries | null
  receivedAt: number
}

function renderPillar(
  evaluation: EvaluationRecord,
  pillar: PillarName,
  live: LiveState,
  standalone = false,
): ReactNode {
  const score = standalone ? undefined : evaluation.pillarScores?.[pillar]
  const progress = performanceProgress(evaluation)
  const loadTestOptions = evaluation.requestSettings?.loadTestOptions

  if (pillar === 'contract' && evaluation.spectralResult) {
    return <ContractSection result={evaluation.spectralResult} score={score} />
  }
  if (pillar === 'performance' && (evaluation.performanceResults || progress)) {
    return (
      <PerformanceSection
        results={evaluation.performanceResults ?? []}
        targets={evaluation.targets}
        score={score}
        progress={progress}
        liveSeries={live.liveSeries}
        receivedAt={live.receivedAt}
        isActive={live.isActive}
        limitedRequests={loadTestOptions?.maxRequests !== undefined}
        targetLatency={
          loadTestOptions?.targetLatency ?? evaluation.scoring?.performance?.targetLatency
        }
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

function describeFinalScore(evaluation: EvaluationRecord, isActive: boolean): string {
  const { evaluationType, finalScore, status, scoreBreakdown, securityResult } = evaluation

  if (evaluationType !== 'full') {
    const pillar = PILLAR_LABELS[evaluationType].toLowerCase()
    if (status === 'FAILED') return `A nota de ${pillar} não foi calculada porque a avaliação falhou.`
    if (securityResult && finalScore !== null && securityScoreParts(scoreBreakdown, securityResult)) {
      return `Com um único pilar, a nota final é a nota de ${pillar}. Cada arco do anel é uma camada: o comprimento é o peso e o preenchimento é a média das verificações.`
    }
    return `Com um único pilar, a nota final é a nota de ${pillar}.`
  }
  if (finalScore === null && !isActive && status !== 'COMPLETED') {
    return 'A nota final só é calculada quando os três pilares concluem.'
  }
  if (finalScoreParts(scoreBreakdown)) {
    return 'Soma das notas dos três pilares, cada uma multiplicada pelo seu peso. Cada arco do anel é um pilar: o comprimento é o peso e o preenchimento é a nota.'
  }
  return 'Soma das notas dos três pilares, cada uma multiplicada pelo seu peso.'
}

function describePillar(evaluation: EvaluationRecord, pillar: PillarName): string | null {
  const part = pillarPart(evaluation, pillar)
  if (!part) return null

  return `Peso ${formatPercent(part.weight)}: ${formatNumber(part.points)} de ${formatNumber(part.maxPoints)} pontos da nota final.`
}

interface SectionProps {
  evaluation: EvaluationRecord
  isActive: boolean
  liveSeries: LiveSeries | null
  receivedAt: number
}

interface OverviewProps extends SectionProps {
  highlighted: PillarName | null
  onOpen: (pillar: PillarName) => void
  onHighlight: (pillar: PillarName | null) => void
}

function Overview({
  evaluation,
  isActive,
  receivedAt,
  highlighted,
  onOpen,
  onHighlight,
}: OverviewProps) {
  const { performanceResults, spectralResult, securityResult } = evaluation
  const targetLatency = evaluation.scoring?.performance?.targetLatency

  return (
    <div className="@container flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 @2xl:grid-cols-3">
        {PILLARS_BY_TYPE.full.map((pillar) => (
          <PillarTile
            key={pillar}
            pillar={pillar}
            evaluation={evaluation}
            isActive={isActive}
            highlighted={highlighted === pillar}
            onOpen={onOpen}
            onHighlight={onHighlight}
          />
        ))}
      </div>
      <StepTimeline
        evaluation={evaluation}
        isActive={isActive}
        receivedAt={receivedAt}
        onOpenPerformance={() => onOpen('performance')}
      />
      <div className="grid grid-cols-1 items-start gap-3 @4xl:grid-cols-12 @7xl:grid-cols-3">
        <div className={`hidden @7xl:flex ${STACK}`}>
          {spectralResult ? (
            <>
              <PendingList evaluation={evaluation} pillars={CONTRACT_ONLY} onOpen={onOpen} />
              <IssuesByEndpoint result={spectralResult} />
            </>
          ) : null}
        </div>
        {performanceResults ? (
          <div className={`flex @4xl:col-span-7 @7xl:col-span-1 ${STACK}`}>
            <EndpointOverview
              results={performanceResults}
              targetLatency={targetLatency}
              onOpen={() => onOpen('performance')}
            />
            <LatencyOverview results={performanceResults} targetLatency={targetLatency} />
          </div>
        ) : (
          <div className="hidden @7xl:block" />
        )}
        <div className={`hidden @7xl:flex ${STACK}`}>
          {securityResult ? (
            <PendingList evaluation={evaluation} pillars={SECURITY_ONLY} onOpen={onOpen}>
              <SecurityLayers evaluation={evaluation} />
            </PendingList>
          ) : null}
        </div>
        {spectralResult || securityResult ? (
          <div
            className={`flex @7xl:hidden ${performanceResults ? '@4xl:col-span-5' : '@4xl:col-span-12'} ${STACK}`}
          >
            <PendingList evaluation={evaluation} onOpen={onOpen} />
            {spectralResult ? <IssuesByEndpoint result={spectralResult} /> : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}

interface ResultViewProps extends SectionProps {
  hasAccount: boolean
  apiSaved: boolean
  tip: ReactNode
  children: ReactNode
}

function ResultView({
  evaluation,
  isActive,
  liveSeries,
  receivedAt,
  hasAccount,
  apiSaved,
  tip,
  children,
}: ResultViewProps) {
  const [section, setSection] = useState<SectionId>('overview')
  const [highlighted, setHighlighted] = useState<PillarName | null>(null)
  const { scoring } = evaluation
  const isFull = evaluation.evaluationType === 'full'
  const [pillar] = PILLARS_BY_TYPE[evaluation.evaluationType]
  const summary = describeFinalScore(evaluation, isActive)
  const live: LiveState = { isActive, liveSeries, receivedAt }

  return (
    <div className={FRAME}>
      <ResultRail
        evaluation={evaluation}
        isActive={isActive}
        hasAccount={hasAccount}
        section={section}
        onSectionChange={setSection}
        highlighted={highlighted}
        onHighlight={setHighlighted}
      />
      <div className={BODY}>
        {children}
        <ResultToolbar
          evaluation={evaluation}
          isActive={isActive}
          hasAccount={hasAccount}
          apiSaved={apiSaved}
        >
          {!isFull ? (
            <p className="max-w-[72ch] text-ink-secondary">{summary}</p>
          ) : section === 'overview' ? (
            <>
              <h2 className={SECTION_TITLE}>Visão geral</h2>
              <p className="max-w-[72ch] text-ink-secondary">{summary}</p>
            </>
          ) : section === 'scoring' ? (
            <h2 className={SECTION_TITLE}>Parâmetros usados no cálculo</h2>
          ) : (
            <>
              <h2 className={SECTION_TITLE}>{PILLAR_LABELS[section]}</h2>
              <p className="max-w-[72ch] text-ink-secondary">
                {describePillar(evaluation, section)}
              </p>
            </>
          )}
        </ResultToolbar>
        {isFull ? (
          <div
            role="tabpanel"
            id={sectionPanelId(section)}
            aria-labelledby={sectionTabId(section)}
            tabIndex={0}
            className={`flex flex-col gap-3 rounded-card ${FOCUS_RING}`}
          >
            {section === 'overview' ? (
              <Overview
                evaluation={evaluation}
                isActive={isActive}
                liveSeries={liveSeries}
                receivedAt={receivedAt}
                highlighted={highlighted}
                onOpen={setSection}
                onHighlight={setHighlighted}
              />
            ) : section === 'scoring' ? (
              scoring ? (
                <ScoringParameters scoring={scoring} collapsible={false} />
              ) : null
            ) : (
              (renderPillar(evaluation, section, live) ?? (
                <PillarPlaceholder pillar={section} evaluation={evaluation} isActive={isActive} />
              ))
            )}
          </div>
        ) : (
          <>
            <StepTimeline evaluation={evaluation} isActive={isActive} receivedAt={receivedAt} />
            {renderPillar(evaluation, pillar, live, true) ??
              (evaluation.status === 'FAILED' ? null : (
                <PillarPlaceholder pillar={pillar} evaluation={evaluation} isActive={isActive} />
              ))}
            {scoring ? <ScoringParameters scoring={scoring} /> : null}
          </>
        )}
        {tip}
      </div>
    </div>
  )
}

export function EvaluationResultPage() {
  const { id } = useParams()
  const location = useLocation()
  const { user } = useSession()
  const {
    evaluation,
    liveSeries,
    progressReceivedAt,
    isLoading,
    isPaused,
    isPolling,
    isFetching,
    error,
    refetch,
  } = useEvaluationPolling(id)
  const { apis } = useSavedApis()
  const hasAccount = user !== null
  const apiSaved = evaluation ? findSavedApiBySpec(apis, evaluation.openApiUrl) !== null : false
  const apiSaveFailed = (location.state as ResultLocationState | null)?.apiSaveFailed === true

  if (isLoading) {
    return (
      <>
        {isPaused ? (
          <div className="px-4 pt-4 sm:px-6">
            <Notice title="Aguardando a conexão para carregar a avaliação." />
          </div>
        ) : null}
        <ResultSkeleton />
      </>
    )
  }

  if (!evaluation) {
    return (
      <div className={PAGE_CONTAINER}>
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
      </div>
    )
  }

  return (
    <ResultView
      key={evaluation.id}
      evaluation={evaluation}
      isActive={isPolling}
      liveSeries={liveSeries}
      receivedAt={progressReceivedAt}
      hasAccount={hasAccount}
      apiSaved={apiSaved}
      tip={
        !hasAccount && evaluation.visibility === 'anonymous' ? (
          <AccountTip id="result" title="Esta avaliação não está em nenhum histórico">
            <p className="max-w-[88ch] text-[13px] text-ink">
              Ela só abre por este endereço, para qualquer pessoa que o tenha. Com uma conta, as
              próximas avaliações entram no histórico, ficam privadas e a API pode ser salva para
              reavaliar sem redigitar.
            </p>
          </AccountTip>
        ) : null
      }
    >
      {apiSaveFailed && hasAccount && !apiSaved ? (
        <Notice tone="warning" title="A avaliação foi criada, mas a API não foi salva.">
          Use "Salvar API" abaixo para tentar de novo.
        </Notice>
      ) : null}
      {error ? (
        <Notice tone="warning" title="Não foi possível atualizar o resultado.">
          {error} Os dados abaixo são da última atualização; a página continua tentando.
        </Notice>
      ) : null}
      <StatusNotice evaluation={evaluation} />
    </ResultView>
  )
}
