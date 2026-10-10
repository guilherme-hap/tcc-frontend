import type { CSSProperties } from 'react'
import { formatNumber } from '../../utils/format'
import type { ScorePart } from '../../utils/scoreParts'

const GAP = 6
const LABEL_OFFSET = 14
const LABEL_GUTTER_X = 80
const LABEL_GUTTER_Y = 24
const LABEL_SIDE_THRESHOLD = 0.3
const STAGGER_MS = 90

interface Segment {
  part: ScorePart
  rotation: number
  hitRotation: number
  hitLength: number
  trackLength: number
  fillLength: number
  labelX: number
  labelY: number
  labelAnchor: 'start' | 'middle' | 'end'
}

interface Geometry {
  cx: number
  cy: number
  radius: number
  stroke: number
  circumference: number
}

function buildSegments(parts: ScorePart[], geometry: Geometry): Segment[] {
  const { cx, cy, radius, stroke, circumference } = geometry
  const totalWeight = parts.reduce((sum, part) => sum + part.weight, 0)
  const labelRadius = radius + stroke / 2 + LABEL_OFFSET
  let offset = 0

  return parts.map((part) => {
    const share = part.weight / totalWeight
    const span = share * circumference
    const trackLength = Math.max(0, span - GAP - stroke)
    const start = offset * circumference + (GAP + stroke) / 2
    const middle = ((offset + share / 2) * 360 - 90) * (Math.PI / 180)
    const cos = Math.cos(middle)
    const sin = Math.sin(middle)
    const centered = Math.abs(cos) <= LABEL_SIDE_THRESHOLD
    const segment: Segment = {
      part,
      rotation: (start / circumference) * 360 - 90,
      hitRotation: offset * 360 - 90,
      hitLength: span,
      trackLength,
      fillLength: trackLength * Math.min(1, Math.max(0, part.score / 100)),
      labelX: cx + labelRadius * cos,
      labelY: cy + labelRadius * sin + (centered ? Math.sign(sin) * 6 : 0),
      labelAnchor: centered ? 'middle' : cos > 0 ? 'start' : 'end',
    }
    offset += share
    return segment
  })
}

interface SegmentedScoreRingProps {
  label: string
  score: number
  parts: ScorePart[]
  activeId: string | null
  onActiveChange: (id: string | null) => void
  size?: number
  showLabels?: boolean
}

export function SegmentedScoreRing({
  label,
  score,
  parts,
  activeId,
  onActiveChange,
  size = 176,
  showLabels = false,
}: SegmentedScoreRingProps) {
  const stroke = Math.max(6, Math.round(size / 18))
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const width = size + (showLabels ? LABEL_GUTTER_X * 2 : 0)
  const height = size + (showLabels ? LABEL_GUTTER_Y * 2 : 0)
  const cx = width / 2
  const cy = height / 2
  const segments = buildSegments(parts, { cx, cy, radius, stroke, circumference })
  const active = parts.find((part) => part.id === activeId)
  const description = parts
    .map(
      (part) =>
        `${part.label}: ${formatNumber(part.points)} de ${formatNumber(part.maxPoints)} pontos`,
    )
    .join('; ')

  return (
    <div className="relative max-w-full shrink-0" style={{ width }}>
      <svg
        role="img"
        aria-label={`${label}: ${formatNumber(score)} de 100. ${description}.`}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="block h-auto max-w-full overflow-visible"
      >
        {segments.map((segment, index) => {
          const { part } = segment
          const rotate = `rotate(${segment.rotation} ${cx} ${cy})`
          const delay = `${index * STAGGER_MS}ms`
          const fillStyle = {
            '--dash': `${segment.fillLength} ${circumference}`,
            transitionDelay: delay,
          } as CSSProperties
          const tipStyle = {
            '--tip': `${segment.rotation + (segment.fillLength / circumference) * 360}deg`,
            '--tip-from': `${segment.rotation}deg`,
            transformOrigin: `${cx}px ${cy}px`,
            transitionDelay: delay,
          } as CSSProperties

          return (
            <g
              key={part.id}
              className={`transition-opacity duration-150 ${active && active.id !== part.id ? 'opacity-30' : ''}`}
            >
              <circle
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={`${segment.trackLength} ${circumference}`}
                transform={rotate}
                className="stroke-border-hover"
              />
              {segment.fillLength > 0 ? (
                <>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={radius}
                    fill="none"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    transform={rotate}
                    style={fillStyle}
                    className="stroke-accent transition-[stroke-dasharray] duration-700 ease-out [stroke-dasharray:var(--dash)] motion-reduce:transition-none starting:[stroke-dasharray:0_9999]"
                  />
                  <g
                    style={tipStyle}
                    className="[transform:rotate(var(--tip))] transition-transform duration-700 ease-out motion-reduce:transition-none starting:[transform:rotate(var(--tip-from))]"
                  >
                    <circle
                      cx={cx + radius}
                      cy={cy}
                      r={stroke / 2}
                      className="fill-accent-ink drop-shadow-[0_0_6px_var(--accent)]"
                    />
                  </g>
                </>
              ) : null}
              {showLabels ? (
                <text
                  x={segment.labelX}
                  y={segment.labelY}
                  textAnchor={segment.labelAnchor}
                  dominantBaseline="central"
                  className={`text-xs font-medium transition-[fill] duration-150 ${active?.id === part.id ? 'fill-ink' : 'fill-ink-secondary'}`}
                >
                  {part.ringLabel ?? part.label}
                </text>
              ) : null}
              <circle
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke="transparent"
                strokeWidth={stroke * 3}
                strokeDasharray={`${segment.hitLength} ${circumference}`}
                transform={`rotate(${segment.hitRotation} ${cx} ${cy})`}
                pointerEvents="stroke"
                onMouseEnter={() => onActiveChange(part.id)}
                onMouseLeave={() => onActiveChange(null)}
              />
            </g>
          )
        })}
      </svg>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 text-center"
      >
        {active ? (
          <>
            <span
              style={{ maxWidth: size - stroke * 4 }}
              className="text-xs font-medium text-accent-ink"
            >
              {active.ringLabel ?? active.label}
            </span>
            <span
              style={{ fontSize: Math.round(size * 0.2) }}
              className="font-display leading-none font-semibold tracking-[-0.03em] text-ink tabular-nums"
            >
              {formatNumber(active.points)}
            </span>
            <span className="text-[13px] text-ink-secondary">
              de {formatNumber(active.maxPoints)} pontos
            </span>
          </>
        ) : (
          <>
            <span
              style={{ fontSize: Math.round(size * 0.25) }}
              className="font-display leading-none font-semibold tracking-[-0.03em] text-ink tabular-nums"
            >
              {formatNumber(score)}
            </span>
            <span className="text-[13px] text-ink-secondary">de 100</span>
          </>
        )}
      </div>
    </div>
  )
}
