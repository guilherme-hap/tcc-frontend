import type { ReactNode } from 'react'
import { CircleX, Info, LoaderCircle, TriangleAlert, type LucideIcon } from 'lucide-react'
import { Icon } from './Icon'
import { GLASS } from './classes'

type NoticeTone = 'info' | 'warning' | 'error'

interface NoticeProps {
  tone?: NoticeTone
  title: string
  busy?: boolean
  children?: ReactNode
}

const BORDER_CLASSES: Record<NoticeTone, string> = {
  info: 'border-border',
  warning: 'border-warning/40',
  error: 'border-error/40',
}

const ICON_CLASSES: Record<NoticeTone, string> = {
  info: 'text-ink-secondary',
  warning: 'text-warning',
  error: 'text-error',
}

const TITLE_CLASSES: Record<NoticeTone, string> = {
  info: 'text-ink',
  warning: 'text-warning',
  error: 'text-error',
}

const TONE_ICONS: Record<NoticeTone, LucideIcon> = {
  info: Info,
  warning: TriangleAlert,
  error: CircleX,
}

export function Notice({ tone = 'info', title, busy = false, children }: NoticeProps) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex gap-3 px-4 py-3 ${GLASS} ${BORDER_CLASSES[tone]}`}
    >
      <span className={`flex h-5 items-center ${ICON_CLASSES[tone]}`}>
        <Icon
          icon={busy ? LoaderCircle : TONE_ICONS[tone]}
          className={busy ? 'animate-spin motion-reduce:animate-none' : ''}
        />
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        <p className={`font-medium ${TITLE_CLASSES[tone]}`}>{title}</p>
        {children ? <div className="text-ink-secondary">{children}</div> : null}
      </div>
    </div>
  )
}
