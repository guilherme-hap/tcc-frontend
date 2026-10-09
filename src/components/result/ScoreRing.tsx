import type { CSSProperties } from 'react'
import { formatNumber } from '../../utils/format'

const RING_MASK =
  'radial-gradient(farthest-side, transparent calc(100% - var(--ring-stroke) - 0.5px), black calc(100% - var(--ring-stroke)))'

const ARC_STYLE: CSSProperties = {
  mask: RING_MASK,
  WebkitMask: RING_MASK,
  background:
    'conic-gradient(var(--accent) 0turn, var(--accent-ink) calc(var(--ring-value) * 1turn), transparent 0)',
}

const CAP_STYLE: CSSProperties = {
  left: 'calc(50% - var(--ring-stroke) / 2)',
  width: 'var(--ring-stroke)',
  height: 'var(--ring-stroke)',
}

interface ScoreRingProps {
  score: number | null
  label: string
  size?: number
  loading?: boolean
}

export function ScoreRing({ score, label, size = 176, loading = false }: ScoreRingProps) {
  const stroke = Math.max(6, Math.round(size / 18))
  const clamped = score === null ? 0 : Math.min(100, Math.max(0, score))
  const value = loading ? 0.25 : clamped / 100
  const style = {
    width: size,
    height: size,
    '--ring-value': value,
    '--ring-stroke': `${stroke}px`,
  } as CSSProperties
  const valueText = loading
    ? 'Calculando'
    : score === null
      ? 'Não calculada'
      : `${formatNumber(clamped)} de 100`

  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={score === null || loading ? undefined : clamped}
      aria-valuetext={valueText}
      style={style}
      className="relative shrink-0 transition-[--ring-value] duration-600 ease-out motion-reduce:transition-none"
    >
      <span
        aria-hidden="true"
        style={{ mask: RING_MASK, WebkitMask: RING_MASK }}
        className="absolute inset-0 rounded-full bg-glass-raised"
      />
      {value > 0 ? (
        <span
          aria-hidden="true"
          className={`absolute inset-0 rounded-full drop-shadow-[0_0_16px_var(--glow-violet)] ${loading ? 'animate-spin motion-reduce:animate-none' : ''}`}
        >
          <span style={ARC_STYLE} className="absolute inset-0 rounded-full" />
          <span className="absolute inset-0">
            <span style={CAP_STYLE} className="absolute top-0 rounded-full bg-accent" />
          </span>
          <span
            style={{ transform: 'rotate(calc(var(--ring-value) * 1turn))' }}
            className="absolute inset-0"
          >
            <span
              style={CAP_STYLE}
              className="absolute top-0 rounded-full bg-accent-ink shadow-[0_0_12px_0_var(--accent)]"
            />
          </span>
        </span>
      ) : null}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        {loading || score === null ? (
          <span className="text-[13px] font-medium text-ink-secondary">{valueText}</span>
        ) : (
          <>
            <span
              style={{ fontSize: Math.round(size * 0.25) }}
              className="font-display leading-none font-semibold tracking-[-0.03em] text-ink tabular-nums"
            >
              {formatNumber(clamped)}
            </span>
            <span className="text-[13px] text-ink-secondary">de 100</span>
          </>
        )}
      </div>
    </div>
  )
}
