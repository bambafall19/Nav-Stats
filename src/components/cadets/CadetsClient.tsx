'use client'

import { useState, useEffect, useRef } from 'react'
import { CalendarDays, Filter, MapPin, Trophy, Layers } from 'lucide-react'
import type { CadetEquipe, CadetMatch } from '@/lib/cadets'

interface CadetsClientProps {
  cadetMatches: CadetMatch[]
  equipesList: CadetEquipe[]
  journees: number[]
}

const formatDate = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })

function getOrdinalSuffix(n: number): string {
  if (n === 1) return 're'
  if (n === 2) return 'nd'
  if (n === 3) return 'e'
  return 'e'
}

function TeamLogo({ name, align, logo }: { name: string; align: 'left' | 'right'; logo?: CadetEquipe | null }) {
  const fallback = logo?.sigle || name.replace(/^ASC\s+/i, '').slice(0, 3)

  if (logo?.logo_url) {
    return (
      <img
        src={logo.logo_url}
        alt={name}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 'var(--radius-md)',
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />
    )
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      borderRadius: 'var(--radius-md)',
      background: `linear-gradient(135deg, ${logo?.couleur_principale || '#0dca6b'}, ${logo?.couleur_secondaire || 'var(--color-accent)'})`,
      color: 'white',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.72rem',
      fontWeight: 900,
      flexShrink: 0,
    }}>
      {fallback}
    </div>
  )
}

