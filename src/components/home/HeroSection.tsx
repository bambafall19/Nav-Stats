'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const STADIUM_IMAGES = [
  '/stadium/stadium1.jpg',
  '/stadium/stadium2.jpg',
  '/stadium/stadium3.jpg',
  '/stadium/stadium4.jpg',
]

export default function HeroSection({ matchCount, userCount, isAuthenticated = false }: { matchCount: number; userCount: number; isAuthenticated?: boolean }) {
  const [mounted, setMounted] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % STADIUM_IMAGES.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section
      id="hero-section"
      className="hero-section"
      style={{
        padding: '100px 0 80px',
        position: 'relative',
        overflow: 'hidden',
        minHeight: 520,
      }}
    >
      {/* Slideshow backgrounds */}
      {STADIUM_IMAGES.map((img, i) => (
        <div
          key={img}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(to bottom, rgba(0,60,30,0.82), rgba(0,30,15,0.96)), url("${img}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: mounted && i === currentSlide ? 1 : 0,
            transition: 'opacity 1.4s ease',
            zIndex: 0,
          }}
        />
      ))}

      {/* Slide dots */}
      {mounted && (
        <div style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 8,
          zIndex: 5,
        }}>
          {STADIUM_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              aria-label={`Slide ${i + 1}`}
              style={{
                width: i === currentSlide ? 24 : 12,
                height: 12,
                borderRadius: 'var(--radius-full)',
                background: i === currentSlide ? 'var(--color-accent)' : 'rgba(255,255,255,0.4)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.4s ease',
                padding: 0,
                minHeight: '44px',
                minWidth: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
          ))}
        </div>
      )}

      {/* Floating balls */}
      {mounted && (
        <>
          {[
            { top: '15%', left: '8%', size: 40, delay: '0s' },
            { top: '70%', left: '5%', size: 28, delay: '1s' },
            { top: '20%', right: '10%', size: 50, delay: '0.5s' },
            { top: '65%', right: '8%', size: 32, delay: '1.5s' },
          ].map((ball, i) => (
            <div key={i} className="animate-float" style={{
              position: 'absolute',
              ...ball,
              width: ball.size,
              height: ball.size,
              fontSize: ball.size * 0.7,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animationDelay: ball.delay,
              opacity: 0.45,
              zIndex: 1,
            }}>⚽</div>
          ))}
        </>
      )}

      <div className="container-app" style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: 'var(--radius-full)',
          padding: '6px 16px',
          marginBottom: 24,
          animation: mounted ? 'fadeInUp 0.5s ease' : 'none',
        }}>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.9)', fontWeight: 600, letterSpacing: '0.08em' }}>
            🇸🇳 NAVÉTANES KHOMBOLE 2026
          </span>
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: 'var(--font-outfit)',
          fontSize: 'clamp(2rem, 6vw, 3.5rem)',
          fontWeight: 900,
          color: 'white',
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          marginBottom: 16,
          animation: mounted ? 'fadeInUp 0.6s 0.1s ease both' : 'none',
        }}>
          Pronostique.{' '}
          <span style={{ color: 'var(--color-accent)' }}>Analyse.</span>
          <br />Domine le classement.
        </h1>

        <p style={{
          fontSize: 'clamp(1rem, 2.5vw, 1.15rem)',
          color: 'rgba(255,255,255,0.85)',
          maxWidth: 560,
          margin: '0 auto 32px',
          lineHeight: 1.6,
          animation: mounted ? 'fadeInUp 0.6s 0.2s ease both' : 'none',
        }}>
          <strong style={{ color: 'white' }}>Bonjour</strong> 👋
          <br />
          La première plateforme communautaire de pronostics et statistiques des Navétanes de Khombole.
          Gagne des points, débloque des badges et grimpe dans le classement !
        </p>

        {/* Stats band */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 'clamp(16px, 4vw, 48px)',
          marginBottom: 36,
          animation: mounted ? 'fadeInUp 0.6s 0.3s ease both' : 'none',
          flexWrap: 'wrap',
        }}>
          {[
            { label: "Matchs à suivre", value: matchCount, icon: '⚽' },
            { label: 'Équipes', value: '17', icon: '🛡️' },
            { label: 'Pronostiqueurs', value: userCount || '—', icon: '👥' },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white', fontFamily: 'var(--font-outfit)', letterSpacing: '-0.03em', lineHeight: 1 }}>
                {stat.icon} {stat.value}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginTop: 4, fontWeight: 500 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div style={{
          display: 'flex',
          gap: 12,
          justifyContent: 'center',
          flexWrap: 'wrap',
          animation: mounted ? 'fadeInUp 0.6s 0.4s ease both' : 'none',
        }}>
          <Link href={isAuthenticated ? '/matchs' : '/auth/register'} className="btn btn-accent btn-lg" style={{ textDecoration: 'none' }}>
            Pronostiquer
          </Link>
          <Link href="/matchs" className="btn btn-lg" style={{
            textDecoration: 'none',
            background: 'rgba(255,255,255,0.15)',
            color: 'white',
            border: '1.5px solid rgba(255,255,255,0.4)',
            backdropFilter: 'blur(10px)',
          }}>
            Voir les matchs
          </Link>
        </div>
      </div>
      <style>{`
        @media (max-width: 640px) {
          .hero-section {
            min-height: 440px !important;
            padding: 72px 0 56px !important;
          }
        }
      `}</style>
    </section>
  )
}
