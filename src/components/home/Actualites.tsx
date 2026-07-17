import Image from 'next/image'
import { ACTUALITE_CATEGORY_CONFIG } from '@/lib/constants/actualiteCategories'
import type { Database } from '@/types/database.types'

type Actualite = Database['public']['Tables']['actualites']['Row']

export default function Actualites({ actualites }: { actualites: Actualite[] }) {
  return (
    <div>
      <h2 className="section-title" style={{ marginBottom: 4 }}>📰 Actualités</h2>
      <p className="section-subtitle" style={{ marginBottom: 20 }}>Dernières nouvelles des Navétanes</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {actualites.map((actu, i) => {
          const cat = ACTUALITE_CATEGORY_CONFIG[actu.categorie as keyof typeof ACTUALITE_CATEGORY_CONFIG] || ACTUALITE_CATEGORY_CONFIG.actualite
          return (
            <div key={actu.id} className="card" style={{
              padding: 16,
              display: 'flex',
              gap: 14,
              alignItems: 'flex-start',
              animation: `fadeInUp 0.4s ${i * 0.05}s ease both`,
            }}>
              {actu.image_url && (
                <Image
                  src={actu.image_url}
                  alt={actu.titre}
                  width={80}
                  height={80}
                  style={{ borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0 }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 700,
                    background: cat.bg, color: cat.color,
                    padding: '3px 10px', borderRadius: 'var(--radius-full)',
                    letterSpacing: '0.03em',
                  }}>{cat.label}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                    {new Date(actu.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4, lineHeight: 1.3 }}>
                  {actu.titre}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {actu.contenu}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
