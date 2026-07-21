'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'
import NotificationBell from '@/components/shared/NotificationBell'
import LinkButton from '@/components/shared/LinkButton'
import ThemeToggle from '@/components/shared/ThemeToggle'

type Profile = Database['public']['Tables']['profiles']['Row']

const navLinks = [
  { href: '/', label: 'Accueil', icon: '🏠' },
  { href: '/matchs', label: 'Matchs', icon: '⚽' },
  { href: '/classements', label: 'Classements', icon: '🏆' },
  { href: '/statistiques', label: 'Statistiques', icon: '📊' },
  { href: '/communaute', label: 'Communauté', icon: '💬' },
]

export default function Header() {
  const pathname = usePathname()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
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

  // Forcer le thème sombre
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark')
    localStorage.setItem('navestats-theme', 'dark')
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <header
      id="main-header"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: 'rgba(10, 15, 13, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--color-border)',
        height: 'var(--nav-height)',
        boxShadow: 'var(--shadow-md)',
        transition: 'background 0.3s ease',
      }}
    >
      <div className="container-app header-shell" style={{ display: 'flex', alignItems: 'center', height: '100%', gap: 16 }}>
        {/* Logo */}
        <Link href="/" className="brand-link" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <div className="brand-mark" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'var(--gradient-green)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-green)',
              flexShrink: 0,
            }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0a0f0d' }}>N</span>
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-outfit)',
                fontWeight: 800,
                fontSize: '1.1rem',
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}>NavéStats</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--color-primary)', letterSpacing: '0.08em', fontWeight: 700 }}>KHOMBOLE 2026</div>
            </div>
          </div>
        </Link>

        {/* Partnership Logo */}
        <div className="zone-partner" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 1, height: 22, background: 'var(--color-border)', flexShrink: 0 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <img
              src="/oncav-logo.png"
              alt="ONCAV Zone 6"
              className="zone-logo"
              style={{ width: 28, height: 28, objectFit: 'contain', flexShrink: 0 }}
            />
            <span className="oncav-label" style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1.1 }}>
              Zone 6<br />Khombole
            </span>
          </div>
        </div>

        {/* Theme Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', marginRight: 8 }} className="desktop-user-menu">
          <ThemeToggle />
        </div>

        {/* Desktop nav */}
        <nav style={{
          display: 'none',
          gap: 2,
          background: 'rgba(0,0,0,0.04)',
          padding: 4,
          borderRadius: 'var(--radius-full)',
          margin: '0 auto',
        }} className="desktop-nav">
          {navLinks.map(link => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  background: isActive ? 'white' : 'transparent',
                  boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  fontFamily: 'var(--font-outfit)',
                }}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Right actions */}
        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 'auto' }}>
          {profile ? (
            <>
              <NotificationBell userId={profile.id} />
              <div style={{ position: 'relative' }} className="desktop-user-menu">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 12px 6px 6px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--color-border)',
                    background: 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  aria-label="Menu utilisateur"
                  id="user-menu-btn"
                >
                  <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                    {profile.avatar_url
                      ? <img src={profile.avatar_url} alt={profile.username} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      : profile.username.charAt(0).toUpperCase()
                    }
                  </div>
                  <span className="hidden-mobile" style={{ fontSize: '0.875rem', fontWeight: 600, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {profile.username}
                  </span>
                  <div style={{
                    width: 20, height: 20,
                    background: 'var(--gradient-gold)',
                    borderRadius: 'var(--radius-full)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.65rem', fontWeight: 700, color: '#5a3800',
                  }}>
                    {profile.points}
                  </div>
                </button>

                {menuOpen && (
                  <div id="user-dropdown" style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    minWidth: 200,
                    background: 'var(--color-surface-card)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: 8,
                    zIndex: 200,
                    animation: 'fadeInUp 0.15s ease',
                  }}>
                    <Link href={`/profil/${profile.id}`}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'var(--color-text-primary)', transition: 'background 0.15s' }}
                      onClick={() => setMenuOpen(false)}
                      onMouseOver={e => (e.currentTarget.style.background = 'rgba(0,98,51,0.05)')}
                      onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span>👤</span> <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Mon Profil</span>
                    </Link>
                    <Link href="/pronostics"
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'var(--color-text-primary)', transition: 'background 0.15s' }}
                      onClick={() => setMenuOpen(false)}
                      onMouseOver={e => (e.currentTarget.style.background = 'rgba(0,98,51,0.05)')}
                      onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span>📊</span> <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Mes Pronostics</span>
                    </Link>
                    {profile.is_admin && (
                      <Link href="/admin"
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'var(--color-primary)', transition: 'background 0.15s' }}
                        onClick={() => setMenuOpen(false)}
                        onMouseOver={e => (e.currentTarget.style.background = 'rgba(0,98,51,0.05)')}
                        onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <span>🛡️</span> <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Admin</span>
                      </Link>
                    )}
                    <div style={{ height: 1, background: 'var(--color-border)', margin: '6px 0' }} />
                    <button onClick={handleSignOut}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 'var(--radius-md)', color: 'var(--color-red)', background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', fontSize: '0.875rem', fontWeight: 500, transition: 'background 0.15s' }}
                      onMouseOver={e => (e.currentTarget.style.background = 'rgba(232,0,45,0.05)')}
                      onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span>🚪</span> <span>Déconnexion</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <LinkButton href="/auth/login" variant="secondary" size="sm">
                🔑 Connexion
              </LinkButton>
              <LinkButton href="/auth/register" variant="primary" size="sm" className="register-link">
                ✨ S'inscrire
              </LinkButton>
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .desktop-nav { display: none !important; }
          .hidden-mobile { display: none !important; }
          .desktop-user-menu { display: none !important; }
        }
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; align-items: center; }
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </header>
  )
}
