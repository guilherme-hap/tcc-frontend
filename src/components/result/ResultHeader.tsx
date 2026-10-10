import { useState } from 'react'
import { ArrowLeft, Bookmark, Check, Download, Link2, Lock, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { EvaluationRecord, EvaluationVisibility } from '../../types'
import { downloadJson } from '../../utils/download'
import { formatDateTime } from '../../utils/format'
import { TYPE_TITLES, VISIBILITY_LABELS } from '../../utils/labels'
import { HISTORY_PATH, SAVED_APIS_PATH } from '../../utils/routes'
import { Badge, type BadgeTone } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { StatusBadge } from '../ui/StatusBadge'
import { TextLink } from '../ui/TextLink'
import { FOCUS_RING } from '../ui/classes'
import { SaveApiPanel } from './SaveApiPanel'

const VISIBILITY_TONES: Record<EvaluationVisibility, BadgeTone> = {
  private: 'accent',
  anonymous: 'neutral',
}

const VISIBILITY_ICONS: Record<EvaluationVisibility, LucideIcon> = {
  private: Lock,
  anonymous: Link2,
}

type SaveStep = 'idle' | 'naming' | 'saved'

interface ResultHeaderProps {
  evaluation: EvaluationRecord
  isActive: boolean
  hasAccount: boolean
}

export function ResultHeader({ evaluation, isActive, hasAccount }: ResultHeaderProps) {
  const [saveStep, setSaveStep] = useState<SaveStep>('idle')
  const { visibility } = evaluation

  return (
    <div className="flex flex-col gap-3">
      {hasAccount ? (
        <TextLink to={HISTORY_PATH} tone="muted" leadingIcon={ArrowLeft} className="self-start">
          Histórico
        </TextLink>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl leading-8 font-semibold tracking-[-0.01em] text-ink">
          {TYPE_TITLES[evaluation.evaluationType]}
        </h1>
        <StatusBadge status={evaluation.status} />
        <Badge tone={VISIBILITY_TONES[visibility]} icon={VISIBILITY_ICONS[visibility]}>
          {VISIBILITY_LABELS[visibility]}
        </Badge>
        <div className="ml-auto flex flex-wrap gap-2">
          {!hasAccount || saveStep === 'naming' ? null : saveStep === 'saved' ? (
            <Link
              to={SAVED_APIS_PATH}
              className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium text-success underline-offset-4 hover:underline ${FOCUS_RING}`}
            >
              <Icon icon={Check} />
              API salva
            </Link>
          ) : (
            <Button icon={Bookmark} onClick={() => setSaveStep('naming')}>
              Salvar API
            </Button>
          )}
          {isActive ? null : (
            <Button
              icon={Download}
              onClick={() => downloadJson(`avaliacao-${evaluation.id}.json`, evaluation)}
            >
              Exportar JSON
            </Button>
          )}
        </div>
      </div>
      {hasAccount && saveStep === 'naming' ? (
        <SaveApiPanel
          evaluation={evaluation}
          onSaved={() => setSaveStep('saved')}
          onCancel={() => setSaveStep('idle')}
        />
      ) : null}
      <dl className="grid grid-cols-1 gap-x-6 gap-y-1 text-[13px] sm:grid-cols-[auto_1fr] sm:gap-y-1.5">
        <dt className="text-ink-secondary">Especificação</dt>
        <dd className="font-mono break-all text-ink max-sm:mb-1.5">{evaluation.openApiUrl}</dd>
        {evaluation.apiBaseUrl ? (
          <>
            <dt className="text-ink-secondary">URL base</dt>
            <dd className="font-mono break-all text-ink max-sm:mb-1.5">{evaluation.apiBaseUrl}</dd>
          </>
        ) : null}
        <dt className="text-ink-secondary">Criada em</dt>
        <dd className="font-mono text-ink tabular-nums">{formatDateTime(evaluation.createdAt)}</dd>
      </dl>
    </div>
  )
}
