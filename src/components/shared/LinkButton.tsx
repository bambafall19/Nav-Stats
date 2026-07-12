'use client'

import Link from 'next/link'
import React from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface LinkButtonProps {
  href: string
  children: React.ReactNode
  variant?: Variant
  size?: Size
  className?: string
  onClick?: () => void
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: 'linear-gradient(135deg, #00A651 0%, #008c3f 100%)',
    color: 'white',
    border: 'none',
    boxShadow: '0 8px 20px rgba(0, 166, 81, 0.25)',
  },
  secondary: {
    background: '#f5f5f5',
    color: '#1a1a2e',
    border: '1.5px solid #e0e0e0',
    boxShadow: 'none',
  },
  ghost: {
    background: 'transparent',
    color: '#00A651',
    border: 'none',
    boxShadow: 'none',
  },
}

const sizeStyles: Record<Size, React.CSSProperties> = {
  sm: { padding: '8px 12px', fontSize: '0.75rem' },
  md: { padding: '11px 16px', fontSize: '0.8rem' },
  lg: { padding: '13px 18px', fontSize: '0.9rem' },
}

export default function LinkButton({
  href,
  children,
  variant = 'primary',
  size = 'md',
  onClick,
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '12px',
        fontWeight: 700,
        fontFamily: 'var(--font-outfit), system-ui, sans-serif',
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        minHeight: '44px',
        minWidth: '44px',
        ...variantStyles[variant],
        ...sizeStyles[size],
      }}
      onMouseEnter={(e) => {
        if (variant === 'secondary' || variant === 'ghost') {
          e.currentTarget.style.borderColor = '#00A651'
          e.currentTarget.style.color = '#00A651'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 166, 81, 0.1)'
        }
      }}
      onMouseLeave={(e) => {
        if (variant === 'secondary') {
          e.currentTarget.style.borderColor = '#e0e0e0'
          e.currentTarget.style.color = '#1a1a2e'
          e.currentTarget.style.boxShadow = 'none'
        } else if (variant === 'ghost') {
          e.currentTarget.style.color = '#00A651'
        }
      }}
    >
      {children}
    </Link>
  )
}
