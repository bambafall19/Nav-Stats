'use client'

export function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--color-surface-card)',
      border: '1px solid var(--color-border-subtle)',
      borderRadius: 14,
      padding: 16,
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    }}>
      <div style={{ height: 18, background: 'var(--color-bg-secondary)', borderRadius: 8, marginBottom: 12 }} />
      <div style={{ height: 14, background: 'var(--color-bg-secondary)', borderRadius: 8, width: '80%' }} />
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 16px',
      borderBottom: '1px solid var(--color-border-subtle)',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10,
        background: 'var(--color-bg-secondary)',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: 14, background: 'var(--color-bg-secondary)', borderRadius: 6, marginBottom: 8, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
        <div style={{ height: 10, background: 'var(--color-bg-secondary)', borderRadius: 6, width: '60%', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
      </div>
      <div style={{ width: 40, height: 18, background: 'var(--color-bg-secondary)', borderRadius: 6, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
    </div>
  )
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 68, borderRadius: 12 }} />
      ))}
    </div>
  )
}
