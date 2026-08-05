'use client'

import React from 'react'
import { Loader2, Send } from 'lucide-react'

interface FormSubmitButtonProps {
  loading: boolean
  children: React.ReactNode
  disabled?: boolean
  loadingText?: string
}

export default function FormSubmitButton({
  loading,
  children,
  disabled = false,
  loadingText = 'Chargement...',
}: FormSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      style={{
        width: '100%', padding: '13px 16px', borderRadius: 12,
        background: loading || disabled ? 'var(--color-border)' : 'var(--gradient-green)',
        color: 'white', border: 'none', fontWeight: 700, fontSize: '0.9rem',
        fontFamily: 'var(--font-plus-jakarta), system-ui, sans-serif',
        cursor: loading || disabled ? 'not-allowed' : 'pointer',
        boxShadow: loading || disabled ? 'none' : '0 6px 16px rgba(42,255,160,0.25)',
        transition: 'all 0.3s ease', minHeight: 44,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}
      onMouseEnter={(e) => {
        if (!loading && !disabled) {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 10px 24px rgba(42,255,160,0.35)'
        }
      }}
      onMouseLeave={(e) => {
        if (!loading && !disabled) {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(42,255,160,0.25)'
        }
      }}
    >
      {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={18} />}
      <span>{loading ? loadingText : children}</span>
    </button>
  )
}
