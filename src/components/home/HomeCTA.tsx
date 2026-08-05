'use client'

import Link from 'next/link'
import { Trophy, Target, Users, ArrowRight } from 'lucide-react'

export default function HomeCTA() {
  return (
    <section className="home-cta" style={{
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
      background: 'var(--gradient-hero)',
      position: 'relative',
      boxShadow: 'var(--shadow-green)',
    }}>
      <div style={{
        position: 'absolute', top: -50, right: -20, width: 180, height: 180, borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)',
      }} />
      <div style={{ position: 'absolute', bottom: -60, left: -30, width: 200, height: 200, borderRadius: '50%', background: 'rgba(251,191,36,0.08)' }} />
      <div style={{ position: 'relative', zIndex: 1, padding: '24px 22px', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 'var(--radius-md)',
              background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Trophy size={20} color="#fbbf24" />
            </div>
            <h3 style={{ color: 'white', fontSize: '1.05rem', fontWeight: 800, fontFamily: 'var(--font-plus-jakarta)', margin: 0 }}>
              Rejoignez la compétition !
            </h3>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.78rem', lineHeight: 1.5, margin: 0 }}>
            Pronostiquez les matchs, gagnez des points et grimpez au classement général.
          </p>

          <div style={{ display: 'flex', gap: 16, marginTop: 14, flexWrap: 'wrap' }}>
            {[
              { icon: Target, label: 'Scores exacts', color: '#fbbf24' },
              { icon: Users, label: 'Mini-ligues & amis', color: '#a7f3d0' },
              { icon: Trophy, label: 'Badges & niveaux', color: 'rgba(255,77,90,0.20)' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <f.icon size={13} color={f.color} />
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.66rem', fontWeight: 600 }}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexDirection: 'column', flexShrink: 0 }}>
          <Link href="/auth/register" style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '12px 26px', background: '#fbbf24', color: '#451a03',
            borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 800,
            fontSize: '0.82rem', fontFamily: 'var(--font-plus-jakarta)',
            boxShadow: '0 4px 18px rgba(251,191,36,0.3)',
            transition: 'all var(--transition-base) var(--ease-out)',
          }}>
            Créer un compte gratuit <ArrowRight size={14} />
          </Link>
          <Link href="/auth/login" style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            padding: '10px 26px', borderRadius: 'var(--radius-md)', textDecoration: 'none',
            fontWeight: 700, fontSize: '0.78rem', fontFamily: 'var(--font-plus-jakarta)',
            color: 'white', background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            transition: 'all var(--transition-base) var(--ease-out)',
          }}>
            J'ai déjà un compte
          </Link>
        </div>
      </div>
    </section>
  )
}
