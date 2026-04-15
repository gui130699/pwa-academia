import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { PendingApprovalPage } from '../pages/PendingApprovalPage'
import { RegisterPage } from '../pages/RegisterPage'
import { VerifyEmailPage } from '../pages/VerifyEmailPage'
import { alunoRoutes } from './AlunoRoutes'
import { GuestRoute } from './GuestRoute'
import { professorRoutes } from './ProfessorRoutes'
import { ProtectedRoute } from './ProtectedRoute'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<RegisterPage />} />
          <Route path="/esqueci-minha-senha" element={<ForgotPasswordPage />} />
        </Route>

        <Route path="/verificar-email" element={<VerifyEmailPage />} />
        <Route path="/aguardando-aprovacao" element={<PendingApprovalPage />} />

        <Route element={<ProtectedRoute />}>
          {alunoRoutes}
          {professorRoutes}
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
