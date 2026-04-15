import {
  Bell,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  MessageCircle,
  Settings,
  Users,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

const menuItems = [
  { to: '/professor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/professor/alunos', label: 'Alunos', icon: Users },
  { to: '/professor/treinos', label: 'Treinos', icon: ClipboardList },
  { to: '/professor/notificacoes', label: 'Notificações', icon: Bell },
  { to: '/professor/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/professor/chat', label: 'Chat Aluno', icon: MessageCircle },
  { to: '/professor/configuracoes', label: 'Configurações', icon: Settings },
]

export function SidebarProfessor() {
  return (
    <aside className="professor-sidebar">
      <div className="professor-sidebar__brand">
        <div className="professor-sidebar__logo">
          <ClipboardList size={18} />
        </div>
        <div>
          <strong>Fit Trainer App</strong>
          <p>Painel do professor</p>
        </div>
      </div>

      <nav className="professor-nav" aria-label="Menu do professor">
        {menuItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `professor-nav__link ${isActive ? 'is-active' : ''}`.trim()
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="professor-sidebar__footer">
        <span className="eyebrow">Fitness premium</span>
        <p>Ambiente visual preparado para gestão e acompanhamento dos alunos.</p>
      </div>
    </aside>
  )
}
