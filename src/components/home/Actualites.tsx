import Image from 'next/image'
import { ACTUALITE_CATEGORY_CONFIG } from '@/lib/constants/actualiteCategories'
import type { Database } from '@/types/database.types'

type Actualite = Database['public']['Tables']['actualites']['Row']

export default function Actualites({ actualites }: { actualites: Actualite[] }) {
  return (
    <div>
      <h2 className="section-title" style={{ marginBottom: 4 }}>📰 Actualités</h2>
      <p className="section-subtitle" style={{ marginBottom: 20 }}>Dernières nouvelles des Navétanes</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {actualites.map(actu => {
          const cat = ACTUALITE_CATEGORY_CONFIG[actu.categorie as keyof typeof ACTUALITE_CATEGORY_CONFIG] || ACTUALITE_CATEGORY_CONFIG.actualite
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
                  <Image src={actu.image_url} alt={actu.titre} width={72} height={72} style={{ borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0 }} />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
