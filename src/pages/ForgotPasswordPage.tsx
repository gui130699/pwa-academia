import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { FormField } from '../components/FormField'
import { hasFirebaseEnv } from '../firebase/config'
import { useAuth } from '../hooks/useAuth'
import { getFirebaseErrorMessage } from '../utils/firebaseErrorMessages'
import { emailRegex } from '../utils/validators'

export function ForgotPasswordPage() {
  const { sendResetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!emailRegex.test(email.trim().toLowerCase())) {
      setError('Informe um e-mail válido para receber o link de redefinição.')
      return
    }

    if (!hasFirebaseEnv) {
      setError('Preencha o arquivo .env com as credenciais do Firebase antes de enviar o e-mail.')
      return
    }

    setIsSubmitting(true)

    try {
      await sendResetPassword(email)
      setSuccess('Enviamos o link de redefinição para o seu e-mail.')
    } catch (currentError) {
      setError(
        getFirebaseErrorMessage(
          currentError,
          'Não foi possível enviar o e-mail de redefinição agora.',
        ),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Recuperar senha"
      subtitle="Digite seu e-mail para receber o link de redefinição."
      footer={
        <p>
          Lembrou sua senha? <Link to="/login">Voltar ao login</Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error ? <div className="info-banner error-banner">{error}</div> : null}
        {success ? <div className="info-banner success-banner">{success}</div> : null}

        <FormField
          label="E-mail"
          name="email"
          type="email"
          placeholder="voce@exemplo.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Enviando...' : 'Enviar link'}
        </button>
      </form>
    </AuthLayout>
  )
}
