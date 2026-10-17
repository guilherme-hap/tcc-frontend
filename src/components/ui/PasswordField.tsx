import { useState, type InputHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { FieldMessages, TextInput } from './Field'
import { Icon } from './Icon'
import { FOCUS_RING } from './classes'

interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  id: string
  label: string
  subject?: string
  hint?: string
  error?: string
}

export function PasswordField({
  id,
  label,
  subject = 'senha',
  hint,
  error,
  ...props
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)
  const hasMessage = Boolean(error || hint)

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        <TextInput
          id={id}
          type={visible ? 'text' : 'password'}
          tall
          aria-invalid={error ? true : undefined}
          aria-describedby={hasMessage ? `${id}-message` : undefined}
          className="w-full pr-12"
          {...props}
        />
        <button
          type="button"
          aria-label={`${visible ? 'Ocultar' : 'Mostrar'} ${subject}`}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
          className={`absolute top-1 right-1 inline-flex size-8 max-lg:top-0 max-lg:right-0 max-lg:size-11 cursor-pointer items-center justify-center rounded-sm text-ink-secondary transition-colors duration-150 hover:text-ink ${FOCUS_RING}`}
        >
          <Icon icon={visible ? EyeOff : Eye} />
        </button>
      </div>
      <FieldMessages id={id} hint={hint} error={error} />
    </div>
  )
}
