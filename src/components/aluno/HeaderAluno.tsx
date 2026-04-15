import { Sparkles } from 'lucide-react'

export function HeaderAluno() {
  return (
    <header className="aluno-header">
      <div>
        <span className="eyebrow">Área do aluno</span>
        <h1>Seu espaço de treino e evolução</h1>
      </div>

      <div className="aluno-header__badge">
        <Sparkles size={16} />
        Layout inicial
      </div>
    </header>
  )
}
