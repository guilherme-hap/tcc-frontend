import { NEW_EVALUATION_PATH, RESTORE_DRAFT_STATE } from '../../utils/routes'
import { Button } from '../ui/Button'
import { LinkButton } from '../ui/LinkButton'

interface AuthActionsProps {
  submitLabel: string
  loading: boolean
}

export function AuthActions({ submitLabel, loading }: AuthActionsProps) {
  return (
    <div className="flex flex-col gap-4">
      <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
        {submitLabel}
      </Button>
      <div aria-hidden="true" className="flex items-center gap-3 text-[13px] text-ink-muted">
        <span className="h-px flex-1 bg-border" />
        ou
        <span className="h-px flex-1 bg-border" />
      </div>
      <LinkButton to={NEW_EVALUATION_PATH} state={RESTORE_DRAFT_STATE} size="lg" className="w-full">
        Avaliar sem conta
      </LinkButton>
    </div>
  )
}
