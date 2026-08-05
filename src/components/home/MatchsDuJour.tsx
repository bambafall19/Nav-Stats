'use client'

import Link from 'next/link'
import { Share2, Clock, CheckCircle2, Zap, MapPin, ChevronRight, Radio } from 'lucide-react'
import CountdownTimer from '@/components/shared/CountdownTimer'
import type { Database } from '@/types/database.types'

type Match = Database['public']['Tables']['matchs']['Row'] & {
  equipe_a: Database['public']['Tables']['equipes']['Row']
  equipe_b: Database['public']['Tables']['equipes']['Row']
}

function TeamLogo({ equipe, size = 36 }: { equipe: Database['public']['Tables']['equipes']['Row']; size?: number }) {
  if (equipe.logo_url) {
    return (
      <img src={equipe.logo_url} alt={equipe.nom}
        style={{ width: size, height: size, borderRadius: 12, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--color-border-subtle)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
      />
    )
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: 12,
      background: `linear-gradient(135deg, ${equipe.couleur_principale || '#0dca6b'}, ${equipe.couleur_secondaire || '#ffc94d'})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.33, fontWeight: 800, color: 'white',
      fontFamily: 'var(--font-plus-jakarta)', flexShrink: 0,
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
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
  const shareText = `${match.equipe_a.nom} vs ${match.equipe_b.nom} sur NavéStats\n${formatDate(matchDate)} à ${match.heure_match?.slice(0, 5)}\nhttps://navestats.site/matchs/${match.id}`
  const shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`

  const winA = isDone && (match.score_a ?? 0) > (match.score_b ?? 0)
  const winB = isDone && (match.score_b ?? 0) > (match.score_a ?? 0)

  return (
    <Link href={`/matchs/${match.id}`} style={{ textDecoration: 'none' }}>
      <div className="match-card" style={{
        background: 'var(--color-surface-card)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        position: 'relative',
        transition: 'all var(--transition-base) var(--ease-out)',
        boxShadow: 'var(--shadow-card)',
      }}>
        {/* Top accent */}
        <div style={{
          height: 3,
          background: isLive
            ? 'linear-gradient(90deg, #ff3b3b, #ff6b6b)'
            : 'linear-gradient(90deg, transparent, var(--color-primary-100), transparent)',
        }} />

        {/* Status bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '8px 14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
            {isLive ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 999, background: 'rgba(255,59,59,0.12)', color: '#ff5a5a', fontSize: '0.58rem', fontWeight: 800, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff3b3b', animation: 'pulse-dot 1.2s infinite' }} /> LIVE
              </span>
            ) : isDone ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 999, background: 'var(--color-bg-secondary)', color: 'var(--color-text-muted)', fontSize: '0.58rem', fontWeight: 700 }}>
                <CheckCircle2 size={10} /> Terminé
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 999, background: 'rgba(42,255,160,0.08)', color: 'var(--color-primary)', fontSize: '0.58rem', fontWeight: 700 }}>
                <Clock size={10} /> {match.heure_match?.slice(0, 5)}
              </span>
            )}
            <span style={{ fontSize: '0.56rem', color: 'var(--color-text-muted)', fontWeight: 600, fontFamily: 'var(--font-plus-jakarta)' }}>
              {formatDate(matchDate)} · J{match.journee || '?'}
            </span>
          </div>
          <button
            type="button"
            onClick={event => { event.preventDefault(); event.stopPropagation(); window.open(shareUrl, '_blank', 'noopener,noreferrer') }}
            aria-label="Partager"
            style={{ width: 26, height: 26, borderRadius: 8, background: 'var(--color-bg-secondary)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', flexShrink: 0 }}
          >
            <Share2 size={12} />
          </button>
        </div>

        {/* Teams + Score */}
        <div style={{ padding: '6px 14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                <TeamLogo equipe={match.equipe_a} size={40} />
              </div>
              <div style={{
                fontSize: '0.62rem', fontWeight: 700,
                color: winA ? 'var(--color-primary)' : 'var(--color-text-primary)',
                lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {match.equipe_a.nom}
              </div>
            </div>

            <div style={{ flexShrink: 0, textAlign: 'center' }}>
              {isDone || isLive ? (
                <div style={{
                  padding: '8px 14px', borderRadius: 14,
                  background: isLive ? 'rgba(255,59,59,0.08)' : 'rgba(42,255,160,0.08)',
                  border: `1px solid ${isLive ? 'rgba(255,59,59,0.2)' : 'rgba(42,255,160,0.15)'}`,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.1rem', color: winA ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>{match.score_a ?? 0}</span>
                  <span style={{ color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.55rem' }}>–</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.1rem', color: winB ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>{match.score_b ?? 0}</span>
                </div>
              ) : (
                <div style={{
                  width: 40, height: 40, borderRadius: 14,
                  background: 'var(--gradient-hero)',
                  border: '1px solid var(--color-border-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '0.62rem', color: 'var(--color-primary)', letterSpacing: '0.04em' }}>VS</span>
                </div>
              )}
            </div>

            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                <TeamLogo equipe={match.equipe_b} size={40} />
              </div>
              <div style={{
                fontSize: '0.62rem', fontWeight: 700,
                color: winB ? 'var(--color-primary)' : 'var(--color-text-primary)',
                lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {match.equipe_b.nom}
              </div>
            </div>
          </div>

          {match.stade && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 12, fontSize: '0.58rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
              <MapPin size={10} /> {match.stade}
            </div>
          )}
        </div>

        {/* Footer CTA */}
        {match.statut === 'a_venir' && (
          <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <CountdownTimer targetDate={match.date_match} targetTime={match.heure_match || '00:00:00'} />
            <div className="match-cta" style={{
              width: '100%', padding: '10px',
              background: 'var(--gradient-green)', color: '#0a0f0d',
              borderRadius: 12, fontSize: '0.66rem', fontWeight: 800, textAlign: 'center',
              fontFamily: 'var(--font-plus-jakarta)',
              letterSpacing: '0.04em', textTransform: 'uppercase',
              boxShadow: '0 6px 18px rgba(42,255,160,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <Radio size={12} /> Pronostiquer
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
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12, gap: 8 }}>
        <div>
          <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, fontSize: '1rem' }}>
            <Zap size={17} color="var(--color-primary)" />
            {isToday ? 'Matchs du Jour' : 'Prochains Matchs'}
          </h2>
          <p className="section-subtitle" style={{ fontSize: '0.7rem' }}>
            {matchs.length === 0 ? 'Aucun match prévu' : `${matchs.length} rencontre${matchs.length > 1 ? 's' : ''}`}
          </p>
        </div>
        {matchs.length > 0 && (
          <Link href="/matchs" style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.72rem', textDecoration: 'none', fontFamily: 'var(--font-plus-jakarta)', whiteSpace: 'nowrap' }}>
            Voir tout <ChevronRight size={13} />
          </Link>
        )}
      </div>

      {matchs.length === 0 ? (
        <div className="card" style={{ padding: 28, textAlign: 'center' }}>
          <div style={{ marginBottom: 8, color: 'var(--color-text-muted)' }}><Zap size={24} /></div>
          <p style={{ color: 'var(--color-text-secondary)', fontWeight: 500, fontSize: '0.8rem' }}>Aucun match prévu pour le moment</p>
        </div>
      ) : (
        <div className="matchs-grid h-scroll" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {matchs.map((match, i) => (
            <div key={match.id} style={{ animation: `fadeInUp 0.4s ${i * 0.06}s ease both` }}>
              <MatchCard match={match} />
            </div>
          ))}
        </div>
      )}
      <style>{`
        @media (max-width: 767px) {
          .matchs-grid.h-scroll > * { flex: 0 0 84% !important; }
        }
        @media (max-width: 640px) {
          .matchs-grid { grid-template-columns: 1fr !important; }
        }
        .match-card:hover { box-shadow: var(--shadow-card-hover) !important; transform: translateY(-3px) scale(1.01); }
        .match-card:hover .match-cta { filter: brightness(1.08); }
        @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </div>
  )
}
