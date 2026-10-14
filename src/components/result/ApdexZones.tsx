import type { IAutocannonResult } from '../../types'
import { formatNumber, formatPercent } from '../../utils/format'

type ZoneKey = 'satisfied' | 'tolerating' | 'frustrated'

interface Zone {
  key: ZoneKey
  label: string
  rule: string
  className: string
}

const APDEX_ZONES: Zone[] = [
  { key: 'satisfied', label: 'Satisfeitas', rule: 't ≤ T', className: 'bg-success' },
  { key: 'tolerating', label: 'Toleradas', rule: 'T < t ≤ 4T', className: 'bg-warning' },
  { key: 'frustrated', label: 'Frustradas', rule: 't > 4T ou falha', className: 'bg-error' },
]

function describeZone(result: IAutocannonResult, zone: Zone): string {
  const share = formatPercent(result.sampleSize === 0 ? 0 : result[zone.key] / result.sampleSize)
  return `${zone.label}: ${formatNumber(result[zone.key])} (${share})`
}

interface ApdexZonesProps {
  result: IAutocannonResult
}

export function ApdexBar({ result }: ApdexZonesProps) {
  const summary = APDEX_ZONES.map((zone) => describeZone(result, zone)).join('; ')

  return (
    <div role="img" aria-label={`Zonas do Apdex. ${summary}`} className="flex h-2.5 gap-0.5">
      {APDEX_ZONES.filter((zone) => result[zone.key] > 0).map((zone) => (
        <div
          key={zone.key}
          title={describeZone(result, zone)}
          className={`min-w-1 rounded-xs ${zone.className}`}
          style={{ flexGrow: result[zone.key], flexBasis: 0 }}
        />
      ))}
    </div>
  )
}

export function ApdexLegend() {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-secondary">
      {APDEX_ZONES.map((zone) => (
        <li key={zone.key} className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className={`size-2 rounded-xs ${zone.className}`} />
          {zone.label}
        </li>
      ))}
    </ul>
  )
}

export function ApdexZones({ result }: ApdexZonesProps) {
  const share = (count: number) =>
    formatPercent(result.sampleSize === 0 ? 0 : count / result.sampleSize)

  return (
    <div className="flex flex-col gap-3">
      <ApdexBar result={result} />
      <ul className="flex flex-wrap gap-x-8 gap-y-2">
        {APDEX_ZONES.map((zone) => (
          <li key={zone.key} className="flex items-start gap-2 text-[13px]">
            <span
              aria-hidden="true"
              className={`mt-1.25 size-2.5 shrink-0 rounded-xs ${zone.className}`}
            />
            <span className="flex flex-col">
              <span className="text-ink">
                {zone.label}{' '}
                <span className="font-mono text-xs tabular-nums">
                  {formatNumber(result[zone.key])}
                </span>{' '}
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
