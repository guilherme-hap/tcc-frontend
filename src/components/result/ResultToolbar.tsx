import { useState, type ReactNode } from 'react'
import { Bookmark, Check, Download } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { EvaluationRecord } from '../../types'
import { downloadJson } from '../../utils/download'
import { SAVED_APIS_PATH } from '../../utils/routes'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { FOCUS_RING } from '../ui/classes'
import { SaveApiPanel } from './SaveApiPanel'

interface ResultToolbarProps {
  evaluation: EvaluationRecord
  isActive: boolean
  hasAccount: boolean
  apiSaved: boolean
  children: ReactNode
}

export function ResultToolbar({
  evaluation,
  isActive,
  hasAccount,
  apiSaved,
  children,
}: ResultToolbarProps) {
  const [naming, setNaming] = useState(false)
  const showsPanel = hasAccount && naming && !apiSaved

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
            <Button
              icon={Download}
              className="max-lg:h-11"
              onClick={() => downloadJson(`avaliacao-${evaluation.id}.json`, evaluation)}
            >
              Exportar JSON
            </Button>
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