export default function CadetsClient({ cadetMatches, equipesList, journees }: CadetsClientProps) {
  const [selectedPoule, setSelectedPoule] = useState<string | null>(null)
  const [selectedJournee, setSelectedJournee] = useState<number | null>(null)
  const journeeRefs = useRef<Record<number, HTMLElement | null>>({})

  const today = new Date().toISOString().split('T')[0]
  const matchToday = cadetMatches.find(m => m.date_match === today)
  const todayJournee = matchToday ? matchToday.journee : null

  // Scroll to today's journee on first load
  useEffect(() => {
    if (todayJournee && journeeRefs.current[todayJournee]) {
      setTimeout(() => {
        journeeRefs.current[todayJournee]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 500)
    }
  }, [todayJournee])

  const poules = [...new Set(cadetMatches.map(m => m.poule).filter(Boolean))] as string[]

  const filteredMatches = cadetMatches.filter(match => {
    if (selectedPoule && match.poule !== selectedPoule) return false
    if (selectedJournee && match.journee !== selectedJournee) return false
    return true
  })

  const filteredJournees = [...new Set(filteredMatches.map(m => m.journee))].sort((a, b) => a - b)

  const logoMap = new Map<string, CadetEquipe>()
  equipesList.forEach(equipe => {
    logoMap.set(equipe.id, equipe)
    if (equipe.sigle) logoMap.set(equipe.sigle, equipe)
  })

  return (
    <div>
      {/* Filters - Sticky */}
      <div style={{
        position: 'sticky',
        top: 56,
        zIndex: 50,
        background: 'var(--color-bg-primary)',
        padding: '8px 0',
        marginBottom: 12,
        borderBottom: '1px solid var(--color-border)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}>
        {/* Poule filters */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          flexWrap: 'wrap',
          paddingBottom: 4,
        }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            flexShrink: 0,
            color: 'var(--color-text-muted)',
            fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontFamily: 'var(--font-plus-jakarta)',
          }}>
            <Filter size={12} /> Poules
          </span>
          <button
            onClick={() => setSelectedPoule(null)}
            style={{
              flexShrink: 0,
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              border: selectedPoule === null ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-border)',
              background: selectedPoule === null ? 'var(--color-primary-50)' : 'var(--color-surface-card)',
              color: selectedPoule === null ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontWeight: 700,
              fontSize: '0.78rem',
              cursor: 'pointer',
              fontFamily: 'var(--font-plus-jakarta)',
              transition: 'all 0.2s ease',
              minHeight: 36,
              boxShadow: selectedPoule === null ? '0 0 16px rgba(42,255,160,0.12)' : 'var(--shadow-xs)',
            }}
          >
            Toutes
          </button>
          {poules.map(poule => (
            <button
              key={poule}
              onClick={() => setSelectedPoule(selectedPoule === poule ? null : poule)}
              style={{
                flexShrink: 0,
                padding: '6px 16px',
                borderRadius: 'var(--radius-full)',
                border: selectedPoule === poule ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                background: selectedPoule === poule ? 'var(--color-primary-50)' : 'var(--color-surface-card)',
                color: selectedPoule === poule ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-plus-jakarta)',
                transition: 'all 0.2s ease',
                minHeight: 36,
                boxShadow: selectedPoule === poule ? '0 0 16px rgba(42,255,160,0.12)' : 'var(--shadow-xs)',
              }}
            >
              Poule {poule}
            </button>
          ))}
        </div>

        {/* Journee filters */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          flexWrap: 'wrap',
          paddingTop: 8,
        }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            flexShrink: 0,
            color: 'var(--color-text-muted)',
            fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontFamily: 'var(--font-plus-jakarta)',
          }}>
            <CalendarDays size={12} /> Journées
          </span>
          <button
            onClick={() => setSelectedJournee(null)}
            style={{
              flexShrink: 0,
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              border: selectedJournee === null ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
              background: selectedJournee === null ? 'var(--color-primary-50)' : 'transparent',
              color: selectedJournee === null ? 'var(--color-primary)' : 'var(--color-text-muted)',
              fontWeight: 600,
              fontSize: '0.7rem',
              cursor: 'pointer',
              fontFamily: 'var(--font-plus-jakarta)',
              minHeight: 32,
            }}
          >
            Toutes
          </button>
          {journees.map(j => (
            <button
              key={j}
              onClick={() => setSelectedJournee(selectedJournee === j ? null : j)}
              style={{
                flexShrink: 0,
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                border: selectedJournee === j ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                background: selectedJournee === j ? 'var(--color-primary-50)' : 'transparent',
                color: selectedJournee === j ? 'var(--color-primary)' : 'var(--color-text-muted)',
                fontWeight: 600,
                fontSize: '0.7rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-plus-jakarta)',
                minHeight: 32,
                position: 'relative',
                transition: 'all 0.2s ease',
              }}
            >
              J{j}
              {todayJournee === j && (
                <span style={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'var(--color-accent)',
                  border: '2px solid var(--color-bg-primary)',
                  boxShadow: '0 0 8px rgba(255,201,77,0.8)',
                }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Matchs par journée */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredJournees.map(journee => {
          const matches = filteredMatches.filter(match => match.journee === journee)
          const matchesByDate = matches.reduce<Record<string, CadetMatch[]>>((acc, match) => {
            acc[match.date_match] = [...(acc[match.date_match] || []), match]
            return acc
          }, {})

          const isToday = todayJournee === journee

          return (
            <section
              key={journee}
              ref={el => { journeeRefs.current[journee] = el }}
              className="journee-section"
              style={{
                background: 'var(--color-surface-card)',
                borderRadius: 'var(--radius-lg)',
                border: isToday ? '1.5px solid rgba(255,201,77,0.45)' : '1px solid var(--color-border-subtle)',
                boxShadow: isToday ? '0 8px 32px rgba(255,201,77,0.12)' : 'var(--shadow-card)',
                overflow: 'hidden',
                scrollMarginTop: 120,
              }}
            >
              {/* Accent line */}
              <div style={{
                height: 3,
                background: isToday
                  ? 'linear-gradient(90deg, var(--color-accent), var(--color-primary), transparent)'
                  : 'linear-gradient(90deg, var(--color-primary), rgba(42,255,160,0.15), transparent)',
              }} />

              {/* Journée Header */}
              <div className="journee-header" style={{
                padding: 'clamp(12px, 3vw, 16px) clamp(12px, 3vw, 18px)',
                position: 'relative',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 'var(--radius-md)',
                      background: isToday ? 'var(--gradient-gold)' : 'var(--gradient-green)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.95rem',
                      fontWeight: 900,
                      color: isToday ? '#2b1b00' : 'var(--color-text-on-primary)',
                      fontFamily: 'var(--font-plus-jakarta)',
                      boxShadow: isToday ? 'var(--shadow-gold)' : 'var(--shadow-green)',
                      flexShrink: 0,
                    }}>
                      {journee}
                    </div>
                    <div>
                      <h2 style={{
                        color: 'var(--color-text-primary)',
                        fontFamily: 'var(--font-plus-jakarta)',
                        fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
                        fontWeight: 800,
                        margin: 0,
                        letterSpacing: '-0.01em',
                        display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
                      }}>
                        {journee}{getOrdinalSuffix(journee)} Journée
                        {isToday && (
                          <span style={{
                            fontSize: '0.58rem',
                            fontWeight: 800,
                            background: 'var(--gradient-gold)',
                            color: '#2b1b00',
                            padding: '3px 9px',
                            borderRadius: 'var(--radius-full)',
                            letterSpacing: '0.04em',
                            boxShadow: 'var(--shadow-gold)',
                          }}>
                            AUJOURD&apos;HUI
                          </span>
                        )}
                      </h2>
                      <p style={{
                        color: 'var(--color-text-secondary)',
                        fontSize: '0.65rem',
                        margin: '2px 0 0',
                        fontWeight: 500,
                      }}>
                        {matches.length} rencontre{matches.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div style={{
                    background: 'var(--color-accent-50)',
                    color: 'var(--color-accent)',
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-plus-jakarta)',
                    border: '1px solid rgba(255,201,77,0.25)',
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                  }}>
                    <Trophy size={11} /> CNP 2026
                  </div>
                </div>
              </div>

              {/* Matchs par date */}
              <div style={{ padding: 'clamp(8px, 2vw, 14px)', paddingTop: 0 }}>
                {Object.entries(matchesByDate).map(([date, dateMatches], dateIndex) => (
                  <div key={date} style={{
                    marginBottom: dateIndex < Object.keys(matchesByDate).length - 1 ? 14 : 0,
                  }}>
                    {/* Date Header */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 6,
                      padding: '10px 2px 6px',
                      marginTop: dateIndex === 0 ? 2 : 4,
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 7,
                        color: 'var(--color-text-primary)',
                        fontWeight: 700,
                        fontSize: 'clamp(0.7rem, 2vw, 0.8rem)',
                      }}>
                        <span style={{
                          width: 24, height: 24, borderRadius: 'var(--radius-sm)',
                          background: 'var(--color-primary-50)',
                          border: '1px solid rgba(42,255,160,0.18)',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          color: 'var(--color-primary)',
                        }}>
                          <CalendarDays size={13} />
                        </span>
                        <span style={{ textTransform: 'capitalize' }}>{formatDate(date)}</span>
                      </div>
                      <span className="badge badge-green" style={{ fontSize: '0.58rem', padding: '3px 10px', fontFamily: 'var(--font-plus-jakarta)' }}>
                        {dateMatches.length} match{dateMatches.length > 1 ? 'es' : ''}
                      </span>
                    </div>

                    {/* Match Cards */}
                    <div className="match-cards-list" style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}>
                      {dateMatches.map(match => {
                        const equipeA = match.equipe_a_info || (match.equipe_a_id ? logoMap.get(match.equipe_a_id) : undefined) || logoMap.get(match.equipe_a)
                        const equipeB = match.equipe_b_info || (match.equipe_b_id ? logoMap.get(match.equipe_b_id) : undefined) || logoMap.get(match.equipe_b)
                        const equipeAName = equipeA?.nom || match.equipe_a
                        const equipeBName = equipeB?.nom || match.equipe_b
                        const colorA = equipeA?.couleur_principale || '#0dca6b'
                        const colorB = equipeB?.couleur_principale || '#0dca6b'

                        return (
                          <div key={`${match.date_match}-${match.equipe_a}-${match.equipe_b}`} className="match-row" style={{
                            background: 'linear-gradient(180deg, var(--color-surface-elevated) 0%, var(--color-surface-card) 100%)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-border-subtle)',
                            overflow: 'hidden',
                            boxShadow: 'var(--shadow-xs)',
                            transition: 'all 0.25s ease',
                          }}>
                            {/* Main content */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              padding: '12px 14px',
                            }}>
                              {/* Équipe A */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                                <div className="team-badge" style={{
                                  width: 34,
                                  height: 34,
                                  borderRadius: 'var(--radius-md)',
                                  overflow: 'hidden',
                                  flexShrink: 0,
                                  border: `1.5px solid ${colorA}40`,
                                  boxShadow: `0 2px 8px ${colorA}20`,
                                }}>
                                  <TeamLogo name={equipeAName} align="right" logo={equipeA} />
                                </div>
                                <span className="team-name" style={{
                                  fontSize: 'clamp(0.72rem, 2vw, 0.85rem)',
                                  fontWeight: 700,
                                  color: 'var(--color-text-primary)',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}>
                                  {equipeAName}
                                </span>
                              </div>

                              {/* VS / Score / Forfait */}
                              {match.statut === 'termine' && match.forfait ? (
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 4,
                                  padding: '6px 10px', borderRadius: 'var(--radius-md)',
                                  background: 'rgba(255,201,77,0.12)', border: '1px solid rgba(255,201,77,0.35)',
                                  color: 'var(--color-accent)', fontSize: '0.6rem', fontWeight: 900,
                                  fontFamily: 'var(--font-plus-jakarta)', letterSpacing: '0.02em',
                                  flexShrink: 0, textAlign: 'center', lineHeight: 1.2,
                                }}>
                                  FORFAIT
                                </span>
                              ) : match.statut === 'termine' && match.score_a != null ? (
                                <div style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 6,
                                  padding: '6px 12px', borderRadius: 'var(--radius-md)',
                                  background: 'rgba(42,255,160,0.08)', border: '1px solid rgba(42,255,160,0.2)',
                                  fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '0.85rem',
                                  color: 'var(--color-text-primary)', flexShrink: 0,
                                }}>
                                  <span style={{ color: (match.score_a ?? 0) > (match.score_b ?? 0) ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>{match.score_a}</span>
                                  <span style={{ fontSize: '0.55rem', color: 'var(--color-text-muted)' }}>–</span>
                                  <span style={{ color: (match.score_b ?? 0) > (match.score_a ?? 0) ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>{match.score_b}</span>
                                </div>
                              ) : match.statut === 'en_cours' ? (
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 4,
                                  padding: '5px 10px', borderRadius: 'var(--radius-full)',
                                  background: 'rgba(232,0,45,0.1)', border: '1px solid rgba(232,0,45,0.3)',
                                  color: 'var(--color-red)', fontSize: '0.55rem', fontWeight: 800,
                                  fontFamily: 'var(--font-plus-jakarta)', letterSpacing: '0.04em',
                                  flexShrink: 0, whiteSpace: 'nowrap',
                                }}>
                                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-red)', animation: 'cadetLivePulse 1.4s infinite' }} />
                                  DIRECT
                                </span>
                              ) : (
                                <div style={{
                                  width: 30,
                                  height: 30,
                                  borderRadius: '50%',
                                  background: 'linear-gradient(135deg, #E8002D, #ff6b6b)',
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.6rem',
                                  fontWeight: 900,
                                  fontFamily: 'var(--font-plus-jakarta)',
                                  boxShadow: '0 2px 10px rgba(232,0,45,0.3)',
                                  flexShrink: 0,
                                  letterSpacing: '0.02em',
                                }}>
                                  VS
                                </div>
                              )}

                              {/* Équipe B */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0, justifyContent: 'flex-end' }}>
                                <span className="team-name" style={{
                                  fontSize: 'clamp(0.72rem, 2vw, 0.85rem)',
                                  fontWeight: 700,
                                  color: 'var(--color-text-primary)',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}>
                                  {equipeBName}
                                </span>
                                <div className="team-badge" style={{
                                  width: 34,
                                  height: 34,
                                  borderRadius: 'var(--radius-md)',
                                  overflow: 'hidden',
                                  flexShrink: 0,
                                  border: `1.5px solid ${colorB}40`,
                                  boxShadow: `0 2px 8px ${colorB}20`,
                                }}>
                                  <TeamLogo name={equipeBName} align="left" logo={equipeB} />
                                </div>
                              </div>
                            </div>

                            {/* Meta Row */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 8,
                              padding: '7px 14px',
                              background: 'rgba(0,0,0,0.15)',
                              borderTop: '1px solid var(--color-border-subtle)',
                            }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                fontSize: '0.68rem',
                                color: 'var(--color-text-secondary)',
                                fontWeight: 600,
                                fontFamily: 'var(--font-plus-jakarta)',
                              }}>
                                <MapPin size={11} color="var(--color-text-muted)" />
                                {match.terrain}
                              </div>
                              {match.ordre && (
                                <span style={{
                                  fontSize: '0.62rem',
                                  color: 'var(--color-accent)',
                                  fontWeight: 800,
                                  background: 'var(--color-accent-50)',
                                  padding: '2px 9px',
                                  borderRadius: 'var(--radius-full)',
                                  border: '1px solid rgba(255,201,77,0.22)',
                                  fontFamily: 'var(--font-plus-jakarta)',
                                  display: 'inline-flex', alignItems: 'center', gap: 4,
                                }}>
                                  <Layers size={10} /> #{match.ordre}
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )
        })}
      </div>

      <style>{`
        @keyframes cadetLivePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .journee-section {
          scroll-margin-top: 140px;
        }
        .match-row:hover {
          border-color: rgba(42,255,160,0.3) !important;
          box-shadow: var(--shadow-card-hover) !important;
          transform: translateY(-1px);
        }
        @media (max-width: 640px) {
          .journee-section {
            margin-bottom: 10px !important;
          }
          .journee-header {
            padding: 12px 14px !important;
          }
          .journee-header h2 {
            font-size: 0.9rem !important;
          }
          .match-cards-list {
            gap: 6px !important;
          }
          .match-row .team-badge,
          .match-row .team-badge img,
          .match-row .team-badge > div {
            width: 28px !important;
            height: 28px !important;
          }
          .match-row .team-name {
            font-size: clamp(0.72rem, 2vw, 0.82rem) !important;
          }
        }
      `}</style>
    </div>
  )
}