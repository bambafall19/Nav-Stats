'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Search, Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'
import ThemeToggle from '@/components/shared/ThemeToggle'
import NotificationBell from '@/components/shared/NotificationBell'

type Profile = Database['public']['Tables']['profiles']['Row']

export default function MobileHeader() {
  const pathname = usePathname()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then((res) => {
      const user = res.data?.user
      if (user) {
        supabase.from('profiles').select('*').eq('id', user.id).single()
          .then((resProfile) => setProfile(resProfile.data))
      }
    })
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
          top: 0,
          left: 0,
          right: 0,
          height: 56,
          background: 'var(--header-bg)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid var(--header-border)',
          boxShadow: 'var(--header-shadow)',
          zIndex: 1000,
          display: 'none',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100%',
          padding: '0 10px',
          gap: 8,
        }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
            <div style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: 'var(--gradient-green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
              boxShadow: '0 3px 10px rgba(0,98,51,0.2)',
            }}>
              <img src="/logo.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
            </div>
            <span style={{
              fontFamily: 'var(--font-outfit)',
              fontWeight: 800,
              fontSize: '0.95rem',
              color: 'var(--color-primary)',
              letterSpacing: '-0.03em',
              whiteSpace: 'nowrap',
            }}>NavéStats</span>
          </Link>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Rechercher"
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface-card)',
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.15s ease',
              }}
            >
              <Search size={16} />
            </button>

            <ThemeToggle />

            {profile && <NotificationBell userId={profile.id} />}
          </div>
        </div>

        {/* Search overlay */}
        {searchOpen && (
          <div style={{
            position: 'absolute',
            top: 56,
            left: 0,
            right: 0,
            padding: '8px 10px',
            background: 'var(--color-surface-card)',
            borderBottom: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-md)',
            zIndex: 1001,
            animation: 'slideDown 0.18s ease',
          }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 6 }}>
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher équipes, matchs, joueurs..."
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  borderRadius: 10,
                  border: '1.5px solid var(--color-border)',
                  background: 'var(--color-bg-secondary)',
                  color: 'var(--color-text-primary)',
                  fontSize: '15px',
                  outline: 'none',
                  fontFamily: 'var(--font-inter)',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '0 12px',
                  borderRadius: 10,
                  background: 'var(--gradient-green)',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-outfit)',
                  boxShadow: 'var(--shadow-green)',
                }}
              >
                OK
              </button>
            </form>
          </div>
        )}
      </header>

      <style>{`
        @media (max-width: 767px) {
          #mobile-header { display: flex !important; }
        }
        @media (min-width: 768px) {
          #mobile-header { display: none !important; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}