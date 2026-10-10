import type { AuthResponse, AuthUser } from '../types'

const STORAGE_KEY = 'auditor.session'

export interface Session {
  token: string
  user: AuthUser
}

export interface SessionState {
  session: Session | null
  expired: boolean
}

function parseSession(raw: string | null): Session | null {
  if (!raw) return null

  try {
    const { token, user } = JSON.parse(raw) as Partial<Session>
    if (typeof token !== 'string' || typeof user?.id !== 'string' || typeof user.email !== 'string') {
      return null
    }
    return { token, user: { id: user.id, email: user.email } }
  } catch {
    return null
  }
}

function readStoredSession(): Session | null {
  try {
    return parseSession(localStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}

function writeStoredSession(session: Session | null): void {
  try {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    return
  }
}

let state: SessionState = { session: readStoredSession(), expired: false }

const listeners = new Set<() => void>()

function publish(next: SessionState): void {
  state = next
  listeners.forEach((listener) => listener())
}

window.addEventListener('storage', (event) => {
  if (event.key !== STORAGE_KEY) return
  publish({ session: parseSession(event.newValue), expired: false })
})

export function getSessionState(): SessionState {
  return state
}

export function subscribeToSession(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function startSession({ token, user }: AuthResponse): void {
  const session = { token, user: { id: user.id, email: user.email } }
  writeStoredSession(session)
  publish({ session, expired: false })
}

export function endSession(): void {
  if (!state.session && !state.expired) return
  writeStoredSession(null)
  publish({ session: null, expired: false })
}

export function expireSession(): void {
  if (!state.session) return
  writeStoredSession(null)
  publish({ session: null, expired: true })
}
