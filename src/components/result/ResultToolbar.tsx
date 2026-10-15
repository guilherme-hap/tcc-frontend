import { useState, type ReactNode } from 'react'
import { Bookmark, Check, Download, RotateCw } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import type { EvaluationRecord, SavedApi } from '../../types'
import { downloadJson } from '../../utils/download'
import { REEVALUATE_STATE, SAVED_APIS_PATH, newEvaluationPath } from '../../utils/routes'
import { buildReevaluationForm } from '../form/accountState'
import { saveFormDraft } from '../form/formDraft'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { FOCUS_RING } from '../ui/classes'
import { SaveApiPanel } from './SaveApiPanel'

interface ResultToolbarProps {
  evaluation: EvaluationRecord
  isActive: boolean
  hasAccount: boolean
  savedApi: SavedApi | null
  children: ReactNode
}

export function ResultToolbar({
  evaluation,
  isActive,
  hasAccount,
  savedApi,
  children,
}: ResultToolbarProps) {
  const navigate = useNavigate()
  const [naming, setNaming] = useState(false)
  const apiSaved = savedApi !== null
  const showsPanel = hasAccount && naming && !apiSaved

  const reevaluate = () => {
    saveFormDraft(buildReevaluationForm(evaluation, savedApi))
    navigate(newEvaluationPath(evaluation.evaluationType), { state: REEVALUATE_STATE })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="flex min-w-0 flex-col gap-1">{children}</div>
        <div className="flex flex-wrap gap-2">
          {!hasAccount || showsPanel ? null : apiSaved ? (
            <Link
              to={SAVED_APIS_PATH}
              className={`inline-flex h-9 items-center max-lg:h-11 gap-2 rounded-md px-3 text-[13px] font-semibold text-success underline-offset-4 hover:underline ${FOCUS_RING}`}
            >
              <Icon icon={Check} />
              API salva
            </Link>
          ) : (
            <Button icon={Bookmark} className="max-lg:h-11" onClick={() => setNaming(true)}>
              Salvar API
            </Button>
          )}
          {isActive ? null : (
            <>
              <Button icon={RotateCw} className="max-lg:h-11" onClick={reevaluate}>
                Reavaliar
              </Button>
              <Button
                icon={Download}
                className="max-lg:h-11"
                onClick={() => downloadJson(`avaliacao-${evaluation.id}.json`, evaluation)}
              >
                Exportar JSON
              </Button>
            </>
          )}
        </div>
      </div>
      {showsPanel ? (
        <SaveApiPanel
          evaluation={evaluation}
          onSaved={() => setNaming(false)}
          onCancel={() => setNaming(false)}
        />
      ) : null}
    </div>
  )
}
