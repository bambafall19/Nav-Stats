'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  Home, Trophy, Target, BarChart3, Calendar, MessageCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const mobileNavLinks = [
  { href: '/', label: 'Accueil', Icon: Home },
  { href: '/matchs', label: 'Matchs', Icon: Target },
  { href: '/cadets', label: 'Cadets', Icon: Calendar },
  { href: '/classements', label: 'Classements', Icon: Trophy },
  { href: '/statistiques', label: 'Senior', Icon: BarChart3 },
  { href: '/communaute', label: 'Chat', Icon: MessageCircle },
]

const desktopNavLinks = [
  { href: '/', label: 'Accueil', Icon: Home },
  { href: '/matchs', label: 'Matchs', Icon: Target, live: true },
  { href: '/cadets', label: 'Cadets', Icon: Calendar },
  { href: '/classements', label: 'Classements', Icon: Trophy },
  { href: '/statistiques', label: 'Senior', Icon: BarChart3 },
  { href: '/communaute', label: 'Chat', Icon: MessageCircle },
]

const ACTIVE_BLUE = '#2563EB'

export default function BottomNav() {
  const pathname = usePathname()
  const [liveCount, setLiveCount] = useState(0)

  useEffect(() => {
    const supabase = createClient()
    ;(async () => {
      try {
        const { data } = await supabase.from('matchs').select('id').eq('statut', 'en_cours')
        if (data) setLiveCount(data.length)
      } catch {
        // Connexion Supabase temporairement indisponible — ignoré silencieusement
      }
    })()
  }, [])

  return (
    <>
      {/* ===== MOBILE : barre flottante premium ===== */}
      <nav
        id="mobile-bottom-nav"
        aria-label="Navigation principale mobile"
        style={{
          position: 'fixed',
          bottom: 'max(32px, env(safe-area-inset-bottom))',
          left: 0,
          right: 0,
          margin: '0 auto',
          width: '84%',
          maxWidth: 400,
          height: 52,
          background: 'rgba(17, 17, 17, 0.9)',
          backdropFilter: 'blur(14px) saturate(150%)',
          WebkitBackdropFilter: 'blur(14px) saturate(150%)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '0 18px 40px rgba(0,0,0,0.45), 0 6px 16px rgba(0,0,0,0.25), 0 2px 6px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 5px',
          borderRadius: 26,
          zIndex: 999,
        }}
      >
        {mobileNavLinks.map(link => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
          const Icon = link.Icon
          return (
            <Link
              key={link.href}
              href={link.href}
              className="mobile-nav-item"
              data-active={isActive ? 'true' : 'false'}
              aria-current={isActive ? 'page' : undefined}
              aria-label={link.label}
            >
              <span className="mobile-nav-icon-wrap" data-active={isActive ? 'true' : 'false'}>
                <Icon size={18} strokeWidth={isActive ? 2.2 : 1.9} className="mobile-nav-icon" />
              </span>
              <span className="mobile-nav-label">{link.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* ===== DESKTOP : pilule flottante centrée ===== */}
      <nav
        id="desktop-bottom-nav"
        aria-label="Navigation principale"
        style={{
          position: 'fixed',
          bottom: 'max(16px, env(safe-area-inset-bottom))',
          left: '50%',
          transform: 'translateX(-50%)',
          height: 'var(--desktop-nav-height)',
          background: 'rgba(8, 14, 11, 0.82)',
          backdropFilter: 'blur(24px) saturate(160%)',
          WebkitBackdropFilter: 'blur(24px) saturate(160%)',
          border: '1px solid var(--color-border-subtle)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          borderRadius: 99,
          zIndex: 999,
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          height: '100%',
          padding: '0 8px',
        }}>
          {desktopNavLinks.map(link => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
            const Icon = link.Icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className="desktop-nav-link"
                data-active={isActive ? 'true' : 'false'}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 16px',
                  borderRadius: 12,
                  textDecoration: 'none',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  background: isActive ? 'var(--gradient-green-soft)' : 'transparent',
                  border: isActive ? '1px solid rgba(42,255,160,0.2)' : '1px solid transparent',
                  fontFamily: 'var(--font-display)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.82rem',
                  transition: 'all 0.2s var(--ease-out)',
                  position: 'relative',
                }}
              >
                <Icon size={16} strokeWidth={isActive ? 2.4 : 1.9} />
                <span>{link.label}</span>
                {link.live && liveCount > 0 && (
                  <span className="desktop-nav-live" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '2px 7px', borderRadius: 99,
                    background: 'var(--color-red-light)',
                    color: 'var(--color-red)',
                    fontSize: '0.58rem', fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                  }}>
                    <span style={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: 'var(--color-red)',
                      animation: 'pulse-live 1.2s ease-in-out infinite',
                    }} />
                    {liveCount}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        <style>{`
          @media (min-width: 768px) {
            #mobile-bottom-nav { display: none !important; }
            #desktop-bottom-nav { display: flex !important; }
          }
          @media (max-width: 767px) {
            #desktop-bottom-nav { display: none !important; }
            #mobile-bottom-nav { display: flex !important; }
            #mobile-bottom-nav {
              bottom: max(32px, env(safe-area-inset-bottom)) !important;
              left: 0 !important;
              right: 0 !important;
              margin: 0 auto !important;
              transform: none !important;
              width: 84% !important;
              max-width: 400px !important;
              height: 52px !important;
              border-radius: 26px !important;
              border: 1px solid rgba(255, 255, 255, 0.05) !important;
              box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45), 0 6px 16px rgba(0, 0, 0, 0.25), 0 2px 6px rgba(0, 0, 0, 0.2) !important;
              padding: 0 5px !important;
            }
          }
          #desktop-bottom-nav .desktop-nav-link[data-active="false"]:hover {
            background: var(--color-surface-hover) !important;
            color: var(--color-text-primary) !important;
          }
          #desktop-bottom-nav .desktop-nav-link[data-active="true"]:hover {
            background: var(--gradient-green-soft) !important;
          }
          #desktop-bottom-nav .desktop-nav-live {
            box-shadow: 0 0 0 2px var(--color-bg-primary), 0 0 14px rgba(255,77,90,0.25);
          }
          #desktop-bottom-nav .desktop-nav-link[data-active="false"]:hover { transform: translateY(-1px); }

          #mobile-bottom-nav .mobile-nav-item {
            flex: 1 1 0; min-width: 0; height: 100%;
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            gap: 2px; text-decoration: none;
            cursor: pointer; border: none; background: transparent;
            padding: 0 2px;
            -webkit-tap-highlight-color: transparent;
            transition: transform 0.24s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
          #mobile-bottom-nav .mobile-nav-item:active { transform: scale(0.92); }
          #mobile-bottom-nav .mobile-nav-icon-wrap {
            width: 38px; height: 38px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            background: transparent;
            transform: scale(0.94);
            transition: background 0.24s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.24s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
          #mobile-bottom-nav .mobile-nav-icon-wrap[data-active="true"] {
            background: rgba(37, 99, 235, 0.15);
            transform: scale(1);
          }
          #mobile-bottom-nav .mobile-nav-icon {
            color: #9CA3AF;
            transition: color 0.24s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
          #mobile-bottom-nav .mobile-nav-icon-wrap[data-active="true"] .mobile-nav-icon {
            color: ${ACTIVE_BLUE};
          }
          #mobile-bottom-nav .mobile-nav-label {
            font-size: 9px; line-height: 1; font-weight: 500;
            font-family: var(--font-plus-jakarta);
            color: #9CA3AF; white-space: nowrap;
            letter-spacing: 0;
            transition: color 0.24s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
          #mobile-bottom-nav .mobile-nav-item[data-active="true"] .mobile-nav-label {
            color: ${ACTIVE_BLUE};
          }
        `}</style>
      </nav>
    </>
  )
}
