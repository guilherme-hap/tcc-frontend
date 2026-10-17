const TAIL_LENGTH = 22

interface MiddleTruncateProps {
  text: string
  className?: string
}

export function MiddleTruncate({ text, className = '' }: MiddleTruncateProps) {
  const split = Math.max(0, text.length - TAIL_LENGTH)

  return (
    <span title={text} className={`flex min-w-0 ${className}`}>
      <span className="min-w-0 truncate">{text.slice(0, split)}</span>
      <span className="shrink-0">{text.slice(split)}</span>
    </span>
  )
}
