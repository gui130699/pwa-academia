import { Navigate, Route } from 'react-router-dom'
import { LayoutProfessor } from '../components/professor/LayoutProfessor'
import { AgendaProfessor } from '../pages/professor/AgendaProfessor'
import { AlunosProfessor } from '../pages/professor/AlunosProfessor'
import { ChatAlunoProfessor } from '../pages/professor/ChatAlunoProfessor'
import { ConfiguracoesProfessor } from '../pages/professor/ConfiguracoesProfessor'
import { DashboardProfessor } from '../pages/professor/DashboardProfessor'
import { NotificacoesProfessor } from '../pages/professor/NotificacoesProfessor'
import { TreinosProfessor } from '../pages/professor/TreinosProfessor'

export const professorRoutes = (
  <Route path="/professor" element={<LayoutProfessor />}>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<DashboardProfessor />} />
    <Route path="alunos" element={<AlunosProfessor />} />
    <Route path="treinos" element={<TreinosProfessor />} />
    <Route path="notificacoes" element={<NotificacoesProfessor />} />
    <Route path="agenda" element={<AgendaProfessor />} />
    <Route path="chat" element={<ChatAlunoProfessor />} />
    <Route path="configuracoes" element={<ConfiguracoesProfessor />} />
  </Route>
)
