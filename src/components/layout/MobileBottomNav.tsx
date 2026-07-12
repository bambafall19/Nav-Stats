'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CalendarDays, Trophy, BarChart2, MessageSquare } from 'lucide-react'

const mobileNavLinks = [
  { href: '/', label: 'Accueil', icon: <Home size={22} /> },
  { href: '/matchs', label: 'Matchs', icon: <CalendarDays size={22} /> },
  { href: '/classements', label: 'Classement', icon: <Trophy size={22} /> },
  { href: '/statistiques', label: 'Stats', icon: <BarChart2 size={22} /> },
  { href: '/communaute', label: 'Comm.', icon: <MessageSquare size={22} /> },
]

export default function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      id="mobile-bottom-nav"
      style={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        right: 16,
        height: 66,
        background: 'rgba(255, 255, 255, 0.85)', // Premium light glass
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: '1px solid rgba(0, 98, 51, 0.1)', // Emerald border
        borderRadius: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 10px',
        zIndex: 99,
        boxShadow: '0 12px 30px rgba(0, 98, 51, 0.08), 0 4px 12px rgba(0,0,0,0.03)',
      }}
      className="mobile-only"
    >
      {mobileNavLinks.map(link => {
        const isActive = pathname === link.href

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`mobile-nav-item${isActive ? ' active' : ''}`}
            id={`mobile-nav-${link.label.toLowerCase()}`}
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              ...(isActive ? {
                background: 'var(--gradient-green)', // Senegal Emerald Green gradient
                color: 'white',
                padding: '10px 16px',
                borderRadius: 18,
                boxShadow: 'var(--shadow-green)',
                flexGrow: 1.8,
                maxWidth: '140px',
              } : {
                background: 'transparent',
                color: 'var(--color-text-secondary)',
                width: 44,
                height: 44,
                borderRadius: '50%',
                flexGrow: 1,
                maxWidth: '48px',
              }),
            }}
          >
            <span style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: isActive ? 6 : 0,
              transition: 'all 0.2s ease',
              color: isActive ? 'white' : 'var(--color-text-secondary)',
            }}>
              {link.icon}
            </span>
            
            {isActive && (
              <span style={{
                fontFamily: 'var(--font-outfit)',
                fontWeight: 700,
                fontSize: '0.8rem',
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
                animation: 'fadeIn 0.2s ease-in-out',
              }}>
                {link.label}
              </span>
            )}
          </Link>
        )
      })}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @media (min-width: 768px) { .mobile-only { display: none !important; } }
      `}</style>
    </nav>
  )
}
