'use client'

import React, { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    const safeMessage = String(error.message).replace(/[\r\n]/g, ' ').substring(0, 200)
    console.error('ErrorBoundary caught:', safeMessage)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: 'linear-gradient(135deg, var(--color-surface-elevated) 0%, var(--color-surface) 100%)',
            fontFamily: 'var(--font-plus-jakarta), system-ui, sans-serif',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: '500px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
            <h1
              style={{
                fontSize: '1.8rem',
                fontWeight: 800,
                color: 'var(--color-text-primary)',
                marginBottom: '8px',
              }}
            >
              Oups! Quelque chose s'est cassé
            </h1>
            <p
              style={{
                fontSize: '0.95rem',
                color: 'var(--color-text-secondary)',
                marginBottom: '24px',
                lineHeight: 1.6,
              }}
            >
              Une erreur inattendue s'est produite. Notre équipe a été notifiée.
              Réessaie dans quelques secondes.
            </p>
            <div
              style={{
                background: 'var(--color-surface-card)',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '24px',
                fontSize: '0.75rem',
                color: 'var(--color-text-muted)',
                fontFamily: 'monospace',
                textAlign: 'left',
                overflow: 'auto',
                maxHeight: '150px',
                border: '1px solid var(--color-border)',
              }}
            >
              {this.state.error?.message || 'Unknown error'}
            </div>
            <button
              onClick={() => window.location.href = '/'}
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                borderRadius: '12px',
                background: 'var(--gradient-green)',
                color: 'white',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-plus-jakarta), system-ui, sans-serif',
              }}
            >
              🏠 Retour à l'accueil
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
