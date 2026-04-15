import { Outlet } from 'react-router-dom'
import { HeaderAluno } from './HeaderAluno'
import { SidebarAluno } from './SidebarAluno'

export function LayoutAluno() {
  return (
    <div className="aluno-layout">
      <SidebarAluno />

      <div className="aluno-main">
        <HeaderAluno />

        <main className="aluno-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
