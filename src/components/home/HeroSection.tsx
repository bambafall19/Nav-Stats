'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useMemo, useState, useEffect } from 'react'

interface HeroSectionProps {
  matchCount: number
  userCount: number
  isAuthenticated: boolean
}

export default function HeroSection({ matchCount, userCount, isAuthenticated }: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  
  const slides = useMemo(() => [
    {
      title: "Bienvenue sur NavéStats",
      subtitle: "La plateforme de pronostics des Navétanes de Khombole",
      cta: "Commencer maintenant",
      href: "/matchs",
      emoji: "⚽",
      gradient: "linear-gradient(135deg, #006233 0%, #00A651 50%, #39FF14 100%)"
    },
    {
      title: "Pronostiquez les matchs",
      subtitle: `+${matchCount} matchs à venir · Gagnez des points`,
      cta: "Voir les matchs",
      href: "/matchs",
      emoji: "🎯",
      gradient: "linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)"
    },
    {
      title: "Rejoignez la communauté",
      subtitle: `+${userCount} pronostiqueurs actifs`,
      cta: "Créer un compte",
      href: "/auth/register",
      emoji: "👥",
      gradient: "linear-gradient(135deg, #B91C1C 0%, #E8002D 100%)"
    }
  ], [matchCount, userCount])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  return (
    <section className="hero-section" style={{ position: 'relative', overflow: 'hidden', minHeight: '320px', display: 'flex', alignItems: 'center' }}>
      {/* Background Image with Overlay */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <Image
          src="/stadium/stadium1.jpg"
          alt="Stade de football"
          fill
          priority
          className="hero-bg-image"
          style={{ objectFit: 'cover', filter: 'brightness(0.3)' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: slides[currentSlide].gradient, opacity: 0.85, mixBlendMode: 'multiply' }} />
      </div>

      {/* Content */}
      <div className="container-app hero-content" style={{ position: 'relative', zIndex: 2, padding: '40px 0' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}
        >
          {/* Badge */}
          <motion.div
            className="hero-badge"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 20px',
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(255,255,255,0.2)',
              marginBottom: 24,
              color: 'white',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>🏆</span>
            <span>Navétanes de Khombole 2026</span>
          </motion.div>

          <div className="mobile-hero-copy">
            <div className="mobile-hero-kicker">NavéStats Khombole</div>
            <h1>Prédisez le vainqueur</h1>
            <p>Choisissez une équipe ou le nul, gagnez des points et grimpez au classement.</p>
          </div>

          {/* Main Title */}
        <motion.h1
          className="hero-title"
          key={currentSlide}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 900,
            color: 'white',
            marginBottom: 12,
            lineHeight: 1.1,
            textShadow: '0 4px 20px rgba(0,0,0,0.3)',
            fontFamily: 'var(--font-outfit)',
            letterSpacing: 0,
          }}
        >
          {slides[currentSlide].emoji} {slides[currentSlide].title}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="hero-subtitle"
          key={`subtitle-${currentSlide}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
            color: 'rgba(255,255,255,0.9)',
            marginBottom: 24,
            maxWidth: 500,
            margin: '0 auto 24px',
            lineHeight: 1.5,
          }}
        >
          {slides[currentSlide].subtitle}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <Link
            href={slides[currentSlide].href}
            style={{
              padding: '12px 28px',
              background: 'white',
              color: '#006233',
              borderRadius: 'var(--radius-full)',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)'
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)'
            }}
          >
            {slides[currentSlide].cta}
            <span>→</span>
          </Link>

          {!isAuthenticated && (
            <Link
              href="/auth/login"
              style={{
                padding: '12px 28px',
                background: 'transparent',
                color: 'white',
                border: '2px solid rgba(255,255,255,0.4)',
                borderRadius: 'var(--radius-full)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                transition: 'all 0.3s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'
              }}
            >
              Se connecter
            </Link>
          )}
        </motion.div>

        {/* Stats Row */}
        <motion.div
          className="hero-stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            display: 'flex',
            gap: 24,
            justifyContent: 'center',
            marginTop: 36,
            flexWrap: 'wrap',
          }}
        >
          {[
            { label: 'Matchs', value: matchCount, icon: '⚽' },
            { label: 'Pronostiqueurs', value: userCount, icon: '👥' },
            { label: 'Équipes', value: '17', icon: '🏆' },
          ].map((stat, i) => (
            <div key={i} className="hero-stat" style={{ textAlign: 'center', color: 'white' }}>
              <div className="hero-stat-icon" style={{ fontSize: '1.5rem', marginBottom: 2 }}>{stat.icon}</div>
              <div className="hero-stat-value" style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', fontWeight: 900, fontFamily: 'var(--font-outfit)' }}>
                {stat.value}
              </div>
              <div className="hero-stat-label" style={{ fontSize: '0.75rem', opacity: 0.8, fontWeight: 500 }}>{stat.label}</div>
            </div>
          ))}
        </motion.div>
        </motion.div>

        {/* Slide Indicators */}
        <div className="hero-dots" style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 3 }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              style={{
                width: i === currentSlide ? 32 : 8,
                height: 8,
                borderRadius: 'var(--radius-full)',
                background: i === currentSlide ? 'white' : 'rgba(255,255,255,0.4)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: 0,
              }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <style>{`
        .hero-section {
          position: relative;
        }
        .hero-bg-image {
          user-select: none;
          -webkit-user-drag: none;
        }
        @media (max-width: 640px) {
          .hero-section {
            min-height: 280px !important;
            align-items: flex-end !important;
            border-bottom-left-radius: 24px;
            border-bottom-right-radius: 24px;
          }
          .hero-section::after {
            content: '';
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            height: 55%;
            background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.7));
            z-index: 1;
          }
          .hero-content {
            padding-top: 20px !important;
            padding-bottom: 24px !important;
          }
          .mobile-hero-copy {
            display: block;
            max-width: 300px;
            margin: 0 auto;
          }
          .mobile-hero-kicker {
            display: inline-flex;
            align-items: center;
            height: 26px;
            padding: 0 10px;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.16);
            border: 1px solid rgba(255, 255, 255, 0.16);
            color: rgba(255, 255, 255, 0.88);
            font-family: var(--font-outfit);
            font-size: 0.68rem;
            font-weight: 800;
            text-transform: uppercase;
          }
          .mobile-hero-copy h1 {
            margin: 10px auto 6px;
            color: white;
            font-family: var(--font-outfit);
            font-size: 1.6rem !important;
            line-height: 1.02 !important;
            font-weight: 950;
            letter-spacing: 0 !important;
            text-shadow: 0 5px 22px rgba(0, 0, 0, 0.42);
          }
          .mobile-hero-copy p {
            max-width: 260px;
            margin: 0 auto 12px !important;
            color: rgba(255, 255, 255, 0.84) !important;
            font-size: 0.85rem !important;
            line-height: 1.4 !important;
          }
          .hero-badge {
            display: none !important;
          }
          .hero-title {
            display: none !important;
          }
          .hero-subtitle {
            display: none !important;
          }
          .hero-actions {
            gap: 8px !important;
          }
          .hero-actions a {
            min-height: 38px !important;
            padding: 10px 16px !important;
            font-size: 0.82rem !important;
            border-radius: 999px !important;
          }
          .hero-actions a[href="/auth/login"] {
            display: none !important;
          }
          .hero-stats {
            width: min(100%, 300px);
            margin: 14px auto 0 !important;
            gap: 0 !important;
            justify-content: stretch !important;
            flex-wrap: nowrap !important;
            background: rgba(255, 255, 255, 0.12);
            border: 1px solid rgba(255, 255, 255, 0.16);
            border-radius: 16px;
            padding: 6px;
            backdrop-filter: blur(14px);
          }
          .hero-stat {
            flex: 1 1 0;
            min-width: 0;
          }
          .hero-stat-icon {
            font-size: 0.9rem !important;
            margin-bottom: 1px !important;
          }
          .hero-stat-value {
            font-size: 1rem !important;
            line-height: 1 !important;
          }
          .hero-stat-label {
            font-size: 0.58rem !important;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            opacity: 0.78 !important;
          }
          .hero-dots {
            display: none !important;
          }
        }
        @media (min-width: 641px) {
          .mobile-hero-copy {
            display: none;
          }
        }
      `}</style>
    </section>
  )
}
