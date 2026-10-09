import type { IAutocannonResult } from '../../types'
import { formatNumber, formatPercent } from '../../utils/format'

type ZoneKey = 'satisfied' | 'tolerating' | 'frustrated'

interface Zone {
  key: ZoneKey
  label: string
  rule: string
  className: string
}

const ZONES: Zone[] = [
  { key: 'satisfied', label: 'Satisfeitas', rule: 't ≤ T', className: 'bg-success' },
  { key: 'tolerating', label: 'Toleradas', rule: 'T < t ≤ 4T', className: 'bg-warning' },
  { key: 'frustrated', label: 'Frustradas', rule: 't > 4T ou falha', className: 'bg-error' },
]

interface ApdexZonesProps {
  result: IAutocannonResult
}

export function ApdexZones({ result }: ApdexZonesProps) {
  const { sampleSize } = result
  const share = (count: number) => formatPercent(sampleSize === 0 ? 0 : count / sampleSize)
  const summary = ZONES.map(
    (zone) => `${zone.label}: ${formatNumber(result[zone.key])} (${share(result[zone.key])})`,
  ).join('; ')

  return (
    <div className="flex flex-col gap-3">
      <div role="img" aria-label={`Zonas do Apdex. ${summary}`} className="flex h-2.5 gap-0.5">
        {ZONES.filter((zone) => result[zone.key] > 0).map((zone) => (
          <div
            key={zone.key}
            title={`${zone.label}: ${formatNumber(result[zone.key])} (${share(result[zone.key])})`}
            className={`min-w-1 rounded-xs ${zone.className}`}
            style={{ flexGrow: result[zone.key], flexBasis: 0 }}
          />
        ))}
      </div>
      <ul className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-x-5 gap-y-2">
        {ZONES.map((zone) => (
          <li key={zone.key} className="flex items-start gap-2 text-[13px]">
            <span
              aria-hidden="true"
              className={`mt-1.25 size-2.5 shrink-0 rounded-xs ${zone.className}`}
            />
            <span className="flex flex-col">
              <span className="text-ink">
                {zone.label}{' '}
                <span className="font-mono tabular-nums">{formatNumber(result[zone.key])}</span>{' '}
                <span className="text-ink-secondary">({share(result[zone.key])})</span>
              </span>
              <span className="font-mono text-xs text-ink-secondary">{zone.rule}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
