import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Navigate, useLocation } from 'react-router-dom'
import { AuthActions } from '../components/account/AuthActions'
import { AuthLayout } from '../components/layout/AuthLayout'
import { TextField } from '../components/ui/Field'
import { Notice } from '../components/ui/Notice'
import { PasswordField } from '../components/ui/PasswordField'
import { TextLink } from '../components/ui/TextLink'
import { useDocumentTitle, useFocusFirstInvalid, useSession } from '../hooks'
import { ApiError, login, startSession } from '../services'
import {
  HOME_PATH,
  REGISTER_PATH,
  RESTORE_DRAFT_STATE,
  type AuthRedirectState,
} from '../utils/routes'
import { issuesByField } from '../utils/validation'

const INVALID_CREDENTIALS_CODE = 'AUTH_INVALID_CREDENTIALS'
const FIELDS = ['email', 'password'] as const

type LoginErrors = Partial<Record<(typeof FIELDS)[number], string>>

export function LoginPage() {
  useDocumentTitle('Entrar')
  const { user, expired } = useSession()
  const location = useLocation()
  const redirect = location.state as AuthRedirectState | null
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<LoginErrors>({})
  const { ref: formRef, focusFirstInvalid } = useFocusFirstInvalid<HTMLFormElement>()

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: startSession,
    onError: (error) => {
      if (!(error instanceof ApiError)) return

      setErrors(issuesByField(error.issues, FIELDS))
      focusFirstInvalid()
    },
  })

  if (user) {
    return <Navigate to={redirect?.from ?? HOME_PATH} replace state={RESTORE_DRAFT_STATE} />
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (mutation.isPending) return

    mutation.reset()
    const next: LoginErrors = {}
    if (!email.trim()) next.email = 'Informe o e-mail'
    if (!password) next.password = 'Informe a senha'
    setErrors(next)
    focusFirstInvalid()

    if (Object.keys(next).length === 0) mutation.mutate({ email: email.trim(), password })
  }

  const failure = mutation.error
  const isInvalidCredentials =
    failure instanceof ApiError && failure.code === INVALID_CREDENTIALS_CODE
  const hasFieldErrors = Object.keys(errors).length > 0

  return (
    <AuthLayout
      title="Entrar"
      lead={
        <>
          Ainda sem conta?{' '}
          <TextLink to={REGISTER_PATH} state={redirect} inline>
            Criar conta
          </TextLink>
        </>
      }
    >
      {isInvalidCredentials ? (
        <Notice tone="error" title="E-mail ou senha incorretos.">
          Confira os dois campos e tente de novo.
        </Notice>
      ) : failure && !hasFieldErrors ? (
        <Notice tone="error" title="Não foi possível entrar.">
          {failure.message}
        </Notice>
      ) : expired ? (
        <Notice tone="warning" title="A sessão expirou.">
          Uma sessão dura 8 horas. Entre de novo para continuar.
        </Notice>
      ) : null}
      <form ref={formRef} noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <TextField
            id="login-email"
            name="email"
            label="E-mail"
            type="email"
            tall
            autoComplete="email"
            placeholder="voce@exemplo.com"
            error={errors.email}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <PasswordField
            id="login-password"
            name="password"
            label="Senha"
            autoComplete="current-password"
            placeholder="Senha da conta"
            error={errors.password}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <AuthActions
          submitLabel={mutation.isPending ? 'Entrando…' : 'Entrar'}
          loading={mutation.isPending}
        />
      </form>
    </AuthLayout>
  )
}
