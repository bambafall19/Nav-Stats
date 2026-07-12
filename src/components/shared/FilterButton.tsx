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
        border: active ? '2px solid #00A651' : '1.5px solid #e0e0e0',
        background: active ? 'rgba(0, 166, 81, 0.08)' : '#f8f9fb',
        color: active ? '#00A651' : '#666',
        fontWeight: active ? 700 : 600,
        fontSize: '0.8rem',
        fontFamily: 'var(--font-outfit), system-ui, sans-serif',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        minHeight: '44px',
        minWidth: '44px',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = '#00A651'
          e.currentTarget.style.background = 'rgba(0, 166, 81, 0.04)'
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = '#e0e0e0'
          e.currentTarget.style.background = '#f8f9fb'
        }
      }}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  )
}
