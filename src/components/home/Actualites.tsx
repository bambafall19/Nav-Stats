import type { Database } from '@/types/database.types'

type Actualite = Database['public']['Tables']['actualites']['Row']

const categorieColor: Record<string, { bg: string; color: string; label: string }> = {
  actualite: { bg: 'rgba(59,130,246,0.1)', color: '#1d4ed8', label: '📰 Actualité' },
  annonce: { bg: 'rgba(251,191,0,0.15)', color: '#7a5900', label: '📢 Annonce' },
  resultat: { bg: 'rgba(0,166,81,0.1)', color: '#006233', label: '🏆 Résultat' },
  classement: { bg: 'rgba(139,92,246,0.1)', color: '#6d28d9', label: '📊 Classement' },
}

export default function Actualites({ actualites }: { actualites: Actualite[] }) {
  return (
    <div>
      <h2 className="section-title" style={{ marginBottom: 4 }}>📰 Actualités</h2>
      <p className="section-subtitle" style={{ marginBottom: 20 }}>Dernières nouvelles des Navétanes</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {actualites.map(actu => {
          const cat = categorieColor[actu.categorie] || categorieColor.actualite
          return (
            <div key={actu.id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 600,
                      background: cat.bg, color: cat.color,
                      padding: '3px 8px', borderRadius: 'var(--radius-full)',
                    }}>{cat.label}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                      {new Date(actu.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 6, lineHeight: 1.3 }}>
                    {actu.titre}
                  </h3>
                  <p style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {actu.contenu}
                  </p>
                </div>
                {actu.image_url && (
                  <img src={actu.image_url} alt={actu.titre} style={{ width: 72, height: 72, borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0 }} />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
