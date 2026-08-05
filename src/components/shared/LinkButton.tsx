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
    background: 'var(--gradient-green)',
    color: 'var(--color-text-on-primary)',
    border: 'none',
    boxShadow: '0 8px 20px rgba(42,255,160,0.25)',
  },
  secondary: {
    background: 'var(--color-surface-card)',
    color: 'var(--color-text-primary)',
    border: '1.5px solid var(--color-border)',
    boxShadow: 'none',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-primary)',
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
  className,
  onClick,
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '12px',
        fontWeight: 700,
        fontFamily: 'var(--font-plus-jakarta), system-ui, sans-serif',
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
          e.currentTarget.style.borderColor = 'var(--color-primary)'
          e.currentTarget.style.color = 'var(--color-primary)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(42,255,160,0.1)'
        }
      }}
      onMouseLeave={(e) => {
        if (variant === 'secondary') {
          e.currentTarget.style.borderColor = 'var(--color-border)'
          e.currentTarget.style.color = 'var(--color-text-primary)'
          e.currentTarget.style.boxShadow = 'none'
        } else if (variant === 'ghost') {
          e.currentTarget.style.color = 'var(--color-primary)'
        }
      }}
    >
      {children}
    </Link>
  )
}
