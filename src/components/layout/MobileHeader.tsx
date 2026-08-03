'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'
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
          height: 52,
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
          padding: '0 14px',
          gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Rechercher"
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
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

            {profile && <NotificationBell userId={profile.id} />}
          </div>

          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'var(--gradient-green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
              boxShadow: '0 3px 10px rgba(0,98,51,0.18)',
            }}>
              <img src="/logo.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
            </div>
            <span style={{
              fontFamily: 'var(--font-outfit)',
              fontWeight: 800,
              fontSize: '0.95rem',
              color: 'var(--color-primary)',
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
            }}>NavéStats</span>
          </Link>
        </div>

        {searchOpen && (
          <div style={{
            position: 'absolute',
            top: 52,
            left: 0,
            right: 0,
            padding: '8px 14px',
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
                  padding: '10px 12px',
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
                  padding: '0 14px',
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