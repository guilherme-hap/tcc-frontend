import { BRAND_MARK_DOT, BRAND_MARK_VIEW_BOX } from '../../utils/brand'

const RADII = [64, 128, 208, 304, 416, 544, 688, 848, 1024, 1216, 1440]
const STROKE_WIDTH = 1.5
const HALF_EXTENT = RADII[RADII.length - 1] + STROKE_WIDTH

const LEFT = ((BRAND_MARK_DOT.x - BRAND_MARK_VIEW_BOX.x) / BRAND_MARK_VIEW_BOX.width) * 100
const TOP = ((BRAND_MARK_DOT.y - BRAND_MARK_VIEW_BOX.y) / BRAND_MARK_VIEW_BOX.height) * 100

export function PingRings() {
  return (
    <svg
      aria-hidden="true"
      viewBox={`${-HALF_EXTENT} ${-HALF_EXTENT} ${HALF_EXTENT * 2} ${HALF_EXTENT * 2}`}
      className="pointer-events-none absolute -z-10 -translate-x-1/2 -translate-y-1/2"
      style={{
        left: `${LEFT}%`,
        top: `${TOP}%`,
        width: HALF_EXTENT * 2,
        height: HALF_EXTENT * 2,
      }}
    >
      {RADII.map((radius) => (
        <circle
          key={radius}
          r={radius}
          fill="none"
          strokeWidth={STROKE_WIDTH}
          className="stroke-border"
        />
      ))}
    </svg>
  )
}
