import { Navigate, Route } from 'react-router-dom'
import { LayoutAluno } from '../components/aluno/LayoutAluno'
import { useAuth } from '../hooks/useAuth'
import { AgendaAluno } from '../pages/aluno/AgendaAluno'
import { AmigosAluno } from '../pages/aluno/AmigosAluno'
import { ChatProfessorAluno } from '../pages/aluno/ChatProfessorAluno'
import { ConfiguracoesAluno } from '../pages/aluno/ConfiguracoesAluno'
import { DashboardAluno } from '../pages/aluno/DashboardAluno'
import { EvolucaoAluno } from '../pages/aluno/EvolucaoAluno'
import { MetasAluno } from '../pages/aluno/MetasAluno'
import { NotificacoesAluno } from '../pages/aluno/NotificacoesAluno'
import { TreinosAluno } from '../pages/aluno/TreinosAluno'
import { VisualizarTreino } from '../pages/VisualizarTreino'

function DashboardRedirect() {
  const { profile } = useAuth()

  return (
    <Navigate
      to={profile?.tipoConta === 'professor' ? '/professor/dashboard' : '/aluno/dashboard'}
      replace
    />
  )
}

export const alunoRoutes = (
  <>
    <Route path="/dashboard" element={<DashboardRedirect />} />

    <Route path="/aluno" element={<LayoutAluno />}>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<DashboardAluno />} />
      <Route path="treinos" element={<TreinosAluno />} />
      <Route path="treino/:id" element={<VisualizarTreino />} />
      <Route path="evolucao" element={<EvolucaoAluno />} />
      <Route path="agenda" element={<AgendaAluno />} />
      <Route path="metas" element={<MetasAluno />} />
      <Route path="amigos" element={<AmigosAluno />} />
      <Route path="notificacoes" element={<NotificacoesAluno />} />
      <Route path="chat" element={<ChatProfessorAluno />} />
      <Route path="configuracoes" element={<ConfiguracoesAluno />} />
    </Route>
  </>
)
