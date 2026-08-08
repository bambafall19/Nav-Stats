'use client'

import Link from 'next/link'
import { Trophy, Target, BarChart3, MessageCircle, Home, Mail, MapPin, ArrowUp } from 'lucide-react'
import { useT } from '@/lib/i18n/LanguageProvider'

const footerNav = [
  { href: '/', labelKey: 'nav.accueil', icon: Home },
  { href: '/matchs', labelKey: 'nav.matchs', icon: Target },
  { href: '/classements', labelKey: 'nav.classements', icon: Trophy },
  { href: '/statistiques', labelKey: 'nav.senior', icon: BarChart3 },
  { href: '/communaute', labelKey: 'nav.chat', icon: MessageCircle },
]

const footerLinks = [
  { href: '/pronostics', labelKey: 'footer.mesPronostics' },
  { href: '/auth/register', labelKey: 'footer.creerCompte' },
  { href: '/auth/login', labelKey: 'footer.seConnecter' },
]

export default function Footer() {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  const t = useT()

  return (
    <footer className="site-footer" style={{
      background: 'var(--color-bg-secondary)',
      color: 'rgba(255,255,255,0.75)',
      marginTop: 40,
      position: 'relative',
    }}>
      {/* Top accent line */}
      <div style={{ height: 3, background: 'var(--gradient-green)' }} />

      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '40px 20px 28px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr 1fr',
          gap: 32,
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'var(--gradient-green)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', flexShrink: 0,
              }}>
                <img src="/logo.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} />
              </div>
              <span style={{
                fontFamily: 'var(--font-plus-jakarta)',
                fontWeight: 800, fontSize: '1.15rem',
                color: 'white', letterSpacing: '-0.03em',
              }}>NavéStats</span>
            </div>
            <p style={{ fontSize: '0.78rem', lineHeight: 1.6, marginBottom: 16, maxWidth: 320 }}>
              {t('footer.description')}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.72rem' }}>
                <MapPin size={13} color="var(--color-primary)" /> Khombole, Sénégal
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.72rem' }}>
                <Mail size={13} color="var(--color-primary)" /> contact@navestats.site
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 style={{
              fontFamily: 'var(--font-plus-jakarta)',
              fontSize: '0.72rem', fontWeight: 800,
              color: 'white', textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: 14,
            }}>{t('footer.navigation')}</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {footerNav.map(link => (
                <li key={link.href}>
                  <Link href={link.href} style={{
                    color: 'rgba(255,255,255,0.7)', fontSize: '0.76rem',
                    textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
                    transition: 'color 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                  >
                    <link.icon size={12} opacity={0.6} /> {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Liens utiles */}
          <div>
            <h4 style={{
              fontFamily: 'var(--font-plus-jakarta)',
              fontSize: '0.72rem', fontWeight: 800,
              color: 'white', textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: 14,
            }}>{t('footer.links')}</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {footerLinks.map(link => (
                <li key={link.href + link.labelKey}>
                  <Link href={link.href} style={{
                    color: 'rgba(255,255,255,0.7)', fontSize: '0.76rem',
                    textDecoration: 'none',
                    transition: 'color 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          marginTop: 28,
          paddingTop: 18,
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12, flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)' }}>
            © 2026 NavéStats · Navétanes de Khombole
          </span>
          <button
            onClick={scrollTop}
            aria-label="Retour en haut"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '6px 12px', borderRadius: 8,
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.8)', cursor: 'pointer',
              fontSize: '0.68rem', fontWeight: 600,
              fontFamily: 'var(--font-plus-jakarta)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(42,255,160,0.2)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)' }}
          >
            {t('footer.hautDePage')} <ArrowUp size={12} />
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .site-footer { display: none !important; }
          .site-footer > div > div { grid-template-columns: 1fr !important; gap: 24px !important; }
        }
      `}</style>
    </footer>
  )
}
