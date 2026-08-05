'use client'

import { useState } from 'react'
import { TeamStatsChart } from '@/components/shared/TeamStatsChart'
import { SocialShareButtons } from '@/components/shared/SocialShareButtons'
import { ComparisonChart } from '@/components/shared/ComparisonChart'

interface EquipeClientProps {
  equipe: any
  stats: any
}

export function EquipeClient({ equipe, stats }: EquipeClientProps) {
  const [showComparison, setShowComparison] = useState(false)

  const shareText = `Découvrez ${equipe?.nom} sur NavéStats: ${equipe?.points_classement} points`
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      {/* En-tête équipe */}
      <div style={{
        background: `linear-gradient(135deg, ${equipe?.couleur_principale || '#0b5234'} 0%, ${equipe?.couleur_secondaire || 'var(--color-primary)'} 100%)`,
        borderRadius: 'var(--radius-xl)',
        padding: 24,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-green)',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -20, fontSize: 100, opacity: 0.1 }}>⚽</div>
        <div style={{
          position: 'absolute', bottom: -60, left: -30, width: 160, height: 160, borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
            {equipe?.logo_url ? (
              <img
                src={equipe.logo_url}
                alt=""
                style={{ width: 80, height: 80, borderRadius: 'var(--radius-md)', objectFit: 'cover', border: '3px solid white' }}
              />
            ) : (
              <div style={{
                width: 80,
                height: 80,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                border: '3px solid white',
              }}>
                ⚽
              </div>
            )}
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, marginBottom: 4, color: 'white' }}>
                {equipe?.nom}
              </h1>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>
                {equipe?.quartier && `${equipe.quartier} • `}
                {equipe?.asc_nom && `ASC ${equipe.asc_nom}`}
              </p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 10,
            marginBottom: 16,
          }}>
            <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 'var(--radius-md)', padding: 12, textAlign: 'center', border: '1px solid rgba(255,255,255,0.14)' }}>
              <div style={{ fontSize: '0.78rem', opacity: 0.8, fontWeight: 600 }}>Points</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{equipe?.points_classement || 0}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 'var(--radius-md)', padding: 12, textAlign: 'center', border: '1px solid rgba(255,255,255,0.14)' }}>
              <div style={{ fontSize: '0.78rem', opacity: 0.8, fontWeight: 600 }}>Matchs</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{equipe?.matchs_joues || 0}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 'var(--radius-md)', padding: 12, textAlign: 'center', border: '1px solid rgba(255,255,255,0.14)' }}>
              <div style={{ fontSize: '0.78rem', opacity: 0.8, fontWeight: 600 }}>Buts +/-</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>
                {(equipe?.buts_marques || 0) - (equipe?.buts_encaisses || 0)}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowComparison(!showComparison)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.82rem',
              backdropFilter: 'blur(8px)',
              transition: 'background var(--transition-base)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            ⚖️ Comparer
          </button>
        </div>
      </div>

      {/* Partage social */}
      <div style={{
        background: 'var(--color-surface-card)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: 16,
        boxShadow: 'var(--shadow-card)',
      }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 12 }}>Partager cette équipe</div>
        <SocialShareButtons
          title={equipe?.nom}
          text={shareText}
          url={shareUrl}
        />
      </div>

      {/* Statistiques détaillées */}
      <div style={{
        background: 'var(--color-surface-card)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: 16,
        boxShadow: 'var(--shadow-card)',
      }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 16 }}>📊 Statistiques détaillées</div>
        <TeamStatsChart stats={{
          name: equipe?.nom,
          matchsJoues: equipe?.matchs_joues || 0,
          victoires: equipe?.victoires || 0,
          nuls: equipe?.nuls || 0,
          defaites: equipe?.defaites || 0,
          butsMarques: equipe?.buts_marques || 0,
          butsEncaisses: equipe?.buts_encaisses || 0,
          points: equipe?.points_classement || 0,
          historique: stats?.historique || [],
        }} />
      </div>

      {/* Résumé */}
      <div style={{
        background: 'var(--color-surface-card)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: 16,
        boxShadow: 'var(--shadow-card)',
      }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 16 }}>📈 Résumé</div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12,
        }}>
          <div style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-md)',
            padding: 12,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>
              Victoires
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--color-primary)' }}>
              {equipe?.victoires || 0}
            </div>
          </div>
          <div style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-md)',
            padding: 12,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>
              Nuls
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--color-accent)' }}>
              {equipe?.nuls || 0}
            </div>
          </div>
          <div style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-md)',
            padding: 12,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>
              Défaites
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--color-red)' }}>
              {equipe?.defaites || 0}
            </div>
          </div>
          <div style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-md)',
            padding: 12,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>
              Différence
            </div>
            <div style={{
              fontSize: '1.3rem',
              fontWeight: 900,
              color: (equipe?.buts_marques || 0) - (equipe?.buts_encaisses || 0) > 0 ? 'var(--color-primary)' : 'var(--color-red)',
            }}>
              {(equipe?.buts_marques || 0) - (equipe?.buts_encaisses || 0) > 0 ? '+' : ''}
              {(equipe?.buts_marques || 0) - (equipe?.buts_encaisses || 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
