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
        position: 'relative',
        overflow: 'hidden',
        minHeight: 'calc(100svh - var(--nav-height))',
        padding: '92px 0 42px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {STADIUM_IMAGES.map((img, i) => (
        <div
          key={img}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(90deg, rgba(0,24,12,0.94) 0%, rgba(0,60,30,0.82) 45%, rgba(0,30,15,0.42) 100%), url("${img}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: mounted && i === currentSlide ? 1 : 0,
            transition: 'opacity 1.4s ease',
            zIndex: 0,
          }}
        />
      ))}

      <div className="container-app hero-inner" style={{ position: 'relative', zIndex: 2 }}>
        <div className="hero-copy">
          <div className="hero-eyebrow" style={{ animation: mounted ? 'fadeInUp 0.45s ease both' : 'none' }}>
            <img src="/oncav-logo.png" alt="" />
            <span>Zone 6 Khombole · Navétanes 2026</span>
          </div>

          <h1 style={{ animation: mounted ? 'fadeInUp 0.55s 0.06s ease both' : 'none' }}>
            NavéStats
          </h1>

          <p className="hero-lead" style={{ animation: mounted ? 'fadeInUp 0.55s 0.12s ease both' : 'none' }}>
            Pronostics, résultats et classements des ASC de Khombole dans une expérience simple, rapide et pensée mobile.
          </p>

          <div className="hero-actions" style={{ animation: mounted ? 'fadeInUp 0.55s 0.18s ease both' : 'none' }}>
            <Link href={isAuthenticated ? '/matchs' : '/auth/register'} className="hero-primary">
              Pronostiquer maintenant
            </Link>
            <Link href="/matchs" className="hero-secondary">
              Voir les matchs
            </Link>
          </div>

          <div className="hero-stats" style={{ animation: mounted ? 'fadeInUp 0.55s 0.24s ease both' : 'none' }}>
            {[
              { label: 'Matchs', value: matchCount || '—' },
              { label: 'Équipes', value: '17' },
              { label: 'Joueurs', value: userCount || '—' },
            ].map(stat => (
              <div key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-side" aria-label="Aperçu des actions NavéStats" style={{ animation: mounted ? 'fadeInUp 0.55s 0.2s ease both' : 'none' }}>
          <div className="live-chip">
            <span />
            Matchs à suivre
          </div>
          <div className="side-score">
            <span>1</span>
            <small>N</small>
            <span>2</span>
          </div>
          <p>Pronostic rapide en 3 choix, classement actualisé et notifications de match.</p>
          <Link href="/classements">Voir le classement</Link>
        </div>
      </div>

      {mounted && (
        <div className="hero-dots" aria-label="Changer l'image de couverture">
          {STADIUM_IMAGES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentSlide(i)}
              aria-label={`Image ${i + 1}`}
              aria-current={i === currentSlide ? 'true' : undefined}
            />
          ))}
        </div>
      )}

      <style>{`
        .hero-inner {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(280px, 360px);
          gap: clamp(28px, 6vw, 80px);
          align-items: center;
        }

        .hero-copy {
          max-width: 720px;
        }

        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          margin-bottom: 22px;
          border: 1px solid rgba(255,255,255,0.22);
          border-radius: 8px;
          background: rgba(255,255,255,0.13);
          color: rgba(255,255,255,0.86);
          font-size: 0.78rem;
          font-weight: 850;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          backdrop-filter: blur(14px);
        }

        .hero-eyebrow img {
          width: 26px;
          height: 26px;
          object-fit: contain;
        }

        .hero-copy h1 {
          margin: 0;
          font-size: clamp(4rem, 10vw, 8.5rem);
          line-height: 0.86;
          font-weight: 950;
          letter-spacing: 0;
          color: white;
        }

        .hero-lead {
          max-width: 620px;
          margin: 26px 0 0;
          color: rgba(255,255,255,0.84);
          font-size: clamp(1.04rem, 2vw, 1.28rem);
          line-height: 1.6;
          font-weight: 520;
        }

        .hero-actions {
          display: flex;
          gap: 12px;
          margin-top: 32px;
          flex-wrap: wrap;
        }

        .hero-primary,
        .hero-secondary,
        .hero-side a {
          min-height: 48px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          padding: 0 18px;
          font-weight: 900;
          text-decoration: none;
          transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
        }

        .hero-primary {
          background: var(--gradient-gold);
          color: #2b1d00;
          box-shadow: 0 16px 32px rgba(251,191,0,0.22);
        }

        .hero-secondary {
          color: white;
          border: 1.5px solid rgba(255,255,255,0.35);
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(14px);
        }

        .hero-primary:hover,
        .hero-secondary:hover,
        .hero-side a:hover {
          transform: translateY(-1px);
        }

        .hero-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 140px));
          gap: 10px;
          margin-top: 34px;
        }

        .hero-stats div {
          padding: 12px 14px;
          border-left: 2px solid var(--color-accent);
          background: rgba(255,255,255,0.08);
        }

        .hero-stats strong,
        .hero-stats span {
          display: block;
        }

        .hero-stats strong {
          color: white;
          font-size: 1.6rem;
          line-height: 1;
          font-weight: 950;
        }

        .hero-stats span {
          margin-top: 4px;
          color: rgba(255,255,255,0.66);
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .hero-side {
          padding: 22px;
          border: 1px solid rgba(255,255,255,0.22);
          border-radius: 10px;
          background: rgba(255,255,255,0.12);
          color: white;
          backdrop-filter: blur(18px);
          box-shadow: 0 24px 70px rgba(0,0,0,0.22);
        }

        .live-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 10px;
          border-radius: 999px;
          color: rgba(255,255,255,0.86);
          background: rgba(255,255,255,0.12);
          font-size: 0.76rem;
          font-weight: 850;
        }

        .live-chip span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--color-red-light);
          box-shadow: 0 0 0 6px rgba(232,0,45,0.16);
        }

        .side-score {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 14px;
          margin: 28px 0 18px;
        }

        .side-score span,
        .side-score small {
          min-height: 58px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: white;
          color: var(--color-primary);
          font-size: 1.5rem;
          font-weight: 950;
        }

        .side-score small {
          width: 48px;
          background: var(--color-accent);
          color: #2b1d00;
        }

        .hero-side p {
          margin: 0 0 20px;
          color: rgba(255,255,255,0.76);
          line-height: 1.55;
          font-size: 0.92rem;
        }

        .hero-side a {
          width: 100%;
          background: rgba(255,255,255,0.94);
          color: var(--color-primary);
        }

        .hero-dots {
          position: absolute;
          left: 50%;
          bottom: 16px;
          transform: translateX(-50%);
          z-index: 4;
          display: flex;
          gap: 8px;
        }

        .hero-dots button {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 0;
          background: transparent;
          cursor: pointer;
        }

        .hero-dots button::after {
          content: '';
          width: 20px;
          height: 4px;
          border-radius: 99px;
          background: rgba(255,255,255,0.34);
          transition: width 0.25s ease, background 0.25s ease;
        }

        .hero-dots button[aria-current="true"]::after {
          width: 32px;
          background: var(--color-accent);
        }

        @media (max-width: 860px) {
          .hero-section {
            min-height: calc(100svh - var(--nav-height)) !important;
            padding: 76px 0 84px !important;
            align-items: flex-start !important;
          }

          .hero-inner {
            grid-template-columns: 1fr;
            gap: 22px;
          }

          .hero-side {
            display: none;
          }

          .hero-copy h1 {
            font-size: clamp(4rem, 18vw, 5.6rem);
          }

          .hero-lead {
            max-width: 360px;
            margin-top: 18px;
            font-size: 1rem;
          }

          .hero-actions {
            margin-top: 26px;
          }

          .hero-primary,
          .hero-secondary {
            width: 100%;
          }

          .hero-stats {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            margin-top: 24px;
          }

          .hero-stats div {
            padding: 10px 8px;
          }

          .hero-stats strong {
            font-size: 1.18rem;
          }

          .hero-stats span {
            font-size: 0.62rem;
          }
        }

        @media (max-width: 640px) {
          .hero-eyebrow {
            max-width: 100%;
            padding: 7px 10px;
            font-size: 0.66rem;
          }

          .hero-eyebrow img {
            width: 22px;
            height: 22px;
          }
        }
      `}</style>
    </section>
  )
}
