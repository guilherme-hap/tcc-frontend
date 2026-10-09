import type { EvaluationType } from '../../types'
import { TYPE_ICONS } from '../../utils/icons'
import { TYPE_DESCRIPTIONS, TYPE_LABELS, TYPE_ORDER } from '../../utils/labels'
import { Icon } from '../ui/Icon'
import { GLASS } from '../ui/classes'

interface TypeSelectorProps {
  value: EvaluationType
  onChange: (type: EvaluationType) => void
}

export function TypeSelector({ value, onChange }: TypeSelectorProps) {
  return (
    <fieldset className="min-w-0">
      <legend className="sr-only">Tipo de avaliação</legend>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(168px,1fr))] gap-3">
        {TYPE_ORDER.map((type) => (
          <label
            key={type}
            className={`group flex cursor-pointer flex-col gap-1.5 border-border px-4 py-3 hover:border-border-hover has-checked:border-accent-ink/55 has-checked:bg-accent-dim has-checked:hover:border-accent-ink/55 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus ${GLASS}`}
          >
            <input
              type="radio"
              name="evaluationType"
              value={type}
              checked={value === type}
              onChange={() => onChange(type)}
              className="sr-only"
            />
            <span className="flex items-center gap-2">
              <Icon
                icon={TYPE_ICONS[type]}
                className="text-ink-secondary transition-colors duration-150 group-has-checked:text-accent-ink"
              />
              <span className="flex-1 font-medium text-ink">{TYPE_LABELS[type]}</span>
              <span
                aria-hidden="true"
                className="relative size-4 shrink-0 rounded-full border border-border-control bg-well after:absolute after:inset-[3px] after:rounded-full after:bg-accent-ink after:opacity-0 after:transition-opacity after:duration-150 group-has-checked:border-accent-ink group-has-checked:after:opacity-100"
              />
            </span>
            <span className="text-[13px] text-ink-secondary">{TYPE_DESCRIPTIONS[type]}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
