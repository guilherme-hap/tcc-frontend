import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSession } from '../../hooks'
import { LOGIN_PATH, type AuthRedirectState } from '../../utils/routes'

export function RequireAuth() {
  const { user } = useSession()
  const location = useLocation()

  if (!user) {
    const state: AuthRedirectState = { from: `${location.pathname}${location.search}` }
    return <Navigate to={LOGIN_PATH} replace state={state} />
  }

  return <Outlet />
}
