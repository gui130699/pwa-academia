import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { FormField } from '../components/FormField'
import { PasswordField } from '../components/PasswordField'
import { hasFirebaseEnv } from '../firebase/config'
import { useAuth } from '../hooks/useAuth'
import type { RegisterFormData } from '../types/auth'
import { getFirebaseErrorMessage } from '../utils/firebaseErrorMessages'
import { formatPhone } from '../utils/format'
import { UF_OPTIONS, validateRegisterForm } from '../utils/validators'

const initialForm: RegisterFormData = {
  tipoConta: 'aluno',
  nomeCompleto: '',
  telefone: '',
  dataNascimento: '',
  email: '',
  senha: '',
  confirmarSenha: '',
  credencialProfissional: '',
  ufCredencial: '',
}

export function RegisterPage() {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [formData, setFormData] = useState<RegisterFormData>(initialForm)
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({})
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isProfessor = useMemo(() => formData.tipoConta === 'professor', [formData.tipoConta])

  function updateField<K extends keyof RegisterFormData>(field: K, value: RegisterFormData[K]) {
    setFormData((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
    setFeedback('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const validationErrors = validateRegisterForm(formData)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      setFeedback('Revise os campos destacados antes de continuar.')
      return
    }

    if (!hasFirebaseEnv) {
      setFeedback('Preencha o arquivo .env com as credenciais do Firebase para concluir o cadastro.')
      return
    }

    setIsSubmitting(true)
    setFeedback('')

    try {
      await signUp(formData)
      navigate('/verificar-email')
    } catch (currentError) {
      setFeedback(
        getFirebaseErrorMessage(
          currentError,
          'Não foi possível concluir o cadastro agora. Tente novamente.',
        ),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Criar nova conta"
      subtitle="Escolha seu perfil e cadastre-se na plataforma."
      footer={
        <p>
          Já possui acesso? <Link to="/login">Fazer login</Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="role-switch" aria-label="Tipo de conta">
          <button
            className={`role-option ${formData.tipoConta === 'aluno' ? 'role-option--active' : ''}`}
            type="button"
            onClick={() => updateField('tipoConta', 'aluno')}
          >
            Aluno
          </button>
          <button
            className={`role-option ${formData.tipoConta === 'professor' ? 'role-option--active' : ''}`}
            type="button"
            onClick={() => updateField('tipoConta', 'professor')}
          >
            Professor
          </button>
        </div>

        {feedback ? <div className="info-banner error-banner">{feedback}</div> : null}

        <div className="auth-grid">
          <FormField
            label="Nome completo"
            name="nomeCompleto"
            placeholder="Ex.: Guilherme da Silva"
            value={formData.nomeCompleto}
            onChange={(event) => updateField('nomeCompleto', event.target.value)}
            error={errors.nomeCompleto}
            required
          />

          <FormField
            label="Telefone"
            name="telefone"
            placeholder="(11) 99999-9999"
            value={formData.telefone}
            onChange={(event) => updateField('telefone', formatPhone(event.target.value))}
            error={errors.telefone}
            required
          />

          <FormField
            label="Data de nascimento"
            name="dataNascimento"
            type="date"
            value={formData.dataNascimento}
            onChange={(event) => updateField('dataNascimento', event.target.value)}
            error={errors.dataNascimento}
            required
          />

          <FormField
            label="E-mail"
            name="email"
            type="email"
            placeholder="voce@exemplo.com"
            value={formData.email}
            onChange={(event) => updateField('email', event.target.value)}
            error={errors.email}
            required
          />

          <PasswordField
            label="Senha"
            name="senha"
            placeholder="Mínimo de 6 caracteres"
            value={formData.senha}
            onChange={(event) => updateField('senha', event.target.value)}
            error={errors.senha}
            autoComplete="new-password"
            required
          />

          <PasswordField
            label="Confirmar senha"
            name="confirmarSenha"
            placeholder="Repita sua senha"
            value={formData.confirmarSenha}
            onChange={(event) => updateField('confirmarSenha', event.target.value)}
            error={errors.confirmarSenha}
            autoComplete="new-password"
            required
          />

          {isProfessor ? (
            <>
              <FormField
                label="Número da credencial profissional"
                name="credencialProfissional"
                placeholder="CREF / registro profissional"
                value={formData.credencialProfissional}
                onChange={(event) => updateField('credencialProfissional', event.target.value)}
                error={errors.credencialProfissional}
                required
              />

              <label className="form-field" htmlFor="ufCredencial">
                <span>UF da credencial</span>
                <select
                  id="ufCredencial"
                  className={`app-input ${errors.ufCredencial ? 'input-error' : ''}`}
                  value={formData.ufCredencial}
                  onChange={(event) => updateField('ufCredencial', event.target.value)}
                  required
                >
                  <option value="">Selecione</option>
                  {UF_OPTIONS.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
                {errors.ufCredencial ? <small className="error-text">{errors.ufCredencial}</small> : null}
              </label>
            </>
          ) : null}
        </div>

        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Criando conta...' : 'Cadastrar'}
        </button>
      </form>
    </AuthLayout>
  )
}
