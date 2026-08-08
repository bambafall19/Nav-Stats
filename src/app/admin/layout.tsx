import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  LayoutDashboard, Shield, Users, Target, Calendar, Trophy,
  CheckCircle, UserCheck, Newspaper, Bell, ArrowLeft, BarChart3, Handshake,
} from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single() as any

  if (!profile?.is_admin) redirect('/')

  const adminLinks = [
    { href: '/admin', icon: LayoutDashboard, label: 'Tableau de bord' },
    { href: '/admin/equipes', icon: Shield, label: 'Équipes' },
    { href: '/admin/joueurs', icon: UserCheck, label: 'Joueurs' },
    { href: '/admin/matchs', icon: Target, label: 'Matchs' },
    { href: '/admin/cadets', icon: Calendar, label: 'Cadets' },
    { href: '/admin/classements', icon: Trophy, label: 'Classements' },
    { href: '/admin/resultats', icon: CheckCircle, label: 'Résultats' },
    { href: '/admin/utilisateurs', icon: Users, label: 'Utilisateurs' },
    { href: '/admin/actualites', icon: Newspaper, label: 'Actualités' },
    { href: '/admin/partenaires', icon: Handshake, label: 'Partenaires' },
    { href: '/admin/notifications', icon: Bell, label: 'Notifications' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      {/* Sidebar */}
      <aside
        className="admin-sidebar"
        style={{
          width: 260,
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 50,
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 16px',
          borderBottom: '1px solid var(--color-border-subtle)',
          background: 'var(--gradient-header)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img
              src="/oncav-logo.png"
              alt="ONCAV Logo"
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                objectFit: 'cover',
                flexShrink: 0,
                background: 'var(--color-surface-elevated)',
              }}
            />
            <div>
              <div style={{
                fontFamily: 'var(--font-plus-jakarta)',
                fontWeight: 800,
                color: 'white',
                fontSize: '1rem',
                letterSpacing: '-0.02em',
              }}>NavéStats</div>
              <div style={{
                fontSize: '0.65rem',
                color: 'rgba(255,255,255,0.7)',
                fontWeight: 500,
              }}>Zone 6 Khombole</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: 12, overflowY: 'auto' }}>
          {adminLinks.map(link => {
            const Icon = link.icon
            return (
              <a
                key={link.href}
                href={link.href}
                className="admin-nav-link"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 10,
                  textDecoration: 'none',
                  color: 'var(--color-text-secondary)',
                  marginBottom: 2,
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  transition: 'all 0.15s',
                  fontFamily: 'var(--font-plus-jakarta)',
                }}
              >
                <Icon size={17} strokeWidth={1.8} />
                {link.label}
              </a>
            )
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: 12, borderTop: '1px solid var(--color-border-subtle)' }}>
          <a
            href="/"
            className="admin-back-link"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              borderRadius: 10,
              textDecoration: 'none',
              color: 'var(--color-text-secondary)',
              fontSize: '0.85rem',
              transition: 'all 0.2s',
              fontFamily: 'var(--font-plus-jakarta)',
            }}
          >
            <ArrowLeft size={16} />
            Retour au site
          </a>
        </div>
      </aside>

      {/* Main content */}
      <main
        className="admin-main"
        style={{ flex: 1, marginLeft: 260, padding: 32, minHeight: '100vh' }}
      >
        {children}
      </main>

      <style>{`
        .admin-nav-link:hover {
          background: var(--color-primary-50) !important;
          color: var(--color-primary) !important;
        }
        .admin-back-link:hover {
          background: var(--color-surface-hover) !important;
        }
        @media (max-width: 768px) {
          .admin-sidebar { display: none !important; }
          .admin-main { margin-left: 0 !important; padding: 20px !important; }
        }
      `}</style>
    </div>
  )
}
