'use client'

import type { ReactNode } from 'react'

interface ScoreboardPanelProps {
  title: string
  icon?: ReactNode
  right?: ReactNode
  children: ReactNode
  bodyStyle?: React.CSSProperties
}

export default function ScoreboardPanel({ title, icon, right, children, bodyStyle }: ScoreboardPanelProps) {
  return (
    <div className="scoreboard-panel" style={{
      background: 'var(--color-surface-card)',
      border: '1px solid var(--color-border-subtle)',
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-card)',
    }}>
      {/* Accent bar */}
      <div style={{
        height: 3,
        background: 'linear-gradient(90deg, var(--color-primary), rgba(42,255,160,0.12), transparent)',
      }} />

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 16px',
        background: 'linear-gradient(135deg, rgba(42,255,160,0.06), rgba(42,255,160,0.015))',
        borderBottom: '1px solid var(--color-border-subtle)',
      }}>
        {icon && (
          <span style={{
            width: 30, height: 30, borderRadius: 10,
            background: 'linear-gradient(135deg, rgba(42,255,160,0.18), rgba(42,255,160,0.05))',
            border: '1px solid rgba(42,255,160,0.18)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {icon}
          </span>
        )}
        <span style={{
          fontFamily: 'var(--font-plus-jakarta)', fontWeight: 800,
          fontSize: '0.85rem', letterSpacing: '-0.01em',
          color: 'var(--color-text-primary)',
          flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {title}
        </span>
        {right}
      </div>

      <div style={{ padding: 16, ...bodyStyle }}>{children}</div>

      <style>{`
        .scoreboard-panel:hover { box-shadow: var(--shadow-card-hover); }
      `}</style>
    </div>
  )
}
