import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { logout } from '../services'
import { HOME_PATH } from '../utils/routes'

export function LogoutPage() {
  useEffect(() => {
    logout()
  }, [])

  return <Navigate to={HOME_PATH} replace />
}
