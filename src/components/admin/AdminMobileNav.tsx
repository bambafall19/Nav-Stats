'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, ArrowLeft } from 'lucide-react'
import { adminLinks } from '@/lib/adminLinks'
import { usePathname } from 'next/navigation'

export default function AdminMobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* ===== Barre supérieure mobile ===== */}
      <div
        className="admin-mobile-bar"
        style={{
          display: 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 58,
          zIndex: 60,
          background: 'var(--gradient-header)',
          borderBottom: '1px solid var(--color-border-subtle)',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          boxShadow: '0 2px 16px rgba(0,0,0,0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img
            src="/oncav-logo.png"
            alt="ONCAV Logo"
            style={{ width: 30, height: 30, borderRadius: 8, objectFit: 'cover' }}
          />
          <span style={{ fontFamily: 'var(--font-plus-jakarta)', fontWeight: 800, color: 'white', fontSize: '0.95rem', letterSpacing: '-0.02em' }}>
            NavéStats Admin
          </span>
        </div>
        <button
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le menu admin"
          style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Menu size={20} />
        </button>
      </div>

      {/* ===== Drawer latéral ===== */}
      {open && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 80,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
          }}
          onClick={() => setOpen(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute', top: 0, bottom: 0, left: 0,
              width: 'min(300px, 85vw)',
              background: 'var(--color-surface)',
              boxShadow: '0 0 40px rgba(0,0,0,0.5)',
              display: 'flex', flexDirection: 'column',
              animation: 'adminDrawerIn 0.22s ease',
            }}
          >
            <div style={{
              padding: '16px',
              background: 'var(--gradient-header)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img src="/oncav-logo.png" alt="ONCAV Logo" style={{ width: 32, height: 32, borderRadius: 9, objectFit: 'cover' }} />
                <span style={{ fontFamily: 'var(--font-plus-jakarta)', fontWeight: 800, color: 'white', fontSize: '1rem' }}>NavéStats</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fermer le menu"
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <nav style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
              {adminLinks.map(link => {
                const Icon = link.icon
                const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px', borderRadius: 12,
                      textDecoration: 'none',
                      color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                      background: isActive ? 'var(--color-primary-50)' : 'transparent',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.88rem', marginBottom: 2,
                      fontFamily: 'var(--font-plus-jakarta)',
                    }}
                  >
                    <Icon size={18} strokeWidth={1.9} />
                    {link.label}
                  </Link>
                )
              })}
            </nav>

            <div style={{ padding: 12, borderTop: '1px solid var(--color-border-subtle)' }}>
              <Link
                href="/"
                onClick={() => setOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 12px', borderRadius: 10, textDecoration: 'none',
                  color: 'var(--color-text-secondary)', fontSize: '0.85rem',
                  fontFamily: 'var(--font-plus-jakarta)',
                }}
              >
                <ArrowLeft size={16} />
                Retour au site
              </Link>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .admin-mobile-bar { display: flex !important; }
        }
        @keyframes adminDrawerIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  )
}
