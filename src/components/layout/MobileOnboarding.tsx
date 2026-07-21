'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const ONBOARDING_STEPS = [
  {
    title: 'Navétanes Khombole 2026',
    subtitle: '🇸🇳 ZONE 6 KHOMBOLE',
    description: 'Suivez les scores, calendriers et classements en direct avec la communauté.',
    image: '/stadium/stadium4.jpg',
    icon: '⚽',
    gradient: 'linear-gradient(135deg, #00A651 0%, #006233 100%)', // Bright vibrant green
  },
  {
    title: 'Pronostiquez les Scores',
    subtitle: '🔮 JEU DE PRONOSTICS',
    description: 'Devinez les scores des matchs, gagnez des points et comparez vos analyses.',
    image: '/stadium/stadium2.jpg',
    icon: '🎯',
    gradient: 'linear-gradient(135deg, #FBBF00 0%, #D4A000 100%)', // Vibrant gold
  },
  {
    title: 'Gagnez des Badges',
    subtitle: '🏆 SUPPORTER LÉGENDAIRE',
    description: 'Cumulez des points à chaque bon pronostic et débloquez des badges exclusifs.',
    image: '/stadium/stadium3.jpg',
    icon: '👑',
    gradient: 'linear-gradient(135deg, #E8002D 0%, #A3001C 100%)', // Vibrant red
  },
]

export default function MobileOnboarding() {
  const [show, setShow] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const isMobile = window.innerWidth < 768
    if (isMobile) {
      setShow(true)
    }
  }, [])

  const handleDismiss = () => {
    setFadeOut(true)
    setTimeout(() => {
      setShow(false)
    }, 400)
  }

  if (!show) return null

  const step = ONBOARDING_STEPS[activeStep]

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: '#FFFFFF', // Clean bright white background
        display: 'flex',
        flexDirection: 'column',
        opacity: fadeOut ? 0 : 1,
        transform: fadeOut ? 'scale(1.05)' : 'scale(1)',
        transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden',
      }}
    >
      {/* Top Header */}
      <div
        style={{
          position: 'absolute',
          top: 48,
          left: 24,
          right: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img
            src="/logo.png"
            alt="Logo"
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              border: '2px solid white',
            }}
          />
          <div>
            <span style={{ display: 'block', fontFamily: 'var(--font-outfit)', fontWeight: 900, color: 'white', fontSize: '1.25rem', letterSpacing: '-0.02em', lineHeight: 1.1, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
              NavéStats
            </span>
            <span style={{ fontSize: '0.65rem', color: '#FBBF00', fontWeight: 800, letterSpacing: '0.08em', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
              KHOMBOLE
            </span>
          </div>
        </div>
        
        <button
          onClick={handleDismiss}
          style={{
            background: 'rgba(255, 255, 255, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            borderRadius: 'var(--radius-full)',
            color: 'white',
            padding: '8px 16px',
            fontSize: '0.8rem',
            fontWeight: 800,
            cursor: 'pointer',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          }}
        >
          Passer
        </button>
      </div>

      {/* Top Half: Stadium View & Big Illustration (Bright & Colorful) */}
      <div
        style={{
          height: '56%',
          position: 'relative',
          width: '100%',
          borderBottomLeftRadius: '36px',
          borderBottomRightRadius: '36px',
          background: step.gradient,
          overflow: 'hidden',
          boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
        }}
      >
        {/* Stadium Image Overlay with bright opacity */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url("${step.image}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.28,
            mixBlendMode: 'overlay',
          }}
        />

        {/* Soft clouds overlay to exactly match WalkWin */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '-10%',
          width: '120%',
          height: '40%',
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.15) 0%, transparent 80%)',
          pointerEvents: 'none',
        }} />

        {/* Central visual representation */}
        <div
          style={{
            position: 'absolute',
            top: '55%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 2,
          }}
        >
          {/* Big White Circular Card containing the emoji (Vibrant & Soft) */}
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: '50%',
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '4.8rem',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.16)',
              border: '4px solid rgba(255, 255, 255, 0.4)',
              animation: 'bounce-ultra 3s ease-in-out infinite',
            }}
          >
            {step.icon}
          </div>

          <span
            style={{
              marginTop: 20,
              padding: '6px 16px',
              background: 'rgba(255, 255, 255, 0.9)',
              color: '#0F172A',
              fontWeight: 900,
              fontSize: '0.72rem',
              borderRadius: 'var(--radius-full)',
              letterSpacing: '0.08em',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }}
          >
            {step.subtitle}
          </span>
        </div>
      </div>

      {/* Bottom Half: Bright white integrated content card */}
      <div
        style={{
          flex: 1,
          background: '#FFFFFF',
          padding: '24px 24px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 4,
        }}
      >
        {/* Onboarding text copy */}
        <div style={{ textAlign: 'center' }}>
          <h2
            style={{
              fontFamily: 'var(--font-outfit)',
              fontSize: '2.1rem',
              fontWeight: 900,
              color: '#0F172A', // Deep dark slate
              lineHeight: 1.15,
              marginBottom: 12,
              letterSpacing: '-0.03em',
            }}
          >
            {step.title}
          </h2>
          <p
            style={{
              fontSize: '0.95rem',
              color: '#475569', // Clean slate-600
              lineHeight: 1.6,
              maxWidth: 300,
              margin: '0 auto',
            }}
          >
            {step.description}
          </p>
        </div>

        {/* Indicators and buttons */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 28 }}>
          
          {/* Active indicators */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
            {ONBOARDING_STEPS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                aria-label={`Slide ${idx + 1}`}
                style={{
                  width: idx === activeStep ? 28 : 8,
                  height: 6,
                  borderRadius: 'var(--radius-full)',
                  background: idx === activeStep ? '#00A651' : '#E2E8F0',
                  border: 'none',
                  transition: 'all 0.3s ease',
                  padding: 0,
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
            {activeStep < ONBOARDING_STEPS.length - 1 ? (
              <button
                onClick={() => setActiveStep(prev => prev + 1)}
                style={{
                  width: '100%',
                  padding: '18px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--gradient-green)',
                  color: 'white',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  fontFamily: 'var(--font-outfit)',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-green)',
                  transition: 'transform 0.15s ease',
                }}
              >
                Suivant →
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Link
                  href="/auth/register"
                  onClick={handleDismiss}
                  style={{
                    width: '100%',
                    padding: '18px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--gradient-green)',
                    color: 'white',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    fontFamily: 'var(--font-outfit)',
                    textDecoration: 'none',
                    textAlign: 'center',
                    boxShadow: 'var(--shadow-green)',
                  }}
                >
                  🚀 Rejoindre l'aventure
                </Link>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 10 }}>
                  <Link
                    href="/auth/login"
                    onClick={handleDismiss}
                    style={{
                      padding: '16px',
                      borderRadius: 'var(--radius-full)',
                      background: '#F8FAFC',
                      color: '#0F172A',
                      border: '1.5px solid #E2E8F0',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      fontFamily: 'var(--font-outfit)',
                      textDecoration: 'none',
                      textAlign: 'center',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                    }}
                  >
                    🔑 Connexion
                  </Link>

                  <button
                    onClick={handleDismiss}
                    style={{
                      padding: '16px',
                      borderRadius: 'var(--radius-full)',
                      background: 'transparent',
                      color: '#64748B',
                      border: '1.5px solid #E2E8F0',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      fontFamily: 'var(--font-outfit)',
                      cursor: 'pointer',
                    }}
                  >
                    Visiter le site
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce-ultra {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-12px) scale(1.03); }
        }
      `}</style>
    </div>
  )
}
