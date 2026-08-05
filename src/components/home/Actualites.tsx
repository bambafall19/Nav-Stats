import Image from 'next/image'
import { ACTUALITE_CATEGORY_CONFIG } from '@/lib/constants/actualiteCategories'
import { Newspaper, ChevronRight, ArrowRight } from 'lucide-react'
import type { Database } from '@/types/database.types'

type Actualite = Database['public']['Tables']['actualites']['Row']

export default function Actualites({ actualites }: { actualites: Actualite[] }) {
  const [featured, ...rest] = actualites

  if (!featured) return null

  const cat = ACTUALITE_CATEGORY_CONFIG[featured.categorie as keyof typeof ACTUALITE_CATEGORY_CONFIG] || ACTUALITE_CATEGORY_CONFIG.actualite
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, justifyContent: 'center' }}>
        <div style={{
          width: 30, height: 30, borderRadius: 10,
          background: 'rgba(29,78,216,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Newspaper size={15} color="#2563eb" />
        </div>
        <h2 className="section-title" style={{ fontSize: '1.05rem' }}>Actualités</h2>
      </div>
      <p className="section-subtitle" style={{ marginBottom: 14, textAlign: 'center', fontSize: '0.7rem' }}>
        Dernières nouvelles des Navétanes
      </p>

      {/* Featured big card */}
      <div className="actu-featured" style={{
        position: 'relative',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        minHeight: 200,
        background: 'linear-gradient(135deg, #1e3a8a, #0f172a)',
        boxShadow: 'var(--shadow-card)',
        cursor: 'pointer',
      }}>
          {featured.image_url && (
            <Image
              src={featured.image_url}
              alt={featured.titre}
              width={800}
              height={450}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(15,23,42,0) 30%, rgba(15,23,42,0.95) 100%)',
          }} />
          <div style={{ position: 'relative', zIndex: 1, padding: '18px 16px', display: 'flex', flexDirection: 'column', minHeight: 200, justifyContent: 'flex-end' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.58rem', fontWeight: 800,
                background: cat.color, color: 'white',
                padding: '3px 10px', borderRadius: 999,
                letterSpacing: '0.03em',
                fontFamily: 'var(--font-plus-jakarta)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}>{cat.label}</span>
              <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                {formatDate(featured.created_at)}
              </span>
            </div>
            <h3 style={{
              fontSize: '1rem', fontWeight: 800,
              color: 'white', lineHeight: 1.3,
              fontFamily: 'var(--font-plus-jakarta)', margin: 0,
              overflow: 'hidden', textOverflow: 'ellipsis',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            }}>
              {featured.titre}
            </h3>
            <p style={{
              fontSize: '0.72rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5,
              overflow: 'hidden', display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              margin: '6px 0 0', fontWeight: 500,
            }}>
              {featured.contenu}
            </p>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              marginTop: 12, color: 'white', fontWeight: 700,
              fontSize: '0.68rem', fontFamily: 'var(--font-plus-jakarta)',
              alignSelf: 'flex-start', padding: '7px 14px', borderRadius: 99,
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
              backdropFilter: 'blur(8px)',
            }}>
              Lire l'article <ArrowRight size={12} />
            </span>
          </div>
        </div>

      {/* Secondary cards */}
      {rest.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
          {rest.slice(0, 3).map((actu) => {
            const c = ACTUALITE_CATEGORY_CONFIG[actu.categorie as keyof typeof ACTUALITE_CATEGORY_CONFIG] || ACTUALITE_CATEGORY_CONFIG.actualite
            return (
              <div className="actu-card" key={actu.id} style={{
                display: 'flex',
                gap: 12,
                padding: 14,
                background: 'var(--color-surface-card)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-card)',
                transition: 'all var(--transition-base) var(--ease-out)',
              }}>
                  {actu.image_url ? (
                    <Image
                      src={actu.image_url}
                      alt={actu.titre}
                      width={80}
                      height={80}
                      style={{ borderRadius: 12, objectFit: 'cover', flexShrink: 0, width: 80, height: 80 }}
                    />
                  ) : (
                    <div style={{
                      width: 80, height: 80, borderRadius: 12, flexShrink: 0,
                      background: `linear-gradient(135deg, ${c.color}22, ${c.color}44)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Newspaper size={24} color={c.color} />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5, flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '0.56rem', fontWeight: 700,
                        background: c.bg, color: c.color,
                        padding: '2px 8px', borderRadius: 999,
                        fontFamily: 'var(--font-plus-jakarta)',
                      }}>{c.label}</span>
                      <span style={{ fontSize: '0.56rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        {formatDate(actu.created_at)}
                      </span>
                    </div>
                    <h3 style={{
                      fontSize: '0.8rem', fontWeight: 700,
                      color: 'var(--color-text-primary)', lineHeight: 1.3,
                      fontFamily: 'var(--font-plus-jakarta)', margin: '0 0 4px',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
                    }}>
                      {actu.titre}
                    </h3>
                    <p style={{
                      fontSize: '0.66rem', color: 'var(--color-text-secondary)', lineHeight: 1.45,
                      overflow: 'hidden', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      margin: 0,
                    }}>
                      {actu.contenu}
                    </p>
                  </div>
                  <ChevronRight size={14} style={{ alignSelf: 'center', flexShrink: 0, color: 'var(--color-text-muted)', opacity: 0.5 }} />
                </div>
            )
          })}
        </div>
      )}

      <style>{`
        .actu-card:hover { border-color: var(--color-border); box-shadow: var(--shadow-card-hover) !important; transform: translateY(-2px); }
        .actu-featured:hover { box-shadow: var(--shadow-card-hover); transform: translateY(-2px); }
        .actu-featured, .actu-featured img { transition: transform var(--transition-slow) var(--ease-out); }
        .actu-featured:hover img { transform: scale(1.04); }
      `}</style>
    </div>
  )
}
