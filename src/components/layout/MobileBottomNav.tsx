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
            background: 'rgba(0, 0, 0, 0.3)',
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
          bottom: 10,
          left: 10,
          right: 10,
          height: 60,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 8px',
          zIndex: 999,
          borderRadius: 20,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        }}
      >
        {/* Left items - Accueil, Matchs */}
        <div style={{ display: 'flex', gap: 4, flex: 1, justifyContent: 'space-around' }}>
          {mobileNavLinks.slice(0, 2).map(link => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
            return (
              <Link
                key={link.href}
                href={link.href}
                className="mobile-nav-item"
                style={{
                  background: isActive ? 'rgba(0, 98, 51, 0.1)' : 'transparent',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                }}
                aria-label={link.label}
              >
                <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>{link.icon}</span>
              </Link>
            )
          })}
        </div>

        {/* Center FAB - Pronostiquer */}
        <Link
          href="/matchs"
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #006233, #00A651)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            fontWeight: 900,
            textDecoration: 'none',
            boxShadow: '0 4px 16px rgba(0, 98, 51, 0.4)',
            transition: 'all 0.2s ease',
            marginTop: -24,
            border: '3px solid white',
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.currentTarget.style.transform = 'scale(1.1)'
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 98, 51, 0.5)'
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 98, 51, 0.4)'
          }}
          aria-label="Pronostiquer"
        >
          ⚽
        </Link>

        {/* Right items - Classement, Stats, Profil */}
        <div style={{ display: 'flex', gap: 4, flex: 1, justifyContent: 'space-around' }}>
          {mobileNavLinks.slice(2).map(link => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
            const isProfileLink = link.href === '/profil'

            if (isProfileLink && profile) {
              return (
                <div key={link.href} style={{ position: 'relative' }}>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="mobile-nav-item"
                    style={{
                      background: isActive ? 'rgba(0, 98, 51, 0.1)' : 'transparent',
                      color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    }}
                    aria-label="Menu profil"
                    aria-expanded={menuOpen}
                  >
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      border: '2px solid var(--color-primary)',
                      overflow: 'hidden',
                      background: 'var(--color-bg-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--color-primary)',
                    }}>
                      {profile.avatar_url
                        ? <img src={profile.avatar_url} alt={profile.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : profile.username.charAt(0).toUpperCase()
                      }
                    </div>
                  </button>

                  {menuOpen && (
                    <div style={{
                      position: 'absolute',
                      bottom: 'calc(100% + 12px)',
                      right: 0,
                      minWidth: 200,
                      background: 'white',
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
                          onMouseEnter={() => setHoveredItem(`menu-${idx}`)}
                          onMouseLeave={() => setHoveredItem(null)}
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
                        onMouseEnter={() => setHoveredItem('logout')}
                        onMouseLeave={() => setHoveredItem(null)}
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
                className="mobile-nav-item"
                style={{
                  background: isActive ? 'rgba(0, 98, 51, 0.1)' : 'transparent',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                }}
                aria-label={link.label}
                onMouseEnter={() => setHoveredItem(link.href)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>{link.icon}</span>
              </Link>
            )
          })}
        </div>
        
        <style>{`
          @media (min-width: 768px) { #mobile-bottom-nav { display: none !important; } }
          @media (max-width: 767px) { #mobile-bottom-nav { display: flex !important; } }
          
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
        `}</style>
      </nav>
    </>
  )
}