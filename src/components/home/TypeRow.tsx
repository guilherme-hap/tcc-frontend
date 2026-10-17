import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { EvaluationType } from '../../types'
import {
  PILLARS_BY_TYPE,
  PILLAR_LABELS,
  TYPE_INPUTS,
  TYPE_SUMMARIES,
  TYPE_TITLES,
} from '../../utils/labels'
import { newEvaluationPath } from '../../utils/routes'
import { Icon } from '../ui/Icon'
import { MetaList } from '../ui/MetaList'
import { TypeStrip } from '../ui/TypeStrip'
import { FOCUS_RING } from '../ui/classes'

interface TypeRowProps {
  type: EvaluationType
}

export function TypeRow({ type }: TypeRowProps) {
  return (
    <li className="border-t border-border">
      <Link
        to={newEvaluationPath(type)}
        className={`group grid grid-cols-[minmax(0,1fr)_1rem] items-start gap-x-6 gap-y-3 px-4 py-4 transition-colors duration-150 hover:bg-surface-raised @3xl:grid-cols-[minmax(0,1fr)_minmax(0,20rem)_auto] ${FOCUS_RING} focus-visible:-outline-offset-2`}
      >
        <span className="flex min-w-0 flex-col gap-2">
          <span className="flex items-center gap-3">
            <span className="font-display text-base font-semibold tracking-[-0.01em] text-ink">
              {TYPE_TITLES[type]}
            </span>
            <TypeStrip type={type} className="w-16" />
          </span>
          <span className="text-sm text-ink-secondary">{TYPE_SUMMARIES[type]}</span>
        </span>
        <MetaList
          className="@max-3xl:col-span-2 @max-3xl:row-start-2"
          items={[
            {
              label: 'Pilares',
              value: PILLARS_BY_TYPE[type].map((pillar) => PILLAR_LABELS[pillar]).join(', '),
            },
            { label: 'Entrada', value: TYPE_INPUTS[type] },
          ]}
        />
        <Icon
          icon={ArrowRight}
          className="mt-0.5 text-ink-muted @max-3xl:col-start-2 @max-3xl:row-start-1 transition-[color,translate] duration-150 group-hover:translate-x-0.5 group-hover:text-ink motion-reduce:transition-none"
        />
      </Link>
    </li>
  )
}
