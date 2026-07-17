'use client'

export function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--color-surface-card)',
      border: '1px solid var(--color-border)',
      borderRadius: 'clamp(12px, 3vw, 16px)',
      padding: 'clamp(12px, 3vw, 16px)',
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    }}>
      <div style={{ height: 20, background: 'var(--color-border)', borderRadius: 4, marginBottom: 12 }} />
      <div style={{ height: 16, background: 'var(--color-border)', borderRadius: 4, width: '80%' }} />
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
      borderBottom: '1px solid var(--color-border)',
    }}>
      <div style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: 'var(--color-border)',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }} />
      <div style={{ flex: 1 }}>
        <div style={{
          height: 16,
          background: 'var(--color-border)',
          borderRadius: 4,
          marginBottom: 8,
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }} />
        <div style={{
          height: 12,
          background: 'var(--color-border)',
          borderRadius: 4,
          width: '60%',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }} />
      </div>
      <div style={{
        width: 40,
        height: 20,
        background: 'var(--color-border)',
        borderRadius: 4,
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }} />
    </div>
  )
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div style={{ background: 'var(--color-surface-card)', border: '1px solid var(--color-border)', borderRadius: 'clamp(12px, 3vw, 16px)', overflow: 'hidden' }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  )
}
