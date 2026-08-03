'use client'

import Link from 'next/link'
import { Share2 } from 'lucide-react'
import CountdownTimer from '@/components/shared/CountdownTimer'
import type { Database } from '@/types/database.types'

type Match = Database['public']['Tables']['matchs']['Row'] & {
  equipe_a: Database['public']['Tables']['equipes']['Row']
  equipe_b: Database['public']['Tables']['equipes']['Row']
}

function TeamLogo({ equipe, size = 48, className }: { equipe: Database['public']['Tables']['equipes']['Row']; size?: number; className?: string }) {
  const hasMobileClass = className?.includes('match-team-logo') || className?.includes('mobile-team-logo')
  if (equipe.logo_url) {
    return (
      <img
        src={equipe.logo_url}
        alt={equipe.nom}
        className={className}
        style={{
          width: hasMobileClass ? undefined : size,
          height: hasMobileClass ? undefined : size,
          borderRadius: 'var(--radius-md)',
          objectFit: 'cover',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      />
    )
  }
  return (
    <div
      className={className}
      style={{
        width: hasMobileClass ? undefined : size,
        height: hasMobileClass ? undefined : size,
        borderRadius: 'var(--radius-md)',
        background: `linear-gradient(135deg, ${equipe.couleur_principale || '#006233'}, ${equipe.couleur_secondaire || '#FBBF00'})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: hasMobileClass ? undefined : size * 0.4,
        fontWeight: 800,
        color: 'white',
        fontFamily: 'var(--font-outfit)',
        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}
    >
      {equipe.sigle || equipe.nom.charAt(0)}
    </div>
  )
}

function MatchCard({ match }: { match: Match }) {
  const isLive = match.statut === 'en_cours'
  const isDone = match.statut === 'termine'
  const matchDate = new Date(`${match.date_match}T${match.heure_match}`)

  const formatDate = (d: Date) => d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
  const shareText = `⚽ ${match.equipe_a.nom} vs ${match.equipe_b.nom} sur NavéStats\n📅 ${formatDate(matchDate)} à ${match.heure_match?.slice(0, 5)}\n👉 https://navestats.site/matchs/${match.id}`
  const shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`

  return (
    <Link href={`/matchs/${match.id}`} style={{ textDecoration: 'none' }} className="match-card-link">
      <div className="match-card" style={{
        background: 'var(--color-surface-card)',
        borderRadius: 'var(--radius-lg)',
        padding: 12,
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all 0.25s ease',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Status badge and date */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {isLive ? (
              <span className="status-live" style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(232,0,45,0.12)',
                color: 'var(--color-red)',
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.02em',
              }}>
                🔴 LIVE
              </span>
            ) : isDone ? (
              <span style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(100,116,139,0.08)',
                color: 'var(--color-text-muted)',
                fontSize: '0.72rem',
                fontWeight: 700,
              }}>
                Terminé
              </span>
            ) : (
              <span style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(0,166,81,0.08)',
                color: '#00A651',
                fontSize: '0.72rem',
                fontWeight: 700,
              }}>
                ⏰ {match.heure_match?.slice(0,5)}
              </span>
            )}
            
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600, marginTop: 6 }}>
              {formatDate(matchDate)} · J{match.journee || '?'}
            </div>
          </div>

          {/* Share button - 44px touch target */}
          <button
            type="button"
            onClick={event => {
              event.preventDefault()
              event.stopPropagation()
              window.open(shareUrl, '_blank', 'noopener,noreferrer')
            }}
            aria-label="Partager ce match sur WhatsApp"
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'rgba(0,98,51,0.06)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(0,98,51,0.12)',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.2s',
            }}
          >
            <Share2 size={18} />
          </button>
        </div>

        {/* Teams VS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: 8,
          alignItems: 'center',
          marginBottom: 12,
        }}>
          {/* Équipe A */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div className="team-badge" style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '2px solid var(--color-border)',
            }}>
              <TeamLogo equipe={match.equipe_a} size={36} />
            </div>
            <span className="team-name" style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              textAlign: 'center',
              color: 'var(--color-text-primary)',
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
            }}>
              {match.equipe_a.nom}
            </span>
          </div>

          {/* VS / Score */}
          <div className="vs-badge" style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: isLive
              ? 'linear-gradient(135deg, rgba(232,0,45,0.15), rgba(232,0,45,0.08))'
              : isDone
              ? 'linear-gradient(135deg, rgba(0,98,51,0.12), rgba(0,166,81,0.08))'
              : 'linear-gradient(135deg, rgba(0,98,51,0.1), rgba(0,166,81,0.06))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: '0.7rem',
            color: isLive ? 'var(--color-red)' : 'var(--color-primary)',
            border: `2px solid ${isLive ? 'rgba(232,0,45,0.25)' : 'rgba(0,98,51,0.2)'}`,
            fontFamily: 'var(--font-outfit)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}>
            {isDone || isLive ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: '0.7rem' }}>
                <span style={{ fontWeight: 900 }}>{match.score_a ?? 0}</span>
                <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>–</span>
                <span style={{ fontWeight: 900 }}>{match.score_b ?? 0}</span>
              </div>
            ) : (
              'VS'
            )}
          </div>

          {/* Équipe B */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div className="team-badge" style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '2px solid var(--color-border)',
            }}>
              <TeamLogo equipe={match.equipe_b} size={36} />
            </div>
            <span className="team-name" style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              textAlign: 'center',
              color: 'var(--color-text-primary)',
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
            }}>
              {match.equipe_b.nom}
            </span>
          </div>
        </div>

        {/* Countdown + Footer CTA */}
        {match.statut === 'a_venir' && (
          <div className="match-card-footer" style={{
            marginTop: 12,
            paddingTop: 10,
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <CountdownTimer targetDate={match.date_match} targetTime={match.heure_match || '00:00:00'} />
            </div>
            <div style={{
              width: '100%',
              padding: '8px',
              background: 'var(--gradient-green)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 700,
              textAlign: 'center',
              boxShadow: 'var(--shadow-green)',
              fontFamily: 'var(--font-outfit)',
            }}>
              🎯 Pronostiquer
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}

export default function MatchsDuJour({ matchs, isToday }: { matchs: Match[]; isToday: boolean }) {
  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <h2 className="section-title" style={{ marginBottom: 2 }}>
          {isToday ? '⚽ Matchs du Jour' : '📅 Prochains Matchs'}
          <span style={{
            marginLeft: 8,
            fontSize: '0.62rem',
            fontWeight: 800,
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
            padding: '3px 8px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(124,58,237,0.08)',
            color: '#7C3AED',
            border: '1px solid rgba(124,58,237,0.18)',
            verticalAlign: 'middle',
          }}>Cadets</span>
        </h2>
        <p className="section-subtitle">
          {matchs.length === 0
            ? 'Aucun match prévu'
            : `${matchs.length} rencontre${matchs.length > 1 ? 's' : ''}`
          }
        </p>
      </div>

      {matchs.length === 0 ? (
        <div className="card" style={{ padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: '2.2rem', marginBottom: 8 }}>⚽</div>
          <p style={{ color: 'var(--color-text-secondary)', fontWeight: 500, fontSize: '0.85rem' }}>Aucun match prévu pour le moment</p>
        </div>
      ) : (
        <div className="matchs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {matchs.map((match, i) => (
            <div key={match.id} style={{ animation: `fadeInUp 0.4s ${i * 0.06}s ease both` }}>
              <MatchCard match={match} />
            </div>
          ))}
        </div>
      )}
      <style>{`
        @media (max-width: 640px) {
          .matchs-grid {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }
          .match-card {
            padding: 10px !important;
          }
          .match-card .team-badge {
            width: 30px !important;
            height: 30px !important;
          }
          .match-card .team-badge img {
            width: 30px !important;
            height: 30px !important;
          }
          .match-card .vs-badge {
            width: 28px !important;
            height: 28px !important;
            font-size: 0.65rem !important;
          }
          .match-card .team-name {
            font-size: 0.68rem !important;
          }
          .match-card-footer {
            padding-top: 8px !important;
            margin-top: 8px !important;
          }
          .match-card-footer > div {
            padding: 7px !important;
            font-size: 0.72rem !important;
          }
        }
      `}</style>
    </div>
  )
}