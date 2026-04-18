import {
  Bell,
  CalendarDays,
  Dumbbell,
  LayoutDashboard,
  LineChart,
  LogOut,
  MessageCircleMore,
  Settings,
  Target,
  Users,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useUnreadCount } from '../../hooks/useUnreadCount'

const menuItems = [
  { to: '/aluno/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/aluno/treinos', label: 'Treinos', icon: Dumbbell },
  { to: '/aluno/evolucao', label: 'Evolução', icon: LineChart },
  { to: '/aluno/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/aluno/metas', label: 'Metas', icon: Target },
  { to: '/aluno/amigos', label: 'Amigos', icon: Users },
  { to: '/aluno/notificacoes', label: 'Notificações', icon: Bell },
  { to: '/aluno/chat', label: 'Chat Professor', icon: MessageCircleMore },
  { to: '/aluno/configuracoes', label: 'Configurações', icon: Settings },
]

export function SidebarAluno() {
  const { signOutUser } = useAuth()
  const unreadCount = useUnreadCount()

  return (
    <aside className="aluno-sidebar">
      <div className="aluno-sidebar__brand">
        <div className="aluno-sidebar__logo">
          <Dumbbell size={18} />
        </div>
        <div>
          <strong>Fit Trainer App</strong>
          <p>Painel do aluno</p>
        </div>
      </div>

      <nav className="aluno-nav" aria-label="Menu do aluno">
        {menuItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `aluno-nav__link ${isActive ? 'is-active' : ''}`.trim()
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {item.to === '/aluno/chat' && unreadCount > 0 ? (
                <span className="nav-badge">{unreadCount}</span>
              ) : null}
            </NavLink>
          )
        })}
      </nav>

      <div className="aluno-sidebar__footer">
        <button className="sidebar-logout-btn" type="button" onClick={() => signOutUser()}>
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  )
}
