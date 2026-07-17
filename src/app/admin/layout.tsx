import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single() as any

  if (!profile?.is_admin) redirect('/')

  const adminLinks = [
    { href: '/admin', icon: '📊', label: 'Tableau de bord' },
    { href: '/admin/equipes', icon: '🛡️', label: 'Équipes' },
    { href: '/admin/joueurs', icon: '👤', label: 'Joueurs' },
    { href: '/admin/matchs', icon: '⚽', label: 'Matchs' },
    { href: '/admin/classements', icon: '🏆', label: 'Classements' },
    { href: '/admin/resultats', icon: '✅', label: 'Résultats' },
    { href: '/admin/utilisateurs', icon: '👥', label: 'Utilisateurs' },
    { href: '/admin/actualites', icon: '📰', label: 'Actualités' },
    { href: '/admin/notifications', icon: '🔔', label: 'Notifications' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-surface)' }}>
      {/* Admin Sidebar */}
      <aside style={{
        width: 260,
        background: 'white',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, bottom: 0, left: 0,
        zIndex: 50,
        boxShadow: 'var(--shadow-md)',
      }} className="admin-sidebar">
        {/* Logo */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--gradient-hero)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img
              src="/logo.png"
              alt="NavéStats Logo"
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                objectFit: 'cover',
                flexShrink: 0,
              }}
            />
            <div>
              <div style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, color: 'white', fontSize: '1.1rem' }}>NavéStats</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Admin Panel</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: 16, overflowY: 'auto' }}>
          {adminLinks.map(link => (
            <a key={link.href} href={link.href} className="admin-nav-link" style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', borderRadius: 'var(--radius-md)',
              textDecoration: 'none', color: 'var(--color-text-secondary)',
              marginBottom: 4, fontSize: '0.875rem', fontWeight: 500,
              transition: 'all 0.2s',
            }}
            >
              <span style={{ fontSize: '1rem', width: 20, textAlign: 'center' }}>{link.icon}</span>
              {link.label}
            </a>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: 16, borderTop: '1px solid var(--color-border)' }}>
          <a href="/" className="admin-back-link" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'var(--color-text-secondary)', fontSize: '0.875rem', transition: 'all 0.2s' }}>
            ← Retour au site
          </a>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, marginLeft: 260, padding: 32, minHeight: '100vh' }} className="admin-main">
        {children}
      </main>

      <style>{`
        .admin-nav-link:hover {
          background: rgba(0, 98, 51, 0.07) !important;
          color: var(--color-primary) !important;
        }
        .admin-back-link:hover {
          background: rgba(0, 98, 51, 0.07) !important;
        }
        @media (max-width: 768px) {
          .admin-sidebar { display: none !important; }
          .admin-main { margin-left: 0 !important; padding: 20px !important; }
        }
      `}</style>
    </div>
  )
}