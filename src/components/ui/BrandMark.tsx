import { BRAND_MARK_DOT, BRAND_MARK_VIEW_BOX } from '../../utils/brand'

interface BrandMarkProps {
  className?: string
}

const { x, y, width, height } = BRAND_MARK_VIEW_BOX

export function BrandMark({ className = 'h-5' }: BrandMarkProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox={`${x} ${y} ${width} ${height}`}
      className={`${className} w-auto shrink-0`}
    >
      <path
        className="fill-pillar-contract"
        d="M41.899 11.101A14 14 0 1 0 32 35L32 27A6 6 0 1 1 36.243 16.757Z"
      />
      <path
        className="fill-pillar-performance"
        d="M32 27A14 14 0 1 1 22.101 50.899L27.757 45.243A6 6 0 1 0 32 35Z"
      />
      <circle
        className="fill-pillar-security"
        cx={BRAND_MARK_DOT.x}
        cy={BRAND_MARK_DOT.y}
        r={BRAND_MARK_DOT.r}
      />
    </svg>
  )
}
