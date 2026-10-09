interface CodeBlockProps {
  code: string
  title?: string
}

export function CodeBlock({ code, title }: CodeBlockProps) {
  const lines = code.replace(/\n$/, '').split('\n')

  return (
    <figure className="overflow-hidden rounded-md border border-border bg-well">
      {title ? (
        <figcaption className="border-b border-border px-3 py-2 font-mono text-xs font-medium wrap-anywhere text-ink-secondary">
          {title}
        </figcaption>
      ) : null}
      <pre
        tabIndex={0}
        className="max-h-66 overflow-auto py-2 font-mono text-xs leading-5 [scrollbar-color:var(--border-hover)_transparent] [scrollbar-width:thin] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus"
      >
        {lines.map((line, index) => (
          <span key={index} className="flex min-w-max pr-3">
            <span
              aria-hidden="true"
              className="w-11 shrink-0 pr-3 text-right text-ink-muted select-none"
            >
              {index + 1}
            </span>
            <span className="whitespace-pre text-ink">{line || ' '}</span>
          </span>
        ))}
      </pre>
    </figure>
  )
}
