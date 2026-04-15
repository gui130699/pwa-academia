import { BriefcaseBusiness } from 'lucide-react'

export function HeaderProfessor() {
  return (
    <header className="professor-header">
      <div>
        <span className="eyebrow">Área do professor</span>
        <h1>Painel profissional de acompanhamento</h1>
      </div>

      <div className="professor-header__badge">
        <BriefcaseBusiness size={16} />
        Estrutura inicial
      </div>
    </header>
  )
}
