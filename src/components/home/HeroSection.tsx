'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { ArrowRight, Zap, Users, Radio, Trophy, CalendarDays } from 'lucide-react'

interface HeroSectionProps {
  matchCount: number
  userCount: number
  isAuthenticated: boolean
}

const SLIDES = [
  '/stadium/stadium1.jpg',
  '/stadium/stadium2.jpg',
  '/stadium/stadium3.jpg',
  '/stadium/stadium4.jpg',
]

const TICKER = [
  'LA PLATEFORME OFFICIELLE DES NAVÉTANES',
  'PRONOSTIQUEZ · GAGNEZ DES POINTS · GRIMPEZ AU CLASSEMENT',
  'CHAMPIONNAT SENIOR · ZONE 6 · KHOMBOLE',
  'CHAMPIONNAT CADETS · CNP 2026',
]

export default function HeroSection({ matchCount, userCount, isAuthenticated }: HeroSectionProps) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setCurrent(c => (c + 1) % SLIDES.length), 7000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="hero-v6" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Backgrounds — crossfading stadium floods */}
      {SLIDES.map((img, i) => (
        <div key={i} style={{
          position: 'absolute', inset: 0,
          opacity: i === current ? 1 : 0,
          transition: 'opacity 1.6s ease',
        }}>
          <img
            src={img}
            alt=""
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center 30%',
              transform: i === current ? 'scale(1.05)' : 'scale(1.12)',
              transition: 'transform 8s var(--ease-out)',
              filter: 'saturate(0.55) contrast(1.1) brightness(0.6)',
            }}
          />
        </div>
      ))}

      {/* Night overlay — pitch under floodlights */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(100deg, rgba(3,10,7,0.96) 0%, rgba(3,10,7,0.72) 40%, rgba(3,16,10,0.45) 70%, rgba(3,12,8,0.8) 100%)',
      }} />
      {/* Floodlight glows */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(560px 420px at 78% -10%, rgba(42,255,160,0.16), transparent 65%),
          radial-gradient(480px 360px at 8% -18%, rgba(0,196,106,0.12), transparent 60%),
          radial-gradient(700px 500px at 100% 115%, rgba(42,255,160,0.08), transparent 60%)`,
      }} />
      {/* Pitch grid texture */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.5,
        backgroundImage: `
          linear-gradient(rgba(42,255,160,0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(42,255,160,0.05) 1px, transparent 1px)`,
        backgroundSize: '64px 64px',
        maskImage: 'linear-gradient(180deg, transparent 0%, #000 30%, #000 70%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, #000 30%, #000 70%, transparent 100%)',
        pointerEvents: 'none',
      }} />
      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        boxShadow: 'inset 0 0 180px rgba(0,0,0,0.75)',
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div className="hero-v6-inner" style={{
        position: 'relative', zIndex: 2,
        maxWidth: 1280, margin: '0 auto',
        padding: 'clamp(72px, 10vw, 130px) 16px clamp(90px, 12vw, 150px)',
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
      }}>
        {/* Eyebrow badge */}
        <div className="hero-v6-eyebrow" style={{
          display: 'inline-flex', alignItems: 'center', gap: 9,
          padding: '7px 15px', borderRadius: 999,
          background: 'rgba(42,255,160,0.08)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border: '1px solid rgba(42,255,160,0.24)',
          marginBottom: 22,
          animation: 'heroV6In 0.7s 0.05s var(--ease-out) both',
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: 'var(--color-primary)',
            boxShadow: '0 0 12px var(--color-primary)',
            animation: 'pulse-live 1.2s ease-in-out infinite',
          }} />
          <span style={{
            fontSize: '0.62rem', fontWeight: 700,
            fontFamily: 'var(--font-display)',
            color: 'var(--color-primary)',
            textTransform: 'uppercase', letterSpacing: '0.14em',
          }}>Navétanes 2026 · Zone 6 · Khombole</span>
        </div>

        {/* Display title */}
        <h1 className="hero-v6-title" style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 'clamp(2.6rem, 7.5vw, 5rem)',
          color: '#ffffff',
          lineHeight: 0.98,
          letterSpacing: '-0.035em',
          textTransform: 'uppercase',
          marginBottom: 18,
          textShadow: '0 8px 48px rgba(0,0,0,0.6)',
          animation: 'heroV6In 0.8s 0.15s var(--ease-out) both',
        }}>
          La nuit des
          <br />
          <span className="hero-v6-glow" style={{
            background: 'linear-gradient(120deg, #6dffc2 0%, #2affa0 45%, #ffc94d 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            filter: 'drop-shadow(0 0 28px rgba(42,255,160,0.4))',
          }}>Navétanes</span>
        </h1>

        {/* Subtitle */}
        <p className="hero-v6-sub" style={{
          fontSize: 'clamp(0.92rem, 2vw, 1.1rem)',
          color: 'rgba(236,246,241,0.78)',
          maxWidth: 520,
          lineHeight: 1.65,
          marginBottom: 30,
          animation: 'heroV6In 0.8s 0.28s var(--ease-out) both',
        }}>
          Pronostiquez les matchs, suivez les résultats en direct et faites monter votre
          quartier au sommet du classement des Navétanes de Khombole.
        </p>

        {/* CTAs */}
        <div className="hero-v6-ctas" style={{
          display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
          marginBottom: 44,
          animation: 'heroV6In 0.8s 0.4s var(--ease-out) both',
        }}>
          <Link href={isAuthenticated ? '/pronostics' : '/matchs'} className="hero-v6-cta-primary" style={{
            display: 'inline-flex', alignItems: 'center', gap: 9,
            padding: '14px 30px', borderRadius: 14,
            background: 'var(--gradient-green)',
            color: 'var(--color-text-on-primary)',
            textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem',
            fontFamily: 'var(--font-display)',
            boxShadow: '0 10px 32px rgba(42,255,160,0.35)',
            transition: 'all var(--transition-base) var(--ease-out)',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 44px rgba(42,255,160,0.45)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(42,255,160,0.35)' }}
          >
            {isAuthenticated ? 'Mes pronostics' : 'Voir les matchs'} <ArrowRight size={16} />
          </Link>
          {!isAuthenticated && (
            <Link href="/auth/register" className="hero-v6-cta-ghost" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '13px 26px', borderRadius: 14,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.16)',
              backdropFilter: 'blur(12px)',
              color: 'rgba(255,255,255,0.9)',
              textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem',
              fontFamily: 'var(--font-display)',
              transition: 'all var(--transition-base) var(--ease-out)',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.borderColor = 'rgba(42,255,160,0.4)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)' }}
            >
              Créer un compte
            </Link>
          )}
        </div>

        {/* Stat chips */}
        <div className="hero-v6-stats" style={{
          display: 'flex', gap: 10, flexWrap: 'wrap',
          animation: 'heroV6In 0.8s 0.52s var(--ease-out) both',
        }}>
          {[
            { icon: CalendarDays, value: matchCount, label: 'matchs' },
            { icon: Users, value: userCount, label: 'fans' },
            { icon: Radio, value: 'LIVE', label: 'direct', isLive: true },
            { icon: Trophy, value: 'Zone 6', label: 'compétition' },
          ].map((s, i) => (
            <div key={i} className="hero-v6-stat" style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 16px', borderRadius: 13,
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              transition: 'all 0.2s',
            }}>
              <s.icon size={16} color={s.isLive ? 'var(--color-red)' : 'var(--color-primary)'} />
              <span style={{
                fontSize: '0.86rem', fontWeight: 700, fontFamily: 'var(--font-mono)',
                color: s.isLive ? '#ff8a94' : 'white',
              }}>{s.value}</span>
              <span style={{
                fontSize: '0.62rem', color: 'rgba(236,246,241,0.55)',
                fontWeight: 600, fontFamily: 'var(--font-display)', textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom ticker */}
      <div className="hero-v6-ticker" style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 3,
        background: 'rgba(3,10,7,0.72)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(42,255,160,0.14)',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', width: 'max-content',
          animation: 'heroV6Ticker 34s linear infinite',
          padding: '9px 0',
        }}>
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              paddingRight: 32,
              fontSize: '0.62rem', fontWeight: 600,
              fontFamily: 'var(--font-display)',
              color: 'rgba(236,246,241,0.6)',
              letterSpacing: '0.16em', textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}>
              <span style={{
                width: 5, height: 5, borderRadius: '50%',
                background: 'var(--color-primary)',
                boxShadow: '0 0 8px var(--color-primary)',
              }} />
              {t}
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes heroV6In {
          from { opacity: 0; transform: translateY(22px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroV6Ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .hero-v6-stat:hover {
          border-color: rgba(42,255,160,0.35) !important;
          transform: translateY(-2px);
        }
        .hero-v6-cta-primary:active, .hero-v6-cta-ghost:active { transform: scale(0.98) !important; }
        @media (max-width: 640px) {
          .hero-v6-ticker { display: none; }
          .hero-v6-inner { padding-left: 14px !important; padding-right: 14px !important; }
        }
      `}</style>
    </section>
  )
}
