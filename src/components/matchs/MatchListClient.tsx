'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Team {
  id: string
  nom: string
  sigle: string | null
  poule: 'A' | 'B' | 'C' | null
  couleur_principale: string
  couleur_secondaire: string
  logo_url: string | null
  quartier: string | null
  asc_nom: string | null
}

interface Match {
  id: string
  equipe_a_id: string
  equipe_b_id: string
  date_match: string
  heure_match: string
  stade: string
  arbitre: string | null
  journee: number | null
  phase: 'phase_groupe' | 'quart_finale' | 'demi_finale' | 'finale'
  statut: 'a_venir' | 'en_cours' | 'termine' | 'reporte'
  score_a: number | null
  score_b: number | null
  equipe_a: Team
  equipe_b: Team
}

interface Props {
  initialMatchs: Match[]
}

const EXEMPTE_MAP: Record<number, { nom: string; sigle: string }> = {
  1: { nom: 'Kocc', sigle: 'KOC' },
  2: { nom: 'Entente C.S', sigle: 'ECS' },
  3: { nom: 'Manko', sigle: 'MAN' },
  4: { nom: 'Book Joom', sigle: 'BJ' },
  5: { nom: 'Maag Daan', sigle: 'MD' },
}

export default function MatchListClient({ initialMatchs }: Props) {
  const [selectedJournee, setSelectedJournee] = useState<number>(1)

  const matchesByJournee = initialMatchs.filter(m => m.journee === selectedJournee)

  // Group matches by date inside the selected journée
  const matchesByDate: Record<string, Match[]> = {}
  matchesByJournee.forEach(m => {
    if (!matchesByDate[m.date_match]) {
      matchesByDate[m.date_match] = []
    }
    matchesByDate[m.date_match].push(m)
  })

  // Sort dates
  const sortedDates = Object.keys(matchesByDate).sort()

  const journees = [1, 2, 3, 4, 5]

  function TeamBadge({ equipe, size = 42 }: { equipe: Team; size?: number }) {
    if (equipe.logo_url) {
      return (
        <img
          src={equipe.logo_url}
          alt={equipe.nom}
          style={{
            width: size,
            height: size,
            borderRadius: 10,
            objectFit: 'cover',
            flexShrink: 0,
            boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
          }}
        />
      )
    }
    return (
      <div style={{
        width: size, height: size,
        borderRadius: 10,
        background: `linear-gradient(135deg, ${equipe.couleur_principale}, ${equipe.couleur_secondaire})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.42,
        fontWeight: 800,
        color: 'white',
        flexShrink: 0,
        boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
        fontFamily: 'var(--font-outfit)',
      }}>
        {equipe.sigle}
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Tab Selector */}
      <div style={{
        display: 'flex',
        gap: 6,
        padding: 6,
        background: 'rgba(0,0,0,0.03)',
        borderRadius: 18,
        marginBottom: 24,
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}>
        {journees.map(j => (
          <button
            key={j}
            onClick={() => setSelectedJournee(j)}
            style={{
              flex: 1,
              padding: '12px 20px',
              border: 'none',
              background: selectedJournee === j ? 'var(--gradient-green)' : 'transparent',
              color: selectedJournee === j ? 'white' : 'var(--color-text-secondary)',
              borderRadius: 14,
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: selectedJournee === j ? 'var(--shadow-green)' : 'none',
              transition: 'all 0.25s ease',
              whiteSpace: 'nowrap',
              minWidth: 110,
              fontFamily: 'var(--font-outfit)',
            }}
          >
            🗓️ Journée {j}
          </button>
        ))}
      </div>

      {/* Exemption Banner */}
      {EXEMPTE_MAP[selectedJournee] && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 20px',
          background: 'rgba(251,191,0,0.08)',
          border: '1px dashed rgba(251,191,0,0.4)',
          borderRadius: 16,
          marginBottom: 28,
          fontSize: '0.85rem',
          color: '#826000',
          fontWeight: 600,
          boxShadow: '0 2px 8px rgba(251,191,0,0.02)',
        }}>
          <span style={{ fontSize: '1.2rem' }}>📢</span>
          <span>
            Exempté de match ce tour-ci (Poule A) : <strong style={{ color: 'var(--color-primary)' }}>ASC {EXEMPTE_MAP[selectedJournee].nom}</strong>
          </span>
        </div>
      )}

      {/* Calendar Header or Magal pause indicator */}
      {selectedJournee === 4 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          padding: '20px',
          background: 'rgba(0,98,51,0.05)',
          border: '1px solid rgba(0,98,51,0.15)',
          borderRadius: 16,
          marginBottom: 28,
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,98,51,0.02)',
        }}>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)', fontFamily: 'var(--font-outfit)' }}>🕌 Pause Magal</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', maxWidth: 440, lineHeight: 1.4 }}>
            Le calendrier observe une pause officielle pour le Grand Magal de Touba. Les matchs reprennent le 03/08/2026.
          </span>
        </div>
      )}

      {/* Matches Grid */}
      {sortedDates.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center', borderRadius: 20 }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>⚽</div>
          <h3 style={{ fontFamily: 'var(--font-outfit)', marginBottom: 8 }}>Aucun match programmé</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Revenez bientôt pour la mise à jour officielle !</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {sortedDates.map(date => {
            const matches = matchesByDate[date]
            const formattedDate = new Date(date).toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })

            return (
              <div key={date}>
                {/* Clean Date Header Chip */}
                <div style={{ marginBottom: 16 }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: 'var(--color-primary)',
                    background: 'rgba(0,98,51,0.06)',
                    padding: '6px 16px',
                    borderRadius: 30,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontFamily: 'var(--font-outfit)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}>
                    <span>📅</span> {formattedDate}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {matches.map(m => {
                    const isDone = m.statut === 'termine'
                    const isLive = m.statut === 'en_cours'
                    const isWinA = isDone && (m.score_a ?? 0) > (m.score_b ?? 0)
                    const isWinB = isDone && (m.score_b ?? 0) > (m.score_a ?? 0)

                    // Color code strip for the Poule
                    const pouleColor = m.equipe_a.poule === 'A' ? '#006233' : m.equipe_a.poule === 'B' ? '#1E40AF' : '#B91C1C'

                    return (
                      <Link key={m.id} href={`/matchs/${m.id}`} style={{ textDecoration: 'none' }}>
                        <div className="match-card" style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr auto 1fr',
                          gap: 16,
                          alignItems: 'center',
                          padding: '20px 24px',
                          borderRadius: 20,
                          position: 'relative',
                          overflow: 'hidden',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
                          border: '1px solid rgba(0,0,0,0.04)',
                          background: 'white',
                          transition: 'all 0.25s ease',
                        }}>
                          {/* Side Group Color Strip */}
                          <div style={{
                            position: 'absolute',
                            left: 0, top: 0, bottom: 0,
                            width: 6,
                            background: pouleColor,
                          }} />

                          {/* Equipe A */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 14, justifyContent: 'flex-end', minWidth: 0 }}>
                            <span style={{
                              fontWeight: isWinA ? 800 : 600,
                              fontSize: '0.95rem',
                              color: isWinA ? 'var(--color-primary)' : 'var(--color-text-primary)',
                              textAlign: 'right',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              fontFamily: 'var(--font-outfit)',
                            }}>
                              {m.equipe_a.nom}
                            </span>
                            <TeamBadge equipe={m.equipe_a} />
                          </div>

                          {/* Center Scoreboard Score / Time Box */}
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: 100,
                          }}>
                            {/* Group Tag */}
                            <span style={{
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              color: pouleColor,
                              textTransform: 'uppercase',
                              letterSpacing: '0.02em',
                              marginBottom: 6,
                            }}>
                              Poule {m.equipe_a.poule}
                            </span>

                            {/* Stadium scoreboard styling */}
                            <div style={{
                              background: isLive ? 'rgba(239,68,68,0.08)' : 'rgba(0,0,0,0.03)',
                              border: isLive ? '1.5px solid rgba(239,68,68,0.3)' : '1px solid rgba(0,0,0,0.05)',
                              borderRadius: 12,
                              padding: '8px 16px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minWidth: 84,
                              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)',
                            }}>
                              {isDone || isLive ? (
                                <>
                                  {isLive && (
                                    <span style={{
                                      fontSize: '0.6rem',
                                      fontWeight: 800,
                                      color: '#EF4444',
                                      animation: 'pulse 1.5s infinite',
                                      letterSpacing: '0.05em',
                                      marginBottom: 2,
                                    }}>LIVE</span>
                                  )}
                                  <span style={{
                                    fontFamily: 'var(--font-outfit)',
                                    fontWeight: 900,
                                    fontSize: '1.25rem',
                                    color: isLive ? '#EF4444' : 'var(--color-text-primary)',
                                    letterSpacing: '-0.02em',
                                    lineHeight: 1.1,
                                  }}>
                                    {m.score_a} — {m.score_b}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span style={{
                                    fontFamily: 'var(--font-outfit)',
                                    fontWeight: 800,
                                    fontSize: '1.1rem',
                                    color: 'var(--color-primary)',
                                    lineHeight: 1.1,
                                  }}>
                                    {m.heure_match?.slice(0,5)}
                                  </span>
                                  <span style={{
                                    fontSize: '0.6rem',
                                    color: 'var(--color-text-muted)',
                                    fontWeight: 600,
                                    marginTop: 2,
                                  }}>
                                    {m.heure_match === '16:00' ? '1ère heure' : '2ème heure'}
                                  </span>
                                </>
                              )}
                            </div>
                            
                            {isDone && (
                              <span style={{
                                fontSize: '0.6rem',
                                color: 'var(--color-text-muted)',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                marginTop: 6,
                                letterSpacing: '0.02em',
                              }}>
                                Terminé
                              </span>
                            )}
                          </div>

                          {/* Equipe B */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                            <TeamBadge equipe={m.equipe_b} />
                            <span style={{
                              fontWeight: isWinB ? 800 : 600,
                              fontSize: '0.95rem',
                              color: isWinB ? 'var(--color-primary)' : 'var(--color-text-primary)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              fontFamily: 'var(--font-outfit)',
                            }}>
                              {m.equipe_b.nom}
                            </span>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
