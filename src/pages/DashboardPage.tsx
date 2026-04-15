import { LogOut, Mail, ShieldCheck, UserCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  getApprovalLabel,
  getTipoContaLabel,
  getUserInitials,
} from '../utils/format'

export function DashboardPage() {
  const { user, profile, signOutUser } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOutUser()
    navigate('/login')
  }

  if (!user || !profile) {
    return null
  }

  return (
    <main className="screen-section">
      <section className="dashboard-shell">
        <header className="dashboard-header">
          <div className="user-chip">
            <div className="avatar-badge">{getUserInitials(profile.nomeCompleto)}</div>
            <div>
              <span className="eyebrow">Área autenticada</span>
              <h1>Bem-vindo, {profile.nomeCompleto.split(' ')[0]}!</h1>
              <p>Seu acesso já está liberado para a próxima etapa do projeto.</p>
            </div>
          </div>

          <button className="btn btn-secondary" type="button" onClick={handleLogout}>
            <LogOut size={16} />
            Sair
          </button>
        </header>

        <div className="stat-grid">
          <article className="summary-card">
            <UserCircle2 size={18} />
            <strong>{profile.nomeCompleto}</strong>
            <span>{getTipoContaLabel(profile.tipoConta)}</span>
          </article>

          <article className="summary-card">
            <Mail size={18} />
            <strong>{user.email}</strong>
            <span>E-mail verificado</span>
          </article>

          <article className="summary-card">
            <ShieldCheck size={18} />
            <strong>{getApprovalLabel(profile.statusAprovacao)}</strong>
            <span>Status da conta</span>
          </article>
        </div>

        <section className="panel-grid">
          <article className="panel-card">
            <h2>Resumo do cadastro</h2>
            <ul className="detail-list">
              <li>
                <span>Nome</span>
                <strong>{profile.nomeCompleto}</strong>
              </li>
              <li>
                <span>E-mail</span>
                <strong>{profile.email}</strong>
              </li>
              <li>
                <span>Tipo de conta</span>
                <strong>{getTipoContaLabel(profile.tipoConta)}</strong>
              </li>
              <li>
                <span>Telefone</span>
                <strong>{profile.telefone}</strong>
              </li>
            </ul>
          </article>

          <article className="panel-card">
            <h2>Informações operacionais</h2>
            <ul className="detail-list">
              <li>
                <span>UID</span>
                <strong>{profile.uid}</strong>
              </li>
              <li>
                <span>Status</span>
                <strong>{getApprovalLabel(profile.statusAprovacao)}</strong>
              </li>
              {'credencialProfissional' in profile ? (
                <>
                  <li>
                    <span>Credencial</span>
                    <strong>{profile.credencialProfissional}</strong>
                  </li>
                  <li>
                    <span>UF</span>
                    <strong>{profile.ufCredencial}</strong>
                  </li>
                </>
              ) : null}
            </ul>
          </article>
        </section>
      </section>
    </main>
  )
}
