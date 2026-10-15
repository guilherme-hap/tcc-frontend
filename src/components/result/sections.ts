import type { PillarName } from '../../types'
import { FULL_EXECUTION_GROUPS } from '../../utils/labels'

export type SectionId = 'overview' | PillarName | 'scoring'

const PREFIX = 'resultado'

export function sectionTabId(section: SectionId): string {
  return `${PREFIX}-tab-${section}`
}

export function sectionPanelId(section: SectionId): string {
  return `${PREFIX}-panel-${section}`
}

export function availableSections(hasScoring: boolean): SectionId[] {
  return [
    'overview',
    ...FULL_EXECUTION_GROUPS.flatMap((group) => group.pillars),
    ...(hasScoring ? (['scoring'] as const) : []),
  ]
}

export function parseSection(value: string | null, available: SectionId[]): SectionId {
  return available.find((section) => section === value) ?? 'overview'
}
