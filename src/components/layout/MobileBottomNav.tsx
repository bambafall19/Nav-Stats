'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

const mobileNavLinks = [
  { href: '/', label: 'Accueil', icon: '🏠' },
  { href: '/matchs', label: 'Matchs', icon: '⚽' },
  { href: '/classements', label: 'Classement', icon: '🏆' },
  { href: '/statistiques', label: 'Stats', icon: '📊' },
  { href: '/profil', label: 'Profil', icon: '👤' },
]

export default function MobileBottomNav() {
  const pathname = usePathname()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const supabase = createClient() as any

  useEffect(() => {
    supabase.auth.getUser().then((res: any) => {
      const user = res.data?.user
      if (user) {
        supabase.from('profiles').select('*').eq('id', user.id).single()
          .then((resProfile: any) => setProfile(resProfile.data))
      }
    })
  }, [])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [menuOpen])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const closeMenu = () => setMenuOpen(false)

  const menuItems = [
    { label: 'Mon Profil', icon: '👤', href: `/profil/${profile?.id}`, color: 'var(--color-text-primary)' },
    { label: 'Mes Pronostics', icon: '📊', href: '/pronostics', color: 'var(--color-text-primary)' },
    ...(profile?.is_admin ? [{ label: 'Admin', icon: '🛡️', href: '/admin', color: 'var(--color-primary)' }] : []),
  ]

  return (
    <>
      {/* Overlay */}
      {menuOpen && (
        <div
          onClick={closeMenu}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            zIndex: 98,
            animation: 'fadeIn 0.2s ease',
          }}
          aria-label="Fermer le menu"
        />
      )}

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
          const isProfileLink = link.href === '/profil'

          if (isProfileLink && profile) {
            return (
              <div key={link.href} style={{ position: 'relative' }}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  onMouseEnter={() => setHoveredItem('profile')}
                  onMouseLeave={() => setHoveredItem(null)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    padding: '6px 10px',
                    borderRadius: 14,
                    background: isActive ? 'linear-gradient(135deg, #006233, #00A651)' : 'transparent',
                    color: isActive ? 'white' : 'var(--color-text-secondary)',
                    minHeight: 44,
                    minWidth: 44,
                    fontSize: '1.2rem',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                  }}
                  aria-label="Menu profil"
                  aria-expanded={menuOpen}
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
                  {menuOpen && (
                    <span style={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      width: 8,
                      height: 8,
                      background: 'var(--color-primary)',
                      borderRadius: '50%',
                      animation: 'pulse 1.5s ease-in-out infinite',
                    }} />
                  )}
                </button>

                {menuOpen && (
                  <div style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 12px)',
                    right: 0,
                    minWidth: 200,
                    background: 'var(--color-surface-card)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: 8,
                    zIndex: 200,
                    animation: 'slideUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}>
                    {menuItems.map((item, idx) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onMouseEnter={() => setHoveredItem(`menu-${idx}`)}
                        onMouseLeave={() => setHoveredItem(null)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '12px 14px',
                          borderRadius: 'var(--radius-md)',
                          textDecoration: 'none',
                          color: item.color,
                          transition: 'all 0.15s ease',
                          background: hoveredItem === `menu-${idx}` ? 'rgba(0, 98, 51, 0.08)' : 'transparent',
                          transform: hoveredItem === `menu-${idx}` ? 'translateX(4px)' : 'translateX(0)',
                          animation: `slideInLeft 0.25s ease ${idx * 0.05}s backwards`,
                        }}
                        onClick={closeMenu}
                      >
                        <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{item.label}</span>
                      </Link>
                    ))}
                    <div style={{ height: 1, background: 'var(--color-border)', margin: '8px 0' }} />
                    <button
                      onClick={() => {
                        handleSignOut()
                        closeMenu()
                      }}
                      onMouseEnter={() => setHoveredItem('logout')}
                      onMouseLeave={() => setHoveredItem(null)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--color-red)',
                        background: hoveredItem === 'logout' ? 'rgba(232, 0, 45, 0.1)' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        width: '100%',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        transition: 'all 0.15s ease',
                        transform: hoveredItem === 'logout' ? 'translateX(4px)' : 'translateX(0)',
                        animation: 'slideInLeft 0.25s ease 0.15s backwards',
                      }}
                      aria-label="Se déconnecter"
                    >
                      <span style={{ fontSize: '1.1rem' }}>🚪</span>
                      <span>Déconnexion</span>
                    </button>
                  </div>
                )}
              </div>
            )
          }

          return (
            <Link
              key={link.href}
              href={link.href}
              onMouseEnter={() => setHoveredItem(link.href)}
              onMouseLeave={() => setHoveredItem(null)}
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
                background: isActive ? 'linear-gradient(135deg, #006233, #00A651)' : hoveredItem === link.href ? 'rgba(0, 98, 51, 0.08)' : 'transparent',
                color: isActive ? 'white' : 'var(--color-text-secondary)',
                minHeight: 44,
                minWidth: 44,
                fontSize: '1.2rem',
                transform: hoveredItem === link.href && !isActive ? 'scale(1.1)' : 'scale(1)',
              }}
              aria-label={link.label}
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
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(-10px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.3); opacity: 0.7; }
          }
        `}</style>
      </nav>
    </>
  )
}
