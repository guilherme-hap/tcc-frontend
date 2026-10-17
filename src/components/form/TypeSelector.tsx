import type { EvaluationType } from '../../types'
import { TYPE_DESCRIPTIONS, TYPE_LABELS, TYPE_ORDER } from '../../utils/labels'
import { TypeStrip } from '../ui/TypeStrip'
import { OVERLINE } from '../ui/classes'

interface TypeSelectorProps {
  value: EvaluationType
  onChange: (type: EvaluationType) => void
}

export function TypeSelector({ value, onChange }: TypeSelectorProps) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-2.5">
      <legend className={`mb-2.5 ${OVERLINE}`}>Tipo de avaliação</legend>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {TYPE_ORDER.map((type) => (
          <label
            key={type}
            className="group flex min-h-11 cursor-pointer flex-col gap-2 rounded-md border border-border bg-surface px-3 py-2.5 transition-colors duration-150 hover:border-border-hover has-checked:border-accent-ink/55 has-checked:bg-accent-dim has-checked:hover:border-accent-ink/55 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus"
          >
            <input
              type="radio"
              name="evaluationType"
              value={type}
              checked={value === type}
              onChange={() => onChange(type)}
              className="sr-only"
            />
            <TypeStrip type={type} />
            <span className="flex items-center gap-2">
              <span className="flex-1 font-medium text-ink">{TYPE_LABELS[type]}</span>
              <span
                aria-hidden="true"
                className="relative size-4 shrink-0 rounded-full border border-border-control bg-well after:absolute after:inset-[3px] after:rounded-full after:bg-accent-ink after:opacity-0 after:transition-opacity after:duration-150 group-has-checked:border-accent-ink group-has-checked:after:opacity-100"
              />
            </span>
          </label>
        ))}
      </div>
      <p aria-live="polite" className="text-sm text-ink-secondary">
        {TYPE_DESCRIPTIONS[value]}
      </p>
    </fieldset>
  )
}
