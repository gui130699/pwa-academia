import { Eye, EyeOff } from 'lucide-react'
import { useState, type InputHTMLAttributes } from 'react'

interface PasswordFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function PasswordField({
  label,
  error,
  id,
  className,
  ...props
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)
  const inputId = id ?? props.name

  return (
    <label className="form-field" htmlFor={inputId}>
      <span>{label}</span>
      <div className={`password-wrapper ${error ? 'input-error' : ''}`}>
        <input
          id={inputId}
          className={`app-input password-input ${className ?? ''}`.trim()}
          type={visible ? 'text' : 'password'}
          {...props}
        />
        <button
          className="icon-button"
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error ? <small className="error-text">{error}</small> : null}
    </label>
  )
}
