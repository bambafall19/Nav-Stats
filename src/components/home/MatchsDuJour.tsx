'use client'

import Link from 'next/link'
import type { Database } from '@/types/database.types'

type Match = Database['public']['Tables']['matchs']['Row'] & {
  equipe_a: Database['public']['Tables']['equipes']['Row']
  equipe_b: Database['public']['Tables']['equipes']['Row']
}

function TeamLogo({ equipe, size = 48 }: { equipe: Database['public']['Tables']['equipes']['Row']; size?: number }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: 'var(--radius-md)',
      background: `linear-gradient(135deg, ${equipe.couleur_principale}, ${equipe.couleur_secondaire})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.4,
      fontWeight: 800,
      color: 'white',
      fontFamily: 'var(--font-outfit)',
      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
      flexShrink: 0,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    }}>
      {equipe.sigle || equipe.nom.charAt(0)}
    </div>
  )
}

function MatchCard({ match }: { match: Match }) {
  const isLive = match.statut === 'en_cours'
  const isDone = match.statut === 'termine'
  const matchDate = new Date(`${match.date_match}T${match.heure_match}`)

  const formatDate = (d: Date) => d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })

  return (
    <Link href={`/matchs/${match.id}`} style={{ textDecoration: 'none' }}>
      <div className="match-card">
        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {isLive ? (
              <span className="status-live">LIVE</span>
            ) : isDone ? (
              <span className="badge badge-gray">Terminé</span>
            ) : (
              <span className="badge badge-green">⏰ {match.heure_match?.slice(0,5)}</span>
            )}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            {formatDate(matchDate)} · J{match.journee || '?'}
          </div>
        </div>

        {/* Teams vs Score */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center' }}>
          {/* Équipe A */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <TeamLogo equipe={match.equipe_a} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textAlign: 'center', color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
              {match.equipe_a.nom}
            </span>
          </div>

          {/* Score / VS */}
          <div style={{ textAlign: 'center', minWidth: 80 }}>
            {isDone || isLive ? (
              <div style={{
                fontSize: '1.8rem',
                fontWeight: 900,
                fontFamily: 'var(--font-outfit)',
                letterSpacing: '-0.03em',
                color: 'var(--color-text-primary)',
              }}>
                {match.score_a ?? 0} — {match.score_b ?? 0}
              </div>
            ) : (
              <>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text-muted)', fontFamily: 'var(--font-outfit)' }}>VS</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: 4, fontWeight: 500 }}>
                  📍 {match.stade?.split(' ')[0]}
                </div>
              </>
            )}
          </div>

          {/* Équipe B */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <TeamLogo equipe={match.equipe_b} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textAlign: 'center', color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
              {match.equipe_b.nom}
            </span>
          </div>
        </div>

        {/* Footer */}
        {match.statut === 'a_venir' && (
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'center' }}>
            <span className="btn btn-primary btn-sm" style={{ pointerEvents: 'none' }}>
              🎯 Pronostiquer
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}

export default function MatchsDuJour({ matchs, isToday }: { matchs: Match[]; isToday: boolean }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
        <div>
          <h2 className="section-title">
            {isToday ? '⚽ Matchs du Jour' : '📅 Prochains Matchs'}
          </h2>
          <p className="section-subtitle">
            {matchs.length === 0
              ? 'Aucun match prévu'
              : `${matchs.length} rencontre${matchs.length > 1 ? 's' : ''}`
            }
          </p>
        </div>
        <Link href="/matchs" className="btn btn-outline btn-sm" style={{ textDecoration: 'none' }}>
          Tous les matchs →
        </Link>
      </div>

      {matchs.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>⚽</div>
          <p style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Aucun match prévu pour le moment</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {matchs.map(match => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  )
}
