'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Bell, Search, Tv, Calendar, Trophy, BarChart3, ArrowRight } from 'lucide-react'

const FEATURES = [
  { Icon: Tv, title: 'Scores en direct' },
  { Icon: Calendar, title: 'Calendriers' },
  { Icon: Trophy, title: 'Classements' },
  { Icon: BarChart3, title: 'Statistiques' },
]

const SEEN_KEY = 'navestats-onboarding-seen'

export default function MobileOnboarding() {
  const [phase, setPhase] = useState<'hidden' | 'show' | 'fading'>('hidden')

  useEffect(() => {
    let active = true
    const supabase = createClient()
    ;(async () => {
      if (window.innerWidth >= 768) return
      let seen = false
      try { seen = localStorage.getItem(SEEN_KEY) === '1' } catch { /* ignore */ }
      if (seen) return
      const { data } = await supabase.auth.getSession()
      if (!active) return
      if (data.session) {
        try { localStorage.setItem(SEEN_KEY, '1') } catch { /* ignore */ }
        return
      }
      setPhase('show')
    })()
    return () => { active = false }
  }, [])

  const handleDismiss = () => {
    try { localStorage.setItem(SEEN_KEY, '1') } catch { /* ignore */ }
    setPhase('fading')
    setTimeout(() => setPhase('hidden'), 400)
  }

  if (phase === 'hidden') return null

  return (
    <div
      className="onboarding-overlay"
      style={{
        position: 'fixed', inset: 0, zIndex: 999999,
        background: '#0B0F10', display: 'flex', flexDirection: 'column',
        opacity: phase === 'fading' ? 0 : 1,
        transform: phase === 'fading' ? 'scale(1.03)' : 'scale(1)',
        transition: 'opacity 0.4s cubic-bezier(0.16,1,0.3,1), transform 0.4s cubic-bezier(0.16,1,0.3,1)',
        overflow: 'hidden',
        color: '#FFFFFF',
      }}
    >
      {/* Décor : lueurs vertes + lignes courbes discrètes */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: -140, right: -120, width: 380, height: 380,
          background: 'radial-gradient(circle, rgba(34,197,94,0.14) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: -160, left: -120, width: 420, height: 420,
          background: 'radial-gradient(circle, rgba(34,197,94,0.10) 0%, transparent 70%)',
        }} />
        <svg viewBox="0 0 375 812" fill="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.35 }}>
          <path d="M-40 300 C 80 240, 220 380, 415 300" stroke="rgba(34,197,94,0.10)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M-40 330 C 80 270, 220 410, 415 330" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M-40 680 C 100 620, 240 760, 415 640" stroke="rgba(34,197,94,0.08)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Header */}
      <div style={{
        position: 'absolute', top: 'calc(10px + env(safe-area-inset-top))', left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', gap: 8, zIndex: 10,
      }}>
        <div style={{ width: 44, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
          <button aria-label="Notifications" style={{
            width: 44, height: 44, borderRadius: '50%', cursor: 'pointer',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}>
            <Bell size={20} color="#FFFFFF" />
            <span style={{
              position: 'absolute', top: 9, right: 10,
              width: 8, height: 8, borderRadius: '50%', background: '#22C55E',
            }} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <img src="/logo.png" alt="Logo NavéStats" style={{ width: 38, height: 38, borderRadius: 10 }} />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              NavéStats
            </span>
            <span style={{ fontSize: 9, color: '#9CA3AF', fontWeight: 700, letterSpacing: '0.14em' }}>
              KHOMBOLE
            </span>
          </div>
        </div>

        <div style={{ width: 44, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
          <button aria-label="Rechercher" style={{
            width: 44, height: 44, borderRadius: '50%', cursor: 'pointer',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Search size={20} color="#FFFFFF" />
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center',
        padding: 'calc(84px + env(safe-area-inset-top)) 24px calc(28px + env(safe-area-inset-bottom))',
        position: 'relative', zIndex: 4,
      }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 34, lineHeight: 1.12,
          color: '#FFFFFF', letterSpacing: '-0.03em', margin: 0,
          animation: 'onb-fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.05s both',
        }}>
          Toute la <span style={{ color: '#22C55E' }}>Navétane</span> dans votre poche
        </h1>

        <p style={{
          marginTop: 14, fontSize: 15, lineHeight: 1.65, color: '#9CA3AF',
          maxWidth: 320, marginLeft: 0, marginRight: 0,
          animation: 'onb-fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.15s both',
        }}>
          Scores en direct, calendriers, classements, statistiques des joueurs et actualités des ASC de Khombole.
        </p>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 32,
          animation: 'onb-fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.25s both',
        }}>
          {FEATURES.map(({ Icon, title }) => (
            <div key={title} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '16px 14px', borderRadius: 20,
              background: '#161A1B', border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                background: 'rgba(34,197,94,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={20} color="#22C55E" strokeWidth={2} />
              </div>
              <span style={{
                fontSize: 13, fontWeight: 600, color: '#FFFFFF',
                fontFamily: 'var(--font-inter)', lineHeight: 1.25,
              }}>
                {title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Pied */}
      <div style={{
        padding: '0 24px calc(28px + env(safe-area-inset-bottom))',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
        position: 'relative', zIndex: 4,
        animation: 'onb-fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.35s both',
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {[0, 1, 2].map(i => (
            <span key={i} style={{
              width: i === 0 ? 22 : 7, height: 7, borderRadius: 4,
              background: i === 0 ? '#22C55E' : 'rgba(255,255,255,0.14)',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>

        <Link href="/auth/register" onClick={handleDismiss} style={{
          width: '100%', maxWidth: 360,
          padding: '17px 20px', borderRadius: 26,
          background: '#22C55E', color: '#04120A',
          border: 'none', textDecoration: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-inter)',
          boxShadow: '0 10px 30px rgba(34,197,94,0.28)',
        }}>
          Commencer <ArrowRight size={18} strokeWidth={2.5} />
        </Link>
      </div>

      <style>{`
        @keyframes onb-fade-up {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (min-width: 768px) {
          .onboarding-overlay { display: none !important; }
        }
      `}</style>
    </div>
  )
}
