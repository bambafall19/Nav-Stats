'use client'

import { useState, useEffect, useRef } from 'react'
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
      background: `linear-gradient(135deg, ${logo?.couleur_principale || '#006233'}, ${logo?.couleur_secondaire || '#FBBF00'})`,
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
  const [todayJournee, setTodayJournee] = useState<number | null>(null)
  const journeeRefs = useRef<Record<number, HTMLElement | null>>({})

  // Find today's journee
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    const matchToday = cadetMatches.find(m => m.date_match === today)
    if (matchToday) {
      setTodayJournee(matchToday.journee)
    }
  }, [cadetMatches])

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
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 4,
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
        }}>
          <button
            onClick={() => setSelectedPoule(null)}
            style={{
              flexShrink: 0,
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              border: selectedPoule === null ? '2px solid var(--color-primary)' : '1.5px solid var(--color-border)',
              background: selectedPoule === null ? 'rgba(0,98,51,0.08)' : 'var(--color-surface-card)',
              color: selectedPoule === null ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontWeight: 700,
              fontSize: '0.78rem',
              cursor: 'pointer',
              fontFamily: 'var(--font-outfit)',
              transition: 'all 0.2s ease',
              minHeight: 36,
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
                border: selectedPoule === poule ? '2px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                background: selectedPoule === poule ? 'rgba(0,98,51,0.08)' : 'var(--color-surface-card)',
                color: selectedPoule === poule ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-outfit)',
                transition: 'all 0.2s ease',
                minHeight: 36,
              }}
            >
              Poule {poule}
            </button>
          ))}
        </div>

        {/* Journee filters */}
        <div style={{
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          paddingTop: 6,
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
        }}>
          <button
            onClick={() => setSelectedJournee(null)}
            style={{
              flexShrink: 0,
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              border: selectedJournee === null ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
              background: selectedJournee === null ? 'rgba(0,98,51,0.08)' : 'transparent',
              color: selectedJournee === null ? 'var(--color-primary)' : 'var(--color-text-muted)',
              fontWeight: 600,
              fontSize: '0.7rem',
              cursor: 'pointer',
              fontFamily: 'var(--font-outfit)',
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
                border: selectedJournee === j ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                background: selectedJournee === j ? 'rgba(0,98,51,0.08)' : 'transparent',
                color: selectedJournee === j ? 'var(--color-primary)' : 'var(--color-text-muted)',
                fontWeight: 600,
                fontSize: '0.7rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-outfit)',
                minHeight: 32,
                position: 'relative',
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
                  background: '#FFD700',
                  border: '2px solid var(--color-bg-primary)',
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
                border: isToday ? '2px solid #FFD700' : '1px solid var(--color-border)',
                boxShadow: isToday ? '0 4px 20px rgba(255,215,0,0.15)' : 'var(--shadow-md)',
                overflow: 'hidden',
                scrollMarginTop: 120,
              }}
            >
              {/* Journée Header */}
              <div className="journee-header" style={{
                background: isToday
                  ? 'linear-gradient(135deg, #004d27 0%, #006233 50%, #D4A000 100%)'
                  : 'linear-gradient(135deg, #004d27 0%, #006233 100%)',
                padding: 'clamp(12px, 3vw, 18px) clamp(12px, 3vw, 18px)',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute',
                  top: -16,
                  right: -8,
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.05)',
                }} />

                <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(10px)',
                      border: '2px solid rgba(255,255,255,0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      fontWeight: 900,
                      color: 'white',
                      fontFamily: 'var(--font-outfit)',
                    }}>
                      {journee}
                    </div>
                    <div>
                      <h2 style={{
                        color: 'white',
                        fontFamily: 'var(--font-outfit)',
                        fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
                        fontWeight: 800,
                        margin: 0,
                        letterSpacing: '-0.01em',
                      }}>
                        {journee}{getOrdinalSuffix(journee)} Journée
                        {isToday && (
                          <span style={{
                            marginLeft: 8,
                            fontSize: '0.6rem',
                            fontWeight: 800,
                            background: '#FFD700',
                            color: '#5a3800',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            verticalAlign: 'middle',
                            letterSpacing: '0.02em',
                          }}>
                            AUJOURD'HUI
                          </span>
                        )}
                      </h2>
                      <p style={{
                        color: 'rgba(255,255,255,0.75)',
                        fontSize: '0.65rem',
                        margin: '1px 0 0',
                        fontWeight: 500,
                      }}>
                        {matches.length} rencontre{matches.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(255,215,0,0.2)',
                    color: '#FFD700',
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.6rem',
                    fontWeight: 700,
                  }}>
                    🏆 CNP 2026
                  </div>
                </div>
              </div>

              {/* Matchs par date */}
              <div style={{ padding: 'clamp(8px, 2vw, 14px)' }}>
                {Object.entries(matchesByDate).map(([date, dateMatches], dateIndex) => (
                  <div key={date} style={{
                    marginBottom: dateIndex < Object.keys(matchesByDate).length - 1 ? 16 : 0,
                  }}>
                    {/* Date Header */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 6,
                      paddingBottom: 6,
                      marginBottom: 6,
                      borderBottom: '1px solid var(--color-border)',
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        color: 'var(--color-text-primary)',
                        fontWeight: 700,
                        fontSize: 'clamp(0.7rem, 2vw, 0.8rem)',
                      }}>
                        <span>📅</span>
                        <span>{formatDate(date)}</span>
                      </div>
                      <span style={{
                        background: 'var(--gradient-green)',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        boxShadow: 'var(--shadow-green)',
                      }}>
                        {dateMatches.length} match{dateMatches.length > 1 ? 'es' : ''}
                      </span>
                    </div>

                    {/* Match Cards - Beautiful List */}
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
                        const colorA = equipeA?.couleur_principale || '#006233'
                        const colorB = equipeB?.couleur_principale || '#006233'

                        return (
                          <div key={`${match.date_match}-${match.equipe_a}-${match.equipe_b}`} className="match-row" style={{
                            background: 'var(--color-surface-card)',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--color-border)',
                            overflow: 'hidden',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)',
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
                                  width: 32,
                                  height: 32,
                                  borderRadius: 'var(--radius-md)',
                                  overflow: 'hidden',
                                  flexShrink: 0,
                                  border: `2px solid ${colorA}30`,
                                  boxShadow: `0 2px 8px ${colorA}18`,
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

                              {/* VS Badge - Premium */}
                              <div style={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #E8002D 0%, #FF6B6B 100%)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.65rem',
                                fontWeight: 900,
                                fontFamily: 'var(--font-outfit)',
                                boxShadow: '0 2px 8px rgba(232,0,45,0.25)',
                                flexShrink: 0,
                                letterSpacing: '0.02em',
                              }}>
                                VS
                              </div>

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
                                  width: 32,
                                  height: 32,
                                  borderRadius: 'var(--radius-md)',
                                  overflow: 'hidden',
                                  flexShrink: 0,
                                  border: `2px solid ${colorB}30`,
                                  boxShadow: `0 2px 8px ${colorB}18`,
                                }}>
                                  <TeamLogo name={equipeBName} align="left" logo={equipeB} />
                                </div>
                              </div>
                            </div>

                            {/* Meta Row - Beautiful */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 8,
                              padding: '8px 14px',
                              background: 'linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.04) 100%)',
                              borderTop: '1px solid var(--color-border)',
                            }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                fontSize: '0.7rem',
                                color: 'var(--color-text-muted)',
                                fontWeight: 500,
                              }}>
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 3,
                                  padding: '2px 8px',
                                  background: 'var(--color-surface)',
                                  borderRadius: 'var(--radius-full)',
                                  border: '1px solid var(--color-border)',
                                }}>
                                  📍 {match.terrain}
                                </span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                {match.ordre && (
                                  <span style={{
                                    fontSize: '0.68rem',
                                    color: 'var(--color-primary)',
                                    fontWeight: 700,
                                    background: 'linear-gradient(135deg, rgba(0,98,51,0.08), rgba(0,166,81,0.06))',
                                    padding: '2px 8px',
                                    borderRadius: 'var(--radius-full)',
                                    border: '1px solid rgba(0,98,51,0.12)',
                                  }}>
                                    #{match.ordre}
                                  </span>
                                )}
                              </div>
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
        .journee-section {
          scroll-margin-top: 140px;
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
            gap: 3px !important;
          }
          .match-row {
            flex-direction: column !important;
            padding: 0 !important;
            gap: 0 !important;
            border-radius: var(--radius-lg) !important;
            box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04) !important;
          }
          .match-row > div:first-child {
            padding: 10px 12px !important;
            gap: 8px !important;
          }
          .match-row > div:last-child {
            padding: 7px 12px !important;
          }
          .match-row .team-badge {
            width: 28px !important;
            height: 28px !important;
          }
          .match-row .team-badge img {
            width: 28px !important;
            height: 28px !important;
          }
          .match-row .team-name {
            font-size: clamp(0.72rem, 2vw, 0.82rem) !important;
          }
          .match-row .vs-badge {
            width: 30px !important;
            height: 30px !important;
            font-size: 0.6rem !important;
          }
        }
      `}</style>
    </div>
  )
}