import type { IAuditMessage } from '../../types'
import { SeverityBadge } from '../ui/SeverityBadge'

interface AuditMessageListProps {
  messages: IAuditMessage[]
}

export function AuditMessageList({ messages }: AuditMessageListProps) {
  if (messages.length === 0) return null

  return (
    <ul className="grid grid-cols-1 gap-3 border-t border-border pt-4 sm:grid-cols-[auto_minmax(0,1fr)]">
      {messages.map((message) => (
        <li
          key={message.code}
          className="flex flex-col gap-1.5 text-[13px] sm:col-span-2 sm:grid sm:grid-cols-subgrid sm:gap-x-3"
        >
          <div>
            <SeverityBadge severity={message.severity} />
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-ink">{message.message}</p>
            {message.recommendation ? (
              <p className="text-ink-secondary">{message.recommendation}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  )
}
