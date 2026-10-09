import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { EvaluationResultPage } from './pages/EvaluationResultPage'
import { HomePage } from './pages/HomePage'
import { NewEvaluationPage } from './pages/NewEvaluationPage'
import { EVALUATION_PATH_PATTERN, HOME_PATH, NEW_EVALUATION_PATH } from './utils/routes'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path={NEW_EVALUATION_PATH} element={<NewEvaluationPage />} />
          <Route path={EVALUATION_PATH_PATTERN} element={<EvaluationResultPage />} />
          <Route path="*" element={<Navigate to={HOME_PATH} replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
