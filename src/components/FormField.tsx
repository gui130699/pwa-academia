import type { InputHTMLAttributes } from 'react'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
}

export function FormField({
  label,
  error,
  helperText,
  id,
  className,
  ...props
}: FormFieldProps) {
  const inputId = id ?? props.name

  return (
    <label className="form-field" htmlFor={inputId}>
      <span>{label}</span>
      <input
        id={inputId}
        className={`app-input ${error ? 'input-error' : ''} ${className ?? ''}`.trim()}
        {...props}
      />
      {error ? <small className="error-text">{error}</small> : null}
      {!error && helperText ? <small className="helper-text">{helperText}</small> : null}
    </label>
  )
}
