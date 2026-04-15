import { Outlet } from 'react-router-dom'
import { HeaderProfessor } from './HeaderProfessor'
import { SidebarProfessor } from './SidebarProfessor'

export function LayoutProfessor() {
  return (
    <div className="professor-layout">
      <SidebarProfessor />

      <div className="professor-main">
        <HeaderProfessor />

        <main className="professor-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
