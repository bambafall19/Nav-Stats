'use client'

import React from 'react'

interface FormSubmitButtonProps {
  loading: boolean
  children: React.ReactNode
  disabled?: boolean
  loadingText?: string
  icon?: string
  loadingIcon?: string
}

export default function FormSubmitButton({
  loading,
  children,
  disabled = false,
  loadingText = 'Chargement...',
  icon = '🚀',
  loadingIcon = '⏳',
}: FormSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      style={{
        width: '100%',
        padding: '13px 16px',
        borderRadius: '12px',
        background: loading || disabled ? '#ccc' : 'linear-gradient(135deg, #00A651 0%, #008c3f 100%)',
        color: 'white',
        border: 'none',
        fontWeight: 700,
        fontSize: '0.95rem',
        fontFamily: 'var(--font-outfit), system-ui, sans-serif',
        cursor: loading || disabled ? 'not-allowed' : 'pointer',
        boxShadow: loading || disabled ? 'none' : '0 8px 20px rgba(0, 166, 81, 0.25)',
        transition: 'all 0.3s ease',
        minHeight: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
      }}
      onMouseEnter={(e) => {
        if (!loading && !disabled) {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 166, 81, 0.35)'
        }
      }}
      onMouseLeave={(e) => {
        if (!loading && !disabled) {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 166, 81, 0.25)'
        }
      }}
    >
      <span>{loading ? loadingIcon : icon}</span>
      <span>{loading ? loadingText : children}</span>
    </button>
  )
}
