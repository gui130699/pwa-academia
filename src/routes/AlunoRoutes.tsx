import { Navigate, Route } from 'react-router-dom'
import { LayoutAluno } from '../components/aluno/LayoutAluno'
import { AgendaAluno } from '../pages/aluno/AgendaAluno'
import { ChatProfessorAluno } from '../pages/aluno/ChatProfessorAluno'
import { ConfiguracoesAluno } from '../pages/aluno/ConfiguracoesAluno'
import { DashboardAluno } from '../pages/aluno/DashboardAluno'
import { EvolucaoAluno } from '../pages/aluno/EvolucaoAluno'
import { MetasAluno } from '../pages/aluno/MetasAluno'
import { NotificacoesAluno } from '../pages/aluno/NotificacoesAluno'
import { TreinosAluno } from '../pages/aluno/TreinosAluno'

export const alunoRoutes = (
  <>
    <Route path="/dashboard" element={<Navigate to="/aluno/dashboard" replace />} />

    <Route path="/aluno" element={<LayoutAluno />}>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<DashboardAluno />} />
      <Route path="treinos" element={<TreinosAluno />} />
      <Route path="evolucao" element={<EvolucaoAluno />} />
      <Route path="agenda" element={<AgendaAluno />} />
      <Route path="metas" element={<MetasAluno />} />
      <Route path="notificacoes" element={<NotificacoesAluno />} />
      <Route path="chat" element={<ChatProfessorAluno />} />
      <Route path="configuracoes" element={<ConfiguracoesAluno />} />
    </Route>
  </>
)
