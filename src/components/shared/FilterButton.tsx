'use client'

import React from 'react'

interface FilterButtonProps {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  icon?: string
}

export default function FilterButton({
  active,
  onClick,
  children,
  icon,
}: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        padding: '10px 14px',
        borderRadius: '12px',
        border: active ? '2px solid var(--color-primary)' : '1.5px solid var(--color-border)',
        background: active ? 'rgba(42,255,160,0.08)' : 'var(--color-surface-card)',
        color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
        fontWeight: active ? 700 : 600,
        fontSize: '0.8rem',
        fontFamily: 'var(--font-plus-jakarta), system-ui, sans-serif',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        minHeight: '44px',
        minWidth: '44px',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = 'var(--color-primary)'
          e.currentTarget.style.background = 'rgba(42,255,160,0.04)'
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = 'var(--color-border)'
          e.currentTarget.style.background = 'var(--color-surface-card)'
        }
      }}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  )
}
