'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'
import NotificationBell from '@/components/shared/NotificationBell'
import LanguageSwitcher from '@/components/shared/LanguageSwitcher'
import { useT } from '@/lib/i18n/LanguageProvider'

type Profile = Database['public']['Tables']['profiles']['Row']

export default function MobileHeader() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const t = useT()

  useEffect(() => {
    const supabase = createClient()
    ;(async () => {
      try {
        const res = await supabase.auth.getUser()
        const user = res.data?.user
        if (user) {
          const resProfile = await supabase.from('profiles').select('*').eq('id', user.id).single()
          setProfile(resProfile.data)
        }
      } catch {
        // Connexion Supabase temporairement indisponible — ignoré silencieusement
      }
    })()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  return (
    <>
      <header
        id="mobile-header"
        style={{
          position: 'fixed',
          top: 'calc(10px + env(safe-area-inset-top))',
          left: 16,
          right: 16,
          height: 72,
          padding: '0 16px',
          background: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(20px) saturate(160%)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 24,
          zIndex: 1000,
          display: 'none',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.18)',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          width: '100%',
          gap: 14,
        }}>
          {/* Gauche : Notifications */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 10 }}>
            {profile
              ? <NotificationBell userId={profile.id} variant="icon" badgeColor="green" />
              : <div style={{ width: 44, height: 44 }} />}
          </div>

          {/* Centre : Logo + marque */}
          <Link href="/" style={{
            textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 12, flexShrink: 0,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'var(--gradient-green)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', flexShrink: 0,
            }}>
              <img src="/logo.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span style={{
              fontFamily: 'var(--font-signature)',
              fontWeight: 700, fontSize: 26,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
            }}>NavéStats</span>
          </Link>

          {/* Droite : Langue + Recherche + Profil */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
            <LanguageSwitcher compact />

            <button
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Rechercher"
              className="header-icon-btn"
              style={{
                width: 44, height: 44, borderRadius: '50%',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                background: searchOpen ? 'rgba(42,255,160,0.12)' : 'rgba(255, 255, 255, 0.06)',
                color: searchOpen ? 'var(--color-primary)' : '#FFFFFF',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 1px 4px rgba(0, 0, 0, 0.12)',
                transition: 'transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              {searchOpen ? <X size={22} /> : <Search size={22} />}
            </button>

            {profile ? (
              <Link href={`/profil/${profile.id}`} aria-label="Mon profil" style={{
                width: 40, height: 40, borderRadius: '50%',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                background: profile.avatar_url ? 'transparent' : 'rgba(42, 255, 160, 0.12)',
                overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 15, fontWeight: 700, color: 'var(--color-primary)',
                textDecoration: 'none', flexShrink: 0,
              }}>
                {profile.avatar_url
                  ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : profile.username.charAt(0).toUpperCase()}
              </Link>
            ) : null}
          </div>
        </div>

        {/* Search dropdown */}
        {searchOpen && (
          <div style={{
            position: 'absolute', top: 78, left: 0, right: 0,
            padding: '8px 10px',
            background: 'var(--color-surface-elevated)',
            borderBottom: '1px solid var(--color-border-subtle)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            zIndex: 1001,
            borderRadius: '0 0 18px 18px',
            animation: 'slideDown 0.18s ease',
          }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 6 }}>
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('header.searchShort')}
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: 12,
                  border: '1px solid var(--color-border-subtle)',
                  background: 'var(--color-bg-secondary)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.85rem', outline: 'none',
                  fontFamily: 'var(--font-inter)',
                }}
              />
              <button type="submit" style={{
                padding: '0 16px', borderRadius: 12,
                background: 'var(--gradient-green)', color: 'var(--color-text-on-primary)',
                border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: '0.75rem',
                fontFamily: 'var(--font-plus-jakarta)',
              }}>OK</button>
            </form>
          </div>
        )}
      </header>

      {/* Spacer */}
      <div className="mobile-spacer" style={{ height: 68 }} />

      <style>{`
        @media (max-width: 767px) {
          #mobile-header { display: flex !important; }
          .mobile-spacer { display: block !important; height: calc(82px + env(safe-area-inset-top)) !important; }
        }
        @media (min-width: 768px) {
          #mobile-header { display: none !important; }
          .mobile-spacer { display: none !important; }
        }
        #mobile-header .header-icon-btn:active,
        #mobile-header #notification-bell:active {
          transform: scale(0.96);
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
