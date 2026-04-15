import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { FormField } from '../components/FormField'
import { PasswordField } from '../components/PasswordField'
import { hasFirebaseEnv } from '../firebase/config'
import { useAuth } from '../hooks/useAuth'
import { getFirebaseErrorMessage } from '../utils/firebaseErrorMessages'
import { emailRegex } from '../utils/validators'

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!emailRegex.test(email.trim().toLowerCase())) {
      setError('Informe um e-mail válido para continuar.')
      return
    }

    if (senha.trim().length < 6) {
      setError('Informe sua senha com no mínimo 6 caracteres.')
      return
    }

    if (!hasFirebaseEnv) {
      setError('Preencha o arquivo .env com as credenciais do Firebase antes de entrar.')
      return
    }

    setIsSubmitting(true)

    try {
      await signIn(email, senha)
      navigate('/dashboard')
    } catch (currentError) {
      setError(
        getFirebaseErrorMessage(
          currentError,
          'Não foi possível entrar agora. Verifique seus dados e tente novamente.',
        ),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Entrar na sua conta"
      subtitle="Acesse a área segura da academia online."
      footer={
        <p>
          Ainda não tem cadastro? <Link to="/cadastro">Criar conta</Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error ? <div className="info-banner error-banner">{error}</div> : null}

        <FormField
          label="E-mail"
          name="email"
          type="email"
          placeholder="voce@exemplo.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />

        <PasswordField
          label="Senha"
          name="senha"
          placeholder="Sua senha"
          value={senha}
          onChange={(event) => setSenha(event.target.value)}
          autoComplete="current-password"
          required
        />

        <div className="action-row">
          <Link to="/esqueci-minha-senha">Esqueci minha senha</Link>
        </div>

        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </AuthLayout>
  )
}
