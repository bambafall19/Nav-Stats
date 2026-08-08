'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { Search, Target, BarChart3, Settings, LogOut, LayoutDashboard, ShieldCheck, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'
import NotificationBell from '@/components/shared/NotificationBell'
import LanguageSwitcher from '@/components/shared/LanguageSwitcher'
import { useT } from '@/lib/i18n/LanguageProvider'

type Profile = Database['public']['Tables']['profiles']['Row']

type FollowedTeam = {
  equipe_id: string
  equipes: {
    id: string
    nom: string
    sigle: string | null
    logo_url: string | null
    couleur_principale: string
  } | null
}

export default function Header() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [followedTeams, setFollowedTeams] = useState<FollowedTeam[]>([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)
  const supabase = createClient() as any
  const t = useT()

  useEffect(() => {
    supabase.auth.getUser().then((res: any) => {
      const user = res.data?.user
      if (user) {
        supabase.from('profiles').select('*').eq('id', user.id).single()
          .then((r: any) => setProfile(r.data))
          .catch(() => {})
        supabase.from('team_follows')
          .select('equipe_id, equipes(id, nom, sigle, logo_url, couleur_principale)')
          .eq('user_id', user.id)
          .limit(3)
          .then((r: any) => { if (r.data) setFollowedTeams(r.data) })
          .catch(() => {})
      }
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  return (
    <>
      <header
        id="main-header"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          zIndex: 100,
          height: 64,
          background: scrolled ? 'rgba(8,14,11,0.82)' : 'rgba(8,14,11,0.5)',
          backdropFilter: 'blur(20px) saturate(160%)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
          borderBottom: scrolled ? '1px solid var(--color-border-subtle)' : '1px solid transparent',
          boxShadow: scrolled ? 'var(--header-shadow)' : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100%',
          padding: '0 24px',
          maxWidth: 1280,
          margin: '0 auto',
          gap: 20,
        }}>
          {/* Search bar */}
          <form onSubmit={handleSearch} className="header-search" style={{
            flex: 1,
            maxWidth: 420,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '0 14px',
            height: 40,
            borderRadius: 999,
            background: searchOpen ? 'var(--color-surface)' : 'var(--color-bg-secondary)',
            border: searchOpen ? '1.5px solid var(--color-primary)' : '1.5px solid transparent',
            boxShadow: searchOpen ? '0 0 0 4px rgba(42,255,160,0.12), 0 0 20px rgba(42,255,160,0.1)' : 'none',
            transition: 'all 0.2s',
          }}>
            <Search size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setSearchOpen(false)}
              placeholder={t('header.search')}
              aria-label="Rechercher"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '0.82rem',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-inter)',
              }}
            />
            <kbd style={{
              fontSize: '0.6rem', color: 'var(--color-text-muted)',
              padding: '2px 6px', borderRadius: 6,
              background: 'var(--color-surface-hover)',
              border: '1px solid var(--color-border-subtle)',
              fontFamily: 'var(--font-mono)',
              display: 'inline-flex', alignItems: 'center', gap: 2,
              flexShrink: 0,
            }}><span style={{ fontSize: '0.72rem' }}>⌘</span>K</kbd>
          </form>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <LanguageSwitcher />

            {profile && <NotificationBell userId={profile.id} />}

            {profile?.is_admin && (
              <Link href="/admin" style={{
                padding: '5px 10px', borderRadius: 8,
                background: 'var(--color-accent-50)', color: 'var(--color-accent)',
                fontSize: '0.68rem', fontWeight: 700,
                textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: 4,
                fontFamily: 'var(--font-display)',
                border: '1px solid rgba(255,201,77,0.22)',
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,201,77,0.16)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--color-accent-50)'}
              >
                <Settings size={12} />
                Admin
              </Link>
            )}

            {profile ? (
              <div ref={menuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    border: '1.5px solid var(--color-border-subtle)',
                    background: profile.avatar_url ? 'transparent' : 'var(--color-primary-50)',
                    cursor: 'pointer', overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.65rem', fontWeight: 700,
                    color: 'var(--color-primary)', padding: 0,
                    transition: 'all 0.15s',
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
                    minWidth: 230, padding: 6, zIndex: 200,
                    background: 'var(--color-surface-elevated)',
                    borderRadius: 14,
                    border: '1px solid var(--color-border-subtle)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
                    animation: 'fadeSlide 0.15s ease',
                  }}>
                    <div style={{ padding: '10px 12px 8px', borderBottom: '1px solid var(--color-border-subtle)', marginBottom: 4 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>{profile.username}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>{profile.points} pts</div>
                    </div>

                    {/* Compétition */}
                    <Link href="/classements" onClick={() => setMenuOpen(false)} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 10px', borderRadius: 10, textDecoration: 'none',
                      background: 'var(--gradient-green-soft)',
                      border: '1px solid rgba(42,255,160,0.18)',
                      margin: '0 2px 6px',
                      transition: 'background 0.12s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(42,255,160,0.4)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(42,255,160,0.18)'}
                    >
                      <div style={{
                        width: 30, height: 30, borderRadius: 9,
                        background: 'var(--gradient-green)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 4px 14px rgba(42,255,160,0.3)',
                      }}>
                        <ShieldCheck size={15} color="var(--color-text-on-primary)" strokeWidth={2.2} />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.72rem', fontFamily: 'var(--font-display)', lineHeight: 1.2 }}>{t('header.competition')}</div>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.62rem', fontFamily: 'var(--font-display)' }}>{t('header.season')}</div>
                      </div>
                      <ChevronRight size={14} color="var(--color-text-muted)" style={{ flexShrink: 0 }} />
                    </Link>

                    {/* Mes équipes */}
                    {followedTeams.length > 0 && (
                      <>
                        <div style={{
                          fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase',
                          letterSpacing: '0.08em', color: 'var(--color-text-muted)',
                          fontFamily: 'var(--font-display)',
                          padding: '4px 10px 2px',
                        }}>{t('header.myTeams')}</div>
                        {followedTeams.map(t => {
                          const team = t.equipes
                          if (!team) return null
                          return (
                            <Link key={t.equipe_id} href={`/equipes/${team.id}`} onClick={() => setMenuOpen(false)}
                              style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 10px', borderRadius: 8, textDecoration: 'none', transition: 'background 0.12s' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-hover)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              <span style={{
                                width: 24, height: 24, borderRadius: 7,
                                background: team.couleur_principale || 'var(--color-primary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.52rem', fontWeight: 800, color: 'white',
                                fontFamily: 'var(--font-display)', overflow: 'hidden', flexShrink: 0,
                              }}>
                                {team.logo_url
                                  ? <img src={team.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  : (team.sigle || team.nom.slice(0, 3)).toUpperCase()
                                }
                              </span>
                              <span style={{
                                flex: 1, minWidth: 0, color: 'var(--color-text-secondary)',
                                fontSize: '0.74rem', fontWeight: 600, fontFamily: 'var(--font-display)',
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                              }}>{team.nom}</span>
                              <ChevronRight size={12} color="var(--color-text-muted)" style={{ flexShrink: 0 }} />
                            </Link>
                          )
                        })}
                        <div style={{ height: 1, background: 'var(--color-border-subtle)', margin: '4px 0' }} />
                      </>
                    )}
                    <Link href={`/profil/${profile.id}`} onClick={() => setMenuOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, textDecoration: 'none', color: 'var(--color-text-primary)', fontSize: '0.78rem', fontWeight: 500, transition: 'background 0.12s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <Target size={14} /> {t('header.myProfile')}
                    </Link>
                    <Link href="/pronostics" onClick={() => setMenuOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, textDecoration: 'none', color: 'var(--color-text-primary)', fontSize: '0.78rem', fontWeight: 500, transition: 'background 0.12s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <BarChart3 size={14} /> {t('header.myPronostics')}
                    </Link>
                    {profile.is_admin && (
                      <Link href="/admin" onClick={() => setMenuOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, textDecoration: 'none', color: 'var(--color-primary)', fontSize: '0.78rem', fontWeight: 600, transition: 'background 0.12s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <LayoutDashboard size={14} /> Admin
                      </Link>
                    )}
                    <div style={{ height: 1, background: 'var(--color-border-subtle)', margin: '4px 0' }} />
                    <button onClick={handleSignOut} style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8,
                      color: 'var(--color-red)', background: 'transparent', border: 'none', cursor: 'pointer',
                      fontSize: '0.78rem', fontWeight: 500, textAlign: 'left', width: '100%', transition: 'background 0.12s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--color-red-light)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut size={14} /> {t('header.signOut')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login" style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '7px 16px', fontSize: '0.75rem', fontWeight: 600,
                fontFamily: 'var(--font-display)',
                borderRadius: 8, textDecoration: 'none',
                background: 'var(--gradient-green)', color: 'var(--color-text-on-primary)',
                transition: 'all 0.2s',
                boxShadow: 'var(--shadow-green)',
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(42,255,160,0.35)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-green)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >{t('header.signIn')}</Link>
            )}
          </div>
        </div>
      </header>

      {/* Spacer */}
      <div className="desktop-spacer" />

      <style>{`
        .desktop-spacer { height: 64px; display: block; }
        .header-search:hover { border-color: var(--color-border) !important; }
        .header-search:focus-within { border-color: var(--color-primary) !important; box-shadow: 0 0 0 4px rgba(42,255,160,0.12) !important; background: var(--color-surface) !important; }
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(-4px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (max-width: 767px) {
          #main-header { display: none !important; }
          .desktop-spacer { display: none !important; }
        }
        @media (min-width: 768px) {
          #main-header {
            display: block !important;
            left: 0;
          }
        }
      `}</style>
    </>
  )
}
