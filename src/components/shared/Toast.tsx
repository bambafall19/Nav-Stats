'use client'

import { createContext, useContext, useState, useCallback } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (message: string, type: ToastType, duration?: number) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { id, message, type, duration }])

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration)
    }
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div style={{
        position: 'fixed',
        bottom: 80,
        left: 12,
        right: 12,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            style={{
              padding: '12px 16px',
              borderRadius: 12,
              background: toast.type === 'success' ? '#10b981' : toast.type === 'error' ? '#ef4444' : toast.type === 'warning' ? '#f59e0b' : '#3b82f6',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: 500,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              animation: 'slideInUp 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                borderRadius: 4,
                padding: '4px 8px',
                fontSize: '1rem',
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
