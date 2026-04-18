import {
  Bell,
  CalendarDays,
  ClipboardList,
  FolderTree,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  PlusSquare,
  Settings,
  Users,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useUnreadCount } from '../../hooks/useUnreadCount'

const menuItems = [
  { to: '/professor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/professor/alunos', label: 'Alunos', icon: Users },
  { to: '/professor/treinos', label: 'Treinos', icon: ClipboardList },
  { to: '/professor/montar-treino', label: 'Montar treino', icon: PlusSquare },
  { to: '/professor/cadastros-auxiliares', label: 'Cadastros', icon: FolderTree },
  { to: '/professor/notificacoes', label: 'Notificações', icon: Bell },
  { to: '/professor/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/professor/chat', label: 'Chat Aluno', icon: MessageCircle },
  { to: '/professor/configuracoes', label: 'Configurações', icon: Settings },
]

export function SidebarProfessor() {
  const { signOutUser } = useAuth()
  const unreadCount = useUnreadCount()

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
              {item.to === '/professor/chat' && unreadCount > 0 ? (
                <span className="nav-badge">{unreadCount}</span>
              ) : null}
            </NavLink>
          )
        })}
      </nav>

      <div className="professor-sidebar__footer">
        <button className="sidebar-logout-btn" type="button" onClick={() => signOutUser()}>
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  )
}
