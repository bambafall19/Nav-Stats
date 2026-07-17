'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const mobileNavLinks = [
  { href: '/', label: 'Accueil', icon: '🏠' },
  { href: '/matchs', label: 'Matchs', icon: '⚽' },
  { href: '/classements', label: 'Classement', icon: '🏆' },
  { href: '/statistiques', label: 'Stats', icon: '📊' },
  { href: '/profil', label: 'Profil', icon: '👤' },
]

export default function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      id="mobile-bottom-nav"
      style={{
        position: 'fixed',
        bottom: 12,
        left: 12,
        right: 12,
        height: 60,
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(0, 98, 51, 0.1)',
        borderRadius: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 8px',
        zIndex: 99,
        boxShadow: '0 8px 24px rgba(0, 98, 51, 0.12)',
      }}
    >
      {mobileNavLinks.map(link => {
        const isActive = pathname === link.href || pathname.startsWith(link.href + '/')

        return (
          <Link
            key={link.href}
            href={link.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              padding: '6px 10px',
              borderRadius: 14,
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              background: isActive ? 'linear-gradient(135deg, #006233, #00A651)' : 'transparent',
              color: isActive ? 'white' : 'var(--color-text-secondary)',
              minHeight: 44,
              minWidth: 44,
              fontSize: '1.2rem',
            }}
          >
            <span>{link.icon}</span>
            <span style={{
              fontSize: '0.6rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
              opacity: isActive ? 1 : 0.7,
            }}>
              {link.label}
            </span>
          </Link>
        )
      })}
      <style>{`
        @media (min-width: 768px) { #mobile-bottom-nav { display: none !important; } }
      `}</style>
    </nav>
  )
}
