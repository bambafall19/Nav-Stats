'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'
import NotificationBell from '@/components/shared/NotificationBell'
import ThemeToggle from '@/components/shared/ThemeToggle'

type Profile = Database['public']['Tables']['profiles']['Row']

const navLinks = [
  { href: '/', label: 'Accueil', icon: '\u{1F3E0}' },
  { href: '/matchs', label: 'Matchs', icon: '\u26BD' },
  { href: '/cadets', label: 'Cadets', icon: '\u{1F4C5}' },
  { href: '/classements', label: 'Classements', icon: '\u{1F3C6}' },
  { href: '/statistiques', label: 'Stats', icon: '\u{1F4CA}' },
  { href: '/communaute', label: 'Chat', icon: '\u{1F4AC}' },
]

export default function Header() {
  const pathname = usePathname()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const supabase = createClient() as any

  useEffect(() => {
    supabase.auth.getUser().then((res: any) => {
      const user = res.data?.user
      if (user) {
        supabase.from('profiles').select('*').eq('id', user.id).single()
          .then((r: any) => setProfile(r.data))
      }
    })
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    if (menuOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <header
      style={{
        position: 'relative', top: 0, left: 0, right: 0,
        height: 56,
        background: 'var(--header-bg)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid var(--header-border)',
        boxShadow: 'var(--header-shadow)',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '100%', paddingLeft: 12, paddingRight: 12,
        maxWidth: 1200, margin: '0 auto', gap: 8,
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: 'var(--gradient-green)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', flexShrink: 0,
            boxShadow: '0 4px 12px rgba(0,98,51,0.25)',
          }}>
            <img src="/logo.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 9 }} />
          </div>
          <span className="logo-text" style={{
            fontFamily: 'var(--font-outfit)', fontWeight: 800,
            fontSize: '1.15rem', color: 'var(--color-primary)',
            letterSpacing: '-0.03em',
          }}>NavéStats</span>
        </Link>

        {/* Navigation horizontale */}
        <nav className="top-nav" style={{
          display: 'flex', alignItems: 'center', gap: 2,
          flex: 1, justifyContent: 'center',
        }}>
          {navLinks.map(link => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '6px 10px', borderRadius: 8,
                  fontSize: '0.78rem', fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  background: isActive ? 'rgba(0,98,51,0.07)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                  fontFamily: 'var(--font-outfit), sans-serif',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--color-surface-elevated)' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
              >
                <span className="nav-icon" style={{ fontSize: '0.9rem' }}>{link.icon}</span>
                <span className="nav-label">{link.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Actions droite */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <ThemeToggle />
          {profile && <NotificationBell userId={profile.id} />}
          
          {/* Admin link if admin */}
          {profile?.is_admin && (
            <Link 
              href="/admin" 
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--gradient-gold)',
                color: '#5a3800',
                fontSize: '0.72rem',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                boxShadow: 'var(--shadow-gold)',
              }}
            >
              ⚙️ Admin
            </Link>
          )}

          {profile ? (
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--color-border)',
                  background: 'var(--gradient-gold)', cursor: 'pointer', overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.65rem', fontWeight: 700, color: '#5a3800', padding: 0,
                }}
                aria-label="Menu"
              >
                {profile.avatar_url
                  ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : profile.username.charAt(0).toUpperCase()
                }
              </button>
              {menuOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  minWidth: 170, padding: 6, zIndex: 200,
                  background: 'var(--color-surface-card)',
                  borderRadius: 14, border: '1px solid var(--color-border)',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                  animation: 'fadeSlide 0.15s ease',
                }}>
                  <div style={{ padding: '6px 10px 4px', borderBottom: '1px solid var(--color-border)', marginBottom: 2 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{profile.username}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>{profile.points} pts</div>
                  </div>
                  <Link href={`/profil/${profile.id}`} onClick={() => setMenuOpen(false)}
                    style={{ display: 'block', padding: '7px 10px', borderRadius: 8, textDecoration: 'none', color: 'var(--color-text-primary)', fontSize: '0.8rem', fontWeight: 500 }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >{'\u{1F464}'} Mon Profil</Link>
                  <Link href="/pronostics" onClick={() => setMenuOpen(false)}
                    style={{ display: 'block', padding: '7px 10px', borderRadius: 8, textDecoration: 'none', color: 'var(--color-text-primary)', fontSize: '0.8rem', fontWeight: 500 }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >{'\u{1F4CA}'} Mes Pronostics</Link>
                  {profile.is_admin && (
                    <Link href="/admin" onClick={() => setMenuOpen(false)}
                      style={{ display: 'block', padding: '7px 10px', borderRadius: 8, textDecoration: 'none', color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: 600 }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-elevated)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >{'\u{1F6E1}\uFE0F'} Admin</Link>
                  )}
                  <div style={{ height: 1, background: 'var(--color-border)', margin: '4px 0' }} />
                  <button onClick={handleSignOut}
                    style={{ display: 'block', width: '100%', padding: '7px 10px', borderRadius: 8, color: 'var(--color-red)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500, textAlign: 'left' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(232,0,45,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >{'\u{1F6AA}'} Déconnexion</button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth/login" style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '5px 12px', fontSize: '0.75rem', fontWeight: 600,
              fontFamily: 'var(--font-outfit), sans-serif',
              borderRadius: 20, textDecoration: 'none',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
              height: 30, transition: 'all 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-elevated)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >{'\u{1F511}'} Se connecter</Link>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          header { display: none !important; }
          .nav-label { display: none !important; }
          .nav-icon { font-size: 1.1rem !important; }
          .top-nav { gap: 0 !important; }
          .top-nav a { padding: 6px 8px !important; }
          .logo-text { font-size: 0.85rem !important; }
        }
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(-4px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </header>
  )
}
