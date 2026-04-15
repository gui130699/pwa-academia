import type { ReactNode } from 'react'
import { Dumbbell, ShieldCheck, Users } from 'lucide-react'
import { hasFirebaseEnv } from '../firebase/config'

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <main className="page-shell">
      <section className="brand-panel">
        <div className="brand-mark">
          <Dumbbell size={22} />
          <span>PWA Academia</span>
        </div>

        <div className="hero-copy">
          <span className="eyebrow">Fitness premium</span>
          <h1>Seu ecossistema digital para treinos, alunos e gestão.</h1>
          <p>
            Cadastro com aprovação, verificação por e-mail e base pronta para
            expansão em produção.
          </p>
        </div>

        <div className="feature-list">
          <article className="feature-item">
            <Users size={18} />
            <div>
              <strong>Aluno e professor</strong>
              <p>Fluxos separados e dados armazenados no Firestore.</p>
            </div>
          </article>

          <article className="feature-item">
            <ShieldCheck size={18} />
            <div>
              <strong>Autenticação protegida</strong>
              <p>Bloqueio por e-mail não verificado e conta pendente.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="content-panel">
        <div className="form-card">
          <div className="form-card__header">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>

          {!hasFirebaseEnv ? (
            <div className="info-banner warning-banner">
              Preencha o arquivo .env com as credenciais do Firebase para ativar
              login e cadastro.
            </div>
          ) : null}

          {children}
          {footer ? <div className="form-footer">{footer}</div> : null}
        </div>
      </section>
    </main>
  )
}
