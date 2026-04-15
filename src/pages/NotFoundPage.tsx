import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <main className="screen-section compact-screen">
      <section className="simple-card center-card">
        <span className="eyebrow">404</span>
        <h1>Página não encontrada</h1>
        <p>O caminho acessado não existe ou já foi movido.</p>
        <Link className="btn btn-primary" to="/login">
          Voltar para o login
        </Link>
      </section>
    </main>
  )
}
