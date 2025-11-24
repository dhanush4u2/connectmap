import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('❌ React Error Boundary caught an error:', error)
    console.error('Error Info:', errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg flex items-center justify-center p-8">
          <div className="max-w-2xl w-full card-premium p-8 text-center">
            <h1 className="text-4xl mb-4">⚠️ Something went wrong</h1>
            <p className="text-slate-400 mb-6">
              The app encountered an error. Check the browser console (F12) for details.
            </p>
            <div className="bg-red-950/20 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-400 font-mono text-left">
                {this.state.error?.message}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
