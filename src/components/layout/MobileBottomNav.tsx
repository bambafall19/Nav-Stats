'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Home, Trophy, Target, BarChart3, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

const mobileNavLinks = [
  { href: '/', label: 'Accueil', Icon: Home },
  { href: '/classements', label: 'Classement', Icon: Trophy },
  { href: '/matchs', label: 'Matchs', Icon: Target, isFAB: true },
  { href: '/pronostics', label: 'Pronostics', Icon: BarChart3 },
  { href: '/profil', label: 'Profil', Icon: User },
]

export default function MobileBottomNav() {
  const pathname = usePathname()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [todayMatchCount, setTodayMatchCount] = useState(0)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then((res) => {
      const user = res.data?.user
      if (user) {
        supabase.from('profiles').select('*').eq('id', user.id).single()
          .then((resProfile) => setProfile(resProfile.data))
      }
    })

    const today = new Date().toISOString().split('T')[0]
    supabase
      .from('matchs')
      .select('id')
      .eq('date_match', today)
      .eq('statut', 'a_venir')
      .then(({ data }) => {
        if (data) setTodayMatchCount(data.length)
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
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.assign('/')
  }

  const closeMenu = () => setMenuOpen(false)

  const menuItems = [
    { label: 'Mon Profil', icon: '👤', href: `/profil/${profile?.id}`, color: 'var(--color-text-primary)' },
    { label: 'Mes Pronostics', icon: '📊', href: '/pronostics', color: 'var(--color-text-primary)' },
    ...(profile?.is_admin ? [{ label: 'Admin', icon: '🛡️', href: '/admin', color: 'var(--color-primary)' }] : []),
  ]

  return (
    <>
      {menuOpen && (
        <div
          onClick={closeMenu}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.25)',
            zIndex: 98,
            animation: 'fadeIn 0.15s ease',
          }}
          aria-label="Fermer le menu"
        />
      )}

      <nav
        id="mobile-bottom-nav"
        style={{
          position: 'fixed',
          bottom: 'max(8px, env(safe-area-inset-bottom))',
          left: 10,
          right: 10,
          height: 64,
          background: 'var(--color-surface-overlay)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 6px',
          zIndex: 999,
          borderRadius: 20,
          boxShadow: 'var(--shadow-lg)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        }}
      >
        {mobileNavLinks.map((link, idx) => {
          const isCenter = idx === 2
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
          const isProfileLink = link.href === '/profil'
          const Icon = link.Icon

          if (isCenter) {
            return (
              <Link
                key={link.href}
                href={link.href}
                className="mobile-nav-fab"
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 16,
                  background: 'var(--gradient-green)',
                  color: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  textDecoration: 'none',
                  boxShadow: isActive
                    ? 'var(--shadow-green)'
                    : '0 4px 14px rgba(0,98,51,0.35)',
                  transition: 'all 0.2s ease',
                  margin: '-18px 0 0',
                  border: isActive ? '2px solid var(--color-accent)' : '2px solid var(--color-surface)',
                  position: 'relative',
                }}
                aria-label="Matchs"
              >
                <Target size={20} strokeWidth={2.6} />
                <span style={{
                  fontSize: '0.52rem',
                  lineHeight: 1,
                  letterSpacing: '0.01em',
                  fontFamily: 'var(--font-outfit)',
                  fontWeight: 800,
                }}>
                  Matchs
                </span>
                {todayMatchCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    minWidth: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: 'var(--color-accent)',
                    color: 'var(--color-primary-dark)',
                    fontSize: '0.55rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 3px',
                    border: '2px solid var(--color-surface)',
                    boxShadow: 'var(--shadow-sm)',
                    fontFamily: 'var(--font-outfit)',
                  }}>
                    {todayMatchCount}
                  </span>
                )}
              </Link>
            )
          }

          if (isProfileLink && profile) {
            return (
              <div key={link.href} style={{ position: 'relative' }}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="mobile-nav-item"
                  style={{
                    background: isActive ? 'rgba(0, 98, 51, 0.08)' : 'transparent',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  }}
                  aria-label="Menu profil"
                  aria-expanded={menuOpen}
                >
                  <div style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    border: '1.5px solid var(--color-primary)',
                    overflow: 'hidden',
                    background: 'var(--color-bg-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: 'var(--color-primary)',
                  }}>
                    {profile.avatar_url
                      ? <Image src={profile.avatar_url} alt={profile.username} width={22} height={22} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : profile.username.charAt(0).toUpperCase()
                    }
                  </div>
                  <span className="mobile-nav-label">{link.label}</span>
                </button>

                {menuOpen && (
                  <div style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 10px)',
                    right: 0,
                    minWidth: 180,
                    background: 'var(--color-surface-card)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: 6,
                    zIndex: 200,
                    animation: 'slideUp 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}>
                    {menuItems.map((item, idx) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-md)',
                          textDecoration: 'none',
                          color: item.color,
                          transition: 'all 0.12s ease',
                          background: hoveredItem === `menu-${idx}` ? 'rgba(0, 98, 51, 0.06)' : 'transparent',
                          transform: hoveredItem === `menu-${idx}` ? 'translateX(3px)' : 'translateX(0)',
                          animation: `slideInLeft 0.2s ease ${idx * 0.04}s backwards`,
                        }}
                        onClick={closeMenu}
                        onMouseEnter={() => setHoveredItem(`menu-${idx}`)}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{item.label}</span>
                      </Link>
                    ))}
                    <div style={{ height: 1, background: 'var(--color-border)', margin: '6px 0' }} />
                    <button
                      onClick={() => {
                        handleSignOut()
                        closeMenu()
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--color-red)',
                        background: hoveredItem === 'logout' ? 'rgba(232, 0, 45, 0.08)' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        width: '100%',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        transition: 'all 0.12s ease',
                        transform: hoveredItem === 'logout' ? 'translateX(3px)' : 'translateX(0)',
                        animation: 'slideInLeft 0.2s ease 0.12s backwards',
                      }}
                      onMouseEnter={() => setHoveredItem('logout')}
                      onMouseLeave={() => setHoveredItem(null)}
                      aria-label="Se déconnecter"
                    >
                      <span style={{ fontSize: '1rem' }}>🚪</span>
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
                background: isActive ? 'rgba(0, 98, 51, 0.08)' : 'transparent',
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
              }}
              aria-label={link.label}
              onMouseEnter={() => setHoveredItem(link.href)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Icon size={20} strokeWidth={isActive ? 2.6 : 2} />
              <span className="mobile-nav-label">{link.label}</span>
            </Link>
          )
        })}

        <style>{`
          @media (min-width: 768px) { #mobile-bottom-nav { display: none !important; } }
          @media (max-width: 767px) { #mobile-bottom-nav { display: flex !important; } }
          #mobile-bottom-nav .mobile-nav-item {
            width: 100%;
            min-width: 0;
            height: 52px;
            padding: 4px 2px;
            border-radius: 14px;
            display: inline-flex;
            flex-direction: column;
            alignItems: center;
            justify-content: center;
            gap: 2px;
            text-decoration: none;
            border: none;
            cursor: pointer;
            transition: background 0.12s ease, color 0.12s ease, transform 0.12s ease;
          }
          #mobile-bottom-nav .mobile-nav-item:active,
          #mobile-bottom-nav .mobile-nav-fab:active {
            transform: scale(0.95);
          }
          #mobile-bottom-nav .mobile-nav-label {
            font-size: 0.6rem;
            line-height: 1;
            font-weight: 700;
            font-family: var(--font-outfit);
            letter-spacing: 0;
            white-space: nowrap;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(8px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(-8px);
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
