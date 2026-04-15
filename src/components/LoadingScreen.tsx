interface LoadingScreenProps {
  message?: string
}

export function LoadingScreen({
  message = 'Carregando sua experiência...',
}: LoadingScreenProps) {
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <div className="spinner" />
      <p>{message}</p>
    </div>
  )
}
