import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { endSession } from '../services'
import { HOME_PATH } from '../utils/routes'

export function LogoutPage() {
  useEffect(() => {
    endSession()
  }, [])

  return <Navigate to={HOME_PATH} replace />
}
