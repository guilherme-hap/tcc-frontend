import { useState, type ReactNode } from 'react'
import { LayoutDashboard } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { ContractSection } from '../components/result/ContractSection'
import { PerformanceSection } from '../components/result/PerformanceSection'
import { PillarPlaceholder } from '../components/result/PillarPlaceholder'
import { ResultHeader } from '../components/result/ResultHeader'
import { ResultStats } from '../components/result/ResultStats'
import { ScoreSummary } from '../components/result/ScoreSummary'
import { ScoringParameters } from '../components/result/ScoringParameters'
import { SecuritySection } from '../components/result/SecuritySection'
import { StatusNotice } from '../components/result/StatusNotice'
import { Notice } from '../components/ui/Notice'
import { Tabs, type TabItem } from '../components/ui/Tabs'
import { FOCUS_RING, GLASS } from '../components/ui/classes'
import { useEvaluationPolling } from '../hooks'
import type { EvaluationRecord, PillarName } from '../types'
import { PILLAR_ICONS } from '../utils/icons'
import { PILLARS_BY_TYPE, PILLAR_LABELS } from '../utils/labels'
import { NEW_EVALUATION_PATH } from '../utils/routes'

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
    return <PerformanceSection results={evaluation.performanceResults} score={score} />
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
      <div
        role="tabpanel"
        id={`${TABS_ID}-panel-${tab}`}
        aria-labelledby={`${TABS_ID}-tab-${tab}`}
        className="flex flex-col gap-6"
      >
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
      </div>
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
  const { evaluation, isLoading, isPolling, error } = useEvaluationPolling(id)

  if (isLoading) return <ResultSkeleton />

  if (error || !evaluation) {
    return (
      <>
        <Notice tone="error" title="Não foi possível carregar a avaliação.">
          {error ?? 'Avaliação não encontrada.'}
        </Notice>
        <div>
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
      <ResultHeader evaluation={evaluation} isActive={isPolling} />
      <StatusNotice evaluation={evaluation} />
      {evaluation.evaluationType === 'full' ? (
        <FullResult evaluation={evaluation} isActive={isPolling} />
      ) : (
        <SinglePillarResult evaluation={evaluation} isActive={isPolling} />
      )}
    </>
  )
}
