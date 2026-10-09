import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { Icon } from './Icon'
import { FOCUS_RING } from './classes'

const CONTROL_CLASSES = `min-w-0 rounded-md border border-border-control bg-well px-3 text-sm text-ink transition-colors duration-150 placeholder:text-ink-muted hover:border-ink-muted aria-invalid:border-error aria-invalid:hover:border-error ${FOCUS_RING}`

const MONO_CLASSES = 'font-mono text-[13px]'

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  mono?: boolean
}

export function TextInput({ className = 'w-full', mono = false, ...props }: TextInputProps) {
  return (
    <input
      className={`h-9 ${CONTROL_CLASSES} ${mono ? MONO_CLASSES : ''} ${className}`}
      {...props}
    />
  )
}

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  mono?: boolean
}

export function SelectInput({ className = 'w-full', mono = false, ...props }: SelectInputProps) {
  return (
    <span className={`relative inline-flex min-w-0 ${className}`}>
      <select
        className={`h-9 w-full cursor-pointer appearance-none pr-8 ${CONTROL_CLASSES} ${mono ? MONO_CLASSES : ''} [&>option]:bg-surface [&>option]:text-ink`}
        {...props}
      />
      <Icon
        icon={ChevronDown}
        size={14}
        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-ink-secondary"
      />
    </span>
  )
}

export function TextArea({
  className = 'w-full',
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`min-h-19 resize-y py-2 leading-5 [scrollbar-color:var(--border-hover)_transparent] [scrollbar-width:thin] ${CONTROL_CLASSES} ${MONO_CLASSES} ${className}`}
      {...props}
    />
  )
}

interface FieldMessagesProps {
  id: string
  hint?: string
  error?: string
}

export function FieldMessages({ id, hint, error }: FieldMessagesProps) {
  if (error) {
    return (
      <p id={`${id}-message`} role="alert" className="text-error">
        {error}
      </p>
    )
  }
  if (hint) {
    return (
      <p id={`${id}-message`} className="text-ink-secondary">
        {hint}
      </p>
    )
  }
  return null
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  optional?: boolean
  hint?: string
  error?: string
  suffix?: ReactNode
  mono?: boolean
}

export function TextField({ id, label, optional, hint, error, suffix, ...props }: TextFieldProps) {
  const hasMessage = Boolean(error || hint)

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="font-medium text-ink">
        {label}
        {optional ? <span className="font-normal text-ink-secondary"> (opcional)</span> : null}
      </label>
      <div className="flex items-center gap-2">
        <TextInput
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={hasMessage ? `${id}-message` : undefined}
          {...props}
        />
        {suffix ? <span className="shrink-0 text-ink-secondary">{suffix}</span> : null}
      </div>
      <FieldMessages id={id} hint={hint} error={error} />
    </div>
  )
}

interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className' | 'onChange'> {
  onChange: (checked: boolean) => void
}

export function Checkbox({ onChange, ...props }: CheckboxProps) {
  return (
    <span className="relative mt-0.5 flex size-4 shrink-0">
      <input
        type="checkbox"
        onChange={(event) => onChange(event.target.checked)}
        className={`peer size-4 cursor-pointer appearance-none rounded-sm border border-border-control bg-well transition-colors duration-150 hover:border-ink-muted checked:border-accent-ink checked:bg-accent-fill checked:hover:border-accent-ink aria-invalid:border-error aria-invalid:hover:border-error ${FOCUS_RING}`}
        {...props}
      />
      <Check
        aria-hidden="true"
        size={12}
        strokeWidth={3}
        className="pointer-events-none absolute inset-0.5 hidden text-on-accent peer-checked:block"
      />
    </span>
  )
}

interface CheckboxFieldProps {
  id: string
  label: string
  description?: string
  error?: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function CheckboxField({ id, label, description, error, checked, onChange }: CheckboxFieldProps) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <Checkbox
        id={id}
        checked={checked}
        onChange={onChange}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || description ? `${id}-message` : undefined}
      />
      <div className="flex min-w-0 flex-col gap-1">
        <label htmlFor={id} className="cursor-pointer font-medium text-ink">
          {label}
        </label>
        <FieldMessages id={id} hint={description} error={error} />
      </div>
    </div>
  )
}
