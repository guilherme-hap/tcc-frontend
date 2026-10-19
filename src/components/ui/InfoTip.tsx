import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { Info } from 'lucide-react'
import { Icon } from './Icon'
import { FOCUS_RING } from './classes'

const OPEN_DELAY_MS = 150
const CLOSE_DELAY_MS = 120

interface InfoTipProps {
  label: string
  className?: string
  children: ReactNode
}

export function InfoTip({ label, className = '', children }: InfoTipProps) {
  const [open, setOpen] = useState(false)
  const openedByHover = useRef(false)
  const focusInside = useRef(false)
  const openTimer = useRef<number | undefined>(undefined)
  const closeTimer = useRef<number | undefined>(undefined)

  const clearTimers = () => {
    window.clearTimeout(openTimer.current)
    window.clearTimeout(closeTimer.current)
  }

  useEffect(() => clearTimers, [])

  const hover = (event: PointerEvent, next: boolean) => {
    if (event.pointerType !== 'mouse') return
    clearTimers()
    if (next) {
      if (open) return
      openTimer.current = window.setTimeout(() => {
        openedByHover.current = true
        setOpen(true)
      }, OPEN_DELAY_MS)
    } else {
      closeTimer.current = window.setTimeout(() => {
        openedByHover.current = false
        setOpen(false)
      }, CLOSE_DELAY_MS)
    }
  }

  const leaveWithTab = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return
    event.preventDefault()
    setOpen(false)
  }

  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        clearTimers()
        if (!next) openedByHover.current = false
        setOpen(next)
      }}
    >
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label={`Mais informações: ${label}`}
          onPointerEnter={(event) => hover(event, true)}
          onPointerLeave={(event) => hover(event, false)}
          onClick={(event) => {
            if (open && openedByHover.current) {
              openedByHover.current = false
              event.preventDefault()
            }
          }}
          className={`relative inline-grid size-5 shrink-0 cursor-pointer place-items-center rounded-full text-ink-muted transition-colors duration-150 before:absolute before:-inset-2.5 before:content-[''] hover:text-ink aria-expanded:text-ink ${FOCUS_RING} ${className}`}
        >
          <Icon icon={Info} size={14} />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          aria-label={label}
          side="top"
          align="start"
          sideOffset={6}
          collisionPadding={12}
          onOpenAutoFocus={(event) => {
            if (openedByHover.current) event.preventDefault()
          }}
          onCloseAutoFocus={(event) => {
            if (!focusInside.current) event.preventDefault()
            focusInside.current = false
          }}
          onFocus={() => {
            focusInside.current = true
          }}
          onBlur={() => {
            focusInside.current = false
          }}
          onKeyDown={leaveWithTab}
          onPointerEnter={(event) => hover(event, true)}
          onPointerLeave={(event) => hover(event, false)}
          className="z-50 max-w-[min(22rem,calc(100vw-1.5rem))] rounded-md border border-border-hover bg-surface-raised px-3 py-2.5 text-sm leading-5 text-ink-secondary shadow-overlay focus-visible:outline-none"
        >
          {children}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
