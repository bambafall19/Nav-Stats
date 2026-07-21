'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

interface HeroSectionProps {
  matchCount: number
  userCount: number
  isAuthenticated: boolean
}

export default function HeroSection({ matchCount, userCount, isAuthenticated }: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  
  const slides = [
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
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  return (
    <section className="hero-section" style={{ position: 'relative', overflow: 'hidden', minHeight: '520px', display: 'flex', alignItems: 'center' }}>
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
      <div className="container-app" style={{ position: 'relative', zIndex: 2, padding: '60px 0' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}
        >
          {/* Badge */}
          <motion.div
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

          {/* Main Title */}
          <motion.h1
            key={currentSlide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              fontWeight: 900,
              color: 'white',
              marginBottom: 16,
              lineHeight: 1.1,
              textShadow: '0 4px 20px rgba(0,0,0,0.3)',
              fontFamily: 'var(--font-outfit)',
              letterSpacing: '-0.03em',
            }}
          >
            {slides[currentSlide].emoji} {slides[currentSlide].title}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            key={`subtitle-${currentSlide}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.35rem)',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: 32,
              maxWidth: 600,
              margin: '0 auto 32px',
              lineHeight: 1.6,
            }}
          >
            {slides[currentSlide].subtitle}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link
              href={slides[currentSlide].href}
              style={{
                padding: '16px 40px',
                background: 'white',
                color: '#006233',
                borderRadius: 'var(--radius-full)',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '1.05rem',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
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
                  padding: '16px 40px',
                  background: 'transparent',
                  color: 'white',
                  border: '2px solid rgba(255,255,255,0.4)',
                  borderRadius: 'var(--radius-full)',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '1.05rem',
                  transition: 'all 0.3s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{
              display: 'flex',
              gap: 32,
              justifyContent: 'center',
              marginTop: 48,
              flexWrap: 'wrap',
            }}
          >
            {[
              { label: 'Matchs', value: matchCount, icon: '⚽' },
              { label: 'Pronostiqueurs', value: userCount, icon: '👥' },
              { label: 'Équipes', value: '17', icon: '🏆' },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center', color: 'white' }}>
                <div style={{ fontSize: '2rem', marginBottom: 4 }}>{stat.icon}</div>
                <div style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900, fontFamily: 'var(--font-outfit)' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.85rem', opacity: 0.8, fontWeight: 500 }}>{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Slide Indicators */}
        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 3 }}>
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
            min-height: 480px !important;
          }
        }
      `}</style>
    </section>
  )
}