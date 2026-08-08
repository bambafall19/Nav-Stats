'use client'

import Link from 'next/link'
import { Handshake, ExternalLink } from 'lucide-react'
import { useT } from '@/lib/i18n/LanguageProvider'
import type { Database } from '@/types/database.types'

type HomePartenaire = Database['public']['Tables']['partenaires']['Row']

const TIER_STYLES: Record<HomePartenaire['niveau'], { badge: { bg: string; color: string; border: string }; glow: string }> = {
  or: {
    badge: { bg: 'linear-gradient(135deg, #ffd97d, #f0a800)', color: '#1a0a00', border: '1px solid rgba(255,201,77,0.45)' },
    glow: '0 0 0 1px rgba(255,201,77,0.18), 0 8px 22px rgba(255,201,77,0.10)',
  },
  argent: {
    badge: { bg: 'linear-gradient(135deg, #e4ece9, #9aa8a3)', color: '#10161a', border: '1px solid rgba(201,212,208,0.4)' },
    glow: '0 0 0 1px rgba(201,212,208,0.15), 0 8px 22px rgba(201,212,208,0.08)',
  },
  bronze: {
    badge: { bg: 'linear-gradient(135deg, #e8a15c, #8a4a0e)', color: '#fff7ec', border: '1px solid rgba(217,119,6,0.4)' },
    glow: '0 0 0 1px rgba(217,119,6,0.15), 0 8px 22px rgba(217,119,6,0.08)',
  },
}

export default function Partenaires({ partenaires }: { partenaires: HomePartenaire[] }) {
  const t = useT()

  return (
    <section id="partenaires-section" className="partenaires-section">
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(42,255,160,0.08)',
          border: '1px solid rgba(42,255,160,0.22)',
          color: 'var(--color-primary)',
          fontSize: '0.6rem', fontWeight: 800,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          padding: '4px 13px', borderRadius: 'var(--radius-full)',
          fontFamily: 'var(--font-plus-jakarta)',
          marginBottom: 8,
        }}>
          <Handshake size={11} />
          {t('partenaires.title')}
        </span>
        <h2 style={{
          fontFamily: 'var(--font-plus-jakarta)',
          fontSize: 'clamp(1.05rem, 3vw, 1.3rem)',
          fontWeight: 900,
          color: 'var(--color-text-primary)',
          margin: 0,
          letterSpacing: '-0.02em',
        }}>
          {t('partenaires.title')}
        </h2>
        <p style={{
          color: 'var(--color-text-muted)',
          fontSize: '0.76rem',
          marginTop: 6,
          maxWidth: 420,
          marginLeft: 'auto',
          marginRight: 'auto',
          lineHeight: 1.5,
        }}>
          {t('partenaires.subtitle')}
        </p>
      </div>

      <div className="partenaires-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: 12,
      }}>
        {partenaires.map(p => {
          const tier = TIER_STYLES[p.niveau]
          return (
            <div key={p.id} className="partenaire-card" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
              padding: '18px 14px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--color-surface-card)',
              border: '1px solid var(--color-border-subtle)',
              boxShadow: tier.glow,
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              minWidth: 0,
            }}>
              <span style={{
                position: 'absolute', top: 10, right: 10,
                background: tier.badge.bg,
                color: tier.badge.color,
                border: tier.badge.border,
                fontSize: '0.5rem', fontWeight: 800,
                letterSpacing: '0.04em', textTransform: 'uppercase',
                padding: '2px 8px', borderRadius: 999,
                fontFamily: 'var(--font-plus-jakarta)',
              }}>
                {t(`partenaires.tier${p.niveau[0].toUpperCase()}${p.niveau.slice(1)}`)}
              </span>

              {p.logo_url ? (
                <img src={p.logo_url} alt={p.nom} style={{
                  width: 52, height: 52, borderRadius: 14, objectFit: 'cover',
                  background: 'var(--color-surface-elevated)',
                  border: '1px solid var(--color-border-subtle)',
                }} />
              ) : (
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: 'linear-gradient(135deg, rgba(42,255,160,0.14), rgba(16,185,129,0.08))',
                  border: '1px solid rgba(42,255,160,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-primary)',
                  fontWeight: 800,
                  fontSize: '1.2rem',
                  fontFamily: 'var(--font-plus-jakarta)',
                }}>
                  {p.nom.charAt(0).toUpperCase()}
                </div>
              )}

              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                <div style={{
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-plus-jakarta)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {p.nom}
                </div>
                {p.description && (
                  <div style={{
                    fontSize: '0.68rem',
                    color: 'var(--color-text-muted)',
                    marginTop: 3,
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {p.description}
                  </div>
                )}
              </div>

              {p.lien_url && (
                <a href={p.lien_url} target="_blank" rel="noopener noreferrer" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  color: 'var(--color-primary)',
                  fontSize: '0.68rem', fontWeight: 700,
                  textDecoration: 'none',
                  fontFamily: 'var(--font-plus-jakarta)',
                }}>
                  <ExternalLink size={11} />
                  {t('partenaires.visiter')}
                </a>
              )}
            </div>
          )
        })}

        {/* CTA devenir partenaire */}
        <Link href="mailto:contact@navestats.site" className="partenaire-cta" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '18px 14px',
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(255,255,255,0.02)',
          border: '1px dashed rgba(255,255,255,0.18)',
          textDecoration: 'none',
          minWidth: 0,
          transition: 'all var(--transition-base) var(--ease-out)',
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: 13,
            background: 'linear-gradient(135deg, rgba(255,201,77,0.12), rgba(255,201,77,0.22))',
            border: '1px solid rgba(255,201,77,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Handshake size={18} color="#ffc94d" />
          </div>
          <div style={{
            fontWeight: 800,
            fontSize: '0.78rem',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-plus-jakarta)',
          }}>
            {t('partenaires.devenir')}
          </div>
          <div style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
            {t('partenaires.devenirDesc')}
          </div>
        </Link>
      </div>

      <style>{`
        .partenaires-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        @media (min-width: 640px) {
          .partenaires-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
        .partenaire-card,
        .partenaire-cta {
          transition: transform var(--transition-base) var(--ease-out), box-shadow var(--transition-base) var(--ease-out), border-color var(--transition-base) var(--ease-out);
        }
        .partenaire-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-card-hover);
          border-color: rgba(42,255,160,0.2);
        }
        .partenaire-cta:hover {
          transform: translateY(-3px);
          border-color: rgba(255,201,77,0.4);
          background: rgba(255,201,77,0.04);
        }
      `}</style>
    </section>
  )
}
