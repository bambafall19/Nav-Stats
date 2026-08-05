import type { LucideIcon } from 'lucide-react'

interface PageHeroProps {
  icon: LucideIcon
  title: string
  subtitle: string
  stats?: Array<{ value: string | number; label: string }>
  right?: React.ReactNode
  children?: React.ReactNode
}

export default function PageHero({ icon: Icon, title, subtitle, stats, right, children }: PageHeroProps) {
  return (
    <div style={{
      background: 'var(--gradient-hero)',
      borderRadius: 'var(--radius-xl)',
      padding: '28px 28px 24px',
      marginBottom: 16,
      boxShadow: 'var(--shadow-green)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: -60, right: -40, width: 200, height: 200, borderRadius: '50%',
        background: 'rgba(255,255,255,0.06)',
      }} />
      <div style={{
        position: 'absolute', bottom: -80, left: -30, width: 150, height: 150, borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)',
      }} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <div style={{
          width: 46, height: 46, borderRadius: 14,
          background: 'rgba(255,255,255,0.14)',
          border: '1px solid rgba(255,255,255,0.2)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon size={22} color="white" strokeWidth={2.2} />
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h1 style={{
            fontFamily: 'var(--font-plus-jakarta)',
            fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900,
            color: 'white', letterSpacing: '-0.02em', lineHeight: 1.1,
          }}>{title}</h1>
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', marginTop: 4, fontWeight: 600 }}>
            {subtitle}
          </p>
        </div>
        {right}
      </div>

      {stats && stats.length > 0 && (
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
          {stats.map(s => (
            <div key={s.label} style={{
              flex: 1, minWidth: 90, padding: '10px 12px',
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.16)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1rem', color: 'white', lineHeight: 1.1 }}>
                {s.value}
              </div>
              <div style={{ fontSize: '0.56rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em', marginTop: 2 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {children}
    </div>
  )
}
