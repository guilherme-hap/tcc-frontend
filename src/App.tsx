import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { RequireAuth } from './components/layout/RequireAuth'
import { EvaluationResultPage } from './pages/EvaluationResultPage'
import { HistoryPage } from './pages/HistoryPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { LogoutPage } from './pages/LogoutPage'
import { NewEvaluationPage } from './pages/NewEvaluationPage'
import { RegisterPage } from './pages/RegisterPage'
import {
  EVALUATION_PATH_PATTERN,
  HISTORY_PATH,
  HOME_PATH,
  LOGIN_PATH,
  LOGOUT_PATH,
  NEW_EVALUATION_PATH,
  REGISTER_PATH,
} from './utils/routes'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={LOGIN_PATH} element={<LoginPage />} />
        <Route path={REGISTER_PATH} element={<RegisterPage />} />
        <Route path={LOGOUT_PATH} element={<LogoutPage />} />
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path={NEW_EVALUATION_PATH} element={<NewEvaluationPage />} />
          <Route path={EVALUATION_PATH_PATTERN} element={<EvaluationResultPage />} />
          <Route element={<RequireAuth />}>
            <Route path={HISTORY_PATH} element={<HistoryPage />} />
          </Route>
          <Route path="*" element={<Navigate to={HOME_PATH} replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
