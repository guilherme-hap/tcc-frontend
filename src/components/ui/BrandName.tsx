import { APP_NAME_PARTS } from '../../utils/brand'

export function BrandName() {
  const [spec, ping] = APP_NAME_PARTS

  return (
    <span>
      {spec}
      <span className="text-accent-ink">{ping}</span>
    </span>
  )
}
