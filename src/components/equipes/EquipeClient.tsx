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
        background: `linear-gradient(135deg, ${equipe?.couleur_principale || '#004d27'} 0%, ${equipe?.couleur_secondaire || '#008a44'} 100%)`,
        borderRadius: 12,
        padding: 24,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -20, fontSize: 100, opacity: 0.1 }}>⚽</div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
            {equipe?.logo_url ? (
              <img
                src={equipe.logo_url}
                alt=""
                style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover', border: '3px solid white' }}
              />
            ) : (
              <div style={{
                width: 80,
                height: 80,
                borderRadius: 8,
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
              <h1 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, marginBottom: 4 }}>
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
            gap: 12,
            marginBottom: 16,
          }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Points</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{equipe?.points_classement || 0}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Matchs</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{equipe?.matchs_joues || 0}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Buts +/-</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>
                {(equipe?.buts_marques || 0) - (equipe?.buts_encaisses || 0)}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowComparison(!showComparison)}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              border: '1px solid rgba(255,255,255,0.3)',
              background: 'transparent',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
            }}
          >
            ⚖️ Comparer
          </button>
        </div>
      </div>

      {/* Partage social */}
      <div style={{
        background: 'var(--color-surface-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 8,
        padding: 16,
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
        border: '1px solid var(--color-border)',
        borderRadius: 8,
        padding: 16,
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
        border: '1px solid var(--color-border)',
        borderRadius: 8,
        padding: 16,
      }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 16 }}>📈 Résumé</div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12,
        }}>
          <div style={{
            background: 'var(--color-surface)',
            borderRadius: 8,
            padding: 12,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>
              Victoires
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#00A651' }}>
              {equipe?.victoires || 0}
            </div>
          </div>
          <div style={{
            background: 'var(--color-surface)',
            borderRadius: 8,
            padding: 12,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>
              Nuls
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#FFB81C' }}>
              {equipe?.nuls || 0}
            </div>
          </div>
          <div style={{
            background: 'var(--color-surface)',
            borderRadius: 8,
            padding: 12,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>
              Défaites
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#E74C3C' }}>
              {equipe?.defaites || 0}
            </div>
          </div>
          <div style={{
            background: 'var(--color-surface)',
            borderRadius: 8,
            padding: 12,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>
              Différence
            </div>
            <div style={{
              fontSize: '1.3rem',
              fontWeight: 900,
              color: (equipe?.buts_marques || 0) - (equipe?.buts_encaisses || 0) > 0 ? '#00A651' : '#E74C3C',
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
