import type { ReactNode } from "react"
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary"

type ErrorBoundaryProps = {
  children: ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: { componentStack?: string | null }) => void
}

export function ErrorBoundary({ children, fallback, onError }: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={fallback || ErrorFallback}
      onError={onError}
      onReset={() => {
        window.location.reload()
      }}
    >
      {children}
    </ReactErrorBoundary>
  )
}

type ErrorFallbackProps = {
  error: Error
  resetErrorBoundary: () => void
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6">
      <h2 className="mb-2 font-semibold text-lg text-red-800">エラーが発生しました</h2>
      <p className="mb-4 text-red-600">申し訳ございませんが、予期しないエラーが発生しました。</p>
      <details className="mb-4 text-red-600 text-sm">
        <summary className="cursor-pointer">エラー詳細</summary>
        <pre className="mt-2 whitespace-pre-wrap">{error.message}</pre>
      </details>
      <button
        type="button"
        onClick={resetErrorBoundary}
        className="rounded bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
      >
        再試行
      </button>
    </div>
  )
}
