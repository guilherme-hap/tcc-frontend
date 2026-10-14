import type { PillarName } from '../../types'

export type SectionId = 'overview' | PillarName | 'scoring'

const PREFIX = 'resultado'

export function sectionTabId(section: SectionId): string {
  return `${PREFIX}-tab-${section}`
}

export function sectionPanelId(section: SectionId): string {
  return `${PREFIX}-panel-${section}`
}
