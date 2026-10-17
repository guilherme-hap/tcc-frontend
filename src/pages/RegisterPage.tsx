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
import { ApiError, register, startSession } from '../services'
import {
  HOME_PATH,
  LOGIN_PATH,
  RESTORE_DRAFT_STATE,
  type AuthRedirectState,
} from '../utils/routes'
import { MIN_PASSWORD_LENGTH, isEmail, issuesByField } from '../utils/validation'

const EMAIL_IN_USE_CODE = 'AUTH_EMAIL_IN_USE'
const SERVER_FIELDS = ['email', 'password'] as const

interface RegisterErrors {
  email?: string
  password?: string
  confirmation?: string
}

export function RegisterPage() {
  useDocumentTitle('Criar conta')
  const { user } = useSession()
  const location = useLocation()
  const redirect = location.state as AuthRedirectState | null
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [errors, setErrors] = useState<RegisterErrors>({})
  const { ref: formRef, focusFirstInvalid } = useFocusFirstInvalid<HTMLFormElement>()

  const mutation = useMutation({
    mutationFn: register,
    onSuccess: startSession,
    onError: (error) => {
      if (!(error instanceof ApiError)) return

      setErrors(issuesByField(error.issues, SERVER_FIELDS))
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
    const next: RegisterErrors = {}
    if (!email.trim()) next.email = 'Informe o e-mail'
    else if (!isEmail(email.trim())) next.email = 'E-mail inválido'
    if (password.length < MIN_PASSWORD_LENGTH) {
      next.password = `A senha deve ter ao menos ${MIN_PASSWORD_LENGTH} caracteres`
    } else if (confirmation !== password) {
      next.confirmation = 'As senhas não conferem'
    }
    setErrors(next)
    focusFirstInvalid()

    if (Object.keys(next).length === 0) mutation.mutate({ email: email.trim(), password })
  }

  const failure = mutation.error
  const isEmailInUse = failure instanceof ApiError && failure.code === EMAIL_IN_USE_CODE
  const hasFieldErrors = Object.keys(errors).length > 0

  return (
    <AuthLayout
      title="Criar conta"
      lead={
        <>
          Já tem conta?{' '}
          <TextLink to={LOGIN_PATH} state={redirect} inline>
            Entrar
          </TextLink>
        </>
      }
      benefits
      note="As avaliações feitas antes da conta continuam anônimas: abrem pelo link e não entram no histórico."
    >
      {isEmailInUse ? (
        <Notice tone="error" title="Este e-mail já tem uma conta.">
          Use outro e-mail ou{' '}
          <TextLink to={LOGIN_PATH} state={redirect} inline>
            entre com a conta existente
          </TextLink>
          .
        </Notice>
      ) : failure && !hasFieldErrors ? (
        <Notice tone="error" title="Não foi possível criar a conta.">
          {failure.message}
        </Notice>
      ) : null}
      <form ref={formRef} noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <TextField
            id="signup-email"
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
            id="signup-password"
            name="password"
            label="Senha"
            autoComplete="new-password"
            hint={`Ao menos ${MIN_PASSWORD_LENGTH} caracteres.`}
            error={errors.password}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <PasswordField
            id="signup-confirm"
            name="passwordConfirmation"
            label="Confirmar senha"
            subject="confirmação da senha"
            autoComplete="new-password"
            placeholder="Repita a senha"
            error={errors.confirmation}
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
          />
        </div>
        <AuthActions
          submitLabel={mutation.isPending ? 'Criando conta…' : 'Criar conta'}
          loading={mutation.isPending}
        />
      </form>
    </AuthLayout>
  )
}
