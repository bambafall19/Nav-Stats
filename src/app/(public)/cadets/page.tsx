import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { defaultCadetMatches, normalizeAscName, type CadetEquipe, type CadetMatch } from '@/lib/cadets'

const formatDate = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })

export const metadata: Metadata = {
  title: 'Calendrier Cadets CNP 2026 | NavéStats',
  description: 'Calendrier officiel des rencontres CNP 2026, catégorie cadette, Zone 06 de Khombole.',
  openGraph: {
    title: 'Calendrier Cadets CNP 2026',
    description: 'Toutes les rencontres cadettes CNP 2026 de la Zone 06 de Khombole.',
    url: 'https://navestats.site/cadets',
    siteName: 'NavéStats',
    type: 'website',
    locale: 'fr_FR',
  },
}

export const dynamic = 'force-dynamic'

export default async function CadetsPage() {
  const supabase = await createClient()
  const [{ data: dbCadets, error }, { data: equipes }] = await Promise.all([
    supabase
      .from('cadet_matchs')
      .select(`
        id, journee, date_match, poule, equipe_a_id, equipe_b_id, equipe_a, equipe_b, terrain, ordre,
        equipe_a_info:equipes!cadet_matchs_equipe_a_id_fkey(id, nom, sigle, logo_url, couleur_principale, couleur_secondaire, quartier, asc_nom),
        equipe_b_info:equipes!cadet_matchs_equipe_b_id_fkey(id, nom, sigle, logo_url, couleur_principale, couleur_secondaire, quartier, asc_nom)
      `)
      .order('journee')
      .order('date_match')
      .order('ordre'),
    supabase
      .from('equipes')
      .select('id, nom, sigle, logo_url, couleur_principale, couleur_secondaire, quartier, asc_nom')
      .order('nom'),
  ])

  const cadetMatches = !error && dbCadets?.length ? dbCadets as CadetMatch[] : defaultCadetMatches
  const journees = [...new Set(cadetMatches.map(match => match.journee))]
  const logoMap = new Map<string, CadetEquipe>()
  const equipesList: CadetEquipe[] = (equipes || [])
  equipesList.forEach(equipe => {
    logoMap.set(equipe.id, equipe)
    logoMap.set(normalizeAscName(equipe.nom), equipe)
    if (equipe.sigle) logoMap.set(normalizeAscName(equipe.sigle), equipe)
  })

  return (
    <div className="page-content">
      <div className="container-app">
        {/* Hero Section */}
        <div className="cadets-hero" style={{
          background: 'linear-gradient(135deg, #004d27 0%, #006233 50%, #00A651 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: 'clamp(14px, 4vw, 24px)',
          marginBottom: 12,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-green)',
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Title */}
            <h1 style={{
              color: 'white',
              fontFamily: 'var(--font-outfit)',
              fontSize: 'clamp(1.1rem, 4vw, 1.6rem)',
              fontWeight: 900,
              marginBottom: 2,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              textAlign: 'center',
            }}>
              Calendrier Cadets
            </h1>
            <p style={{
              color: 'rgba(255,255,255,0.85)',
              fontSize: 'clamp(0.7rem, 2vw, 0.85rem)',
              marginBottom: 10,
              textAlign: 'center',
            }}>
              CNP 2026 - Zone 06 de Khombole
            </p>

            {/* Stats Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 6,
            }}>
              <div style={{
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(10px)',
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(255,255,255,0.2)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '1rem', fontWeight: 900, fontFamily: 'var(--font-outfit)', color: 'white', lineHeight: 1 }}>
                  {cadetMatches.length}
                </div>
                <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.85)', fontWeight: 600, marginTop: 2 }}>
                  Matchs
                </div>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(10px)',
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(255,255,255,0.2)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '1rem', fontWeight: 900, fontFamily: 'var(--font-outfit)', color: 'white', lineHeight: 1 }}>
                  {journees.length}
                </div>
                <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.85)', fontWeight: 600, marginTop: 2 }}>
                  Journées
                </div>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(10px)',
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(255,255,255,0.2)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '1rem', fontWeight: 900, fontFamily: 'var(--font-outfit)', color: 'white', lineHeight: 1 }}>
                  {equipesList.length}
                </div>
                <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.85)', fontWeight: 600, marginTop: 2 }}>
                  Équipes
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Matchs par journée */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {journees.map(journee => {
            const matches = cadetMatches.filter(match => match.journee === journee)
            const matchesByDate = matches.reduce<Record<string, CadetMatch[]>>((acc, match) => {
              acc[match.date_match] = [...(acc[match.date_match] || []), match]
              return acc
            }, {})

            return (
              <section key={journee} className="journee-section" style={{
                background: 'var(--color-surface-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-md)',
                overflow: 'hidden',
              }}>
                {/* Journée Header */}
                <div className="journee-header" style={{
                  background: 'linear-gradient(135deg, #004d27 0%, #006233 100%)',
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
                          const equipeA = match.equipe_a_info || (match.equipe_a_id ? logoMap.get(match.equipe_a_id) : undefined) || logoMap.get(normalizeAscName(match.equipe_a))
                          const equipeB = match.equipe_b_info || (match.equipe_b_id ? logoMap.get(match.equipe_b_id) : undefined) || logoMap.get(normalizeAscName(match.equipe_b))
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
      </div>
    </div>
  )
}

function getOrdinalSuffix(n: number): string {
  if (n === 1) return 're'
  if (n === 2) return 'nd'
  if (n === 3) return 'e'
  return 'e'
}

function MatchCard({ match, logoMap }: { match: CadetMatch; logoMap: Map<string, CadetEquipe> }) {
  const equipeA = match.equipe_a_info || (match.equipe_a_id ? logoMap.get(match.equipe_a_id) : undefined) || logoMap.get(normalizeAscName(match.equipe_a))
  const equipeB = match.equipe_b_info || (match.equipe_b_id ? logoMap.get(match.equipe_b_id) : undefined) || logoMap.get(normalizeAscName(match.equipe_b))
  const equipeAName = equipeA?.nom || match.equipe_a
  const equipeBName = equipeB?.nom || match.equipe_b

  return (
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
      {/* Status bar */}
      <div className="match-card-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3px 8px',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(0, 98, 51, 0.12)',
          color: '#006233',
          fontWeight: 800,
          fontSize: '0.65rem',
          letterSpacing: '0.02em',
        }}>
          Poule {match.poule}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.65rem', color: 'var(--color-text-muted)', fontWeight: 600, flexWrap: 'wrap' }}>
          <span>📍 {match.terrain}</span>
          {match.ordre && <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>· #{match.ordre}</span>}
        </div>
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
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: '2px solid var(--color-border)',
          }}>
            <TeamLogo name={equipeAName} align="right" logo={equipeA} />
          </div>
          <span className="team-name" style={{
            fontSize: 'clamp(0.7rem, 2vw, 0.85rem)',
            fontWeight: 700,
            textAlign: 'center',
            color: 'var(--color-text-primary)',
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '100%',
          }}>
            {equipeAName}
          </span>
        </div>

        {/* VS Badge */}
        <div className="vs-badge" style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(232,0,45,0.12), rgba(232,0,45,0.06))',
          color: 'var(--color-red)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.7rem',
          fontWeight: 900,
          fontFamily: 'var(--font-outfit)',
          border: '2px solid rgba(232,0,45,0.2)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}>
          VS
        </div>

        {/* Équipe B */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div className="team-badge" style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: '2px solid var(--color-border)',
          }}>
            <TeamLogo name={equipeBName} align="left" logo={equipeB} />
          </div>
          <span className="team-name" style={{
            fontSize: 'clamp(0.7rem, 2vw, 0.85rem)',
            fontWeight: 700,
            textAlign: 'center',
            color: 'var(--color-text-primary)',
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '100%',
          }}>
            {equipeBName}
          </span>
        </div>
      </div>

      {/* Pronostiquer Button */}
          <div className="cta-button" style={{
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
            cursor: 'pointer',
          }}>
        🎯 Pronostiquer
      </div>
    </div>
  )
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

<style>{`
  @media (max-width: 640px) {
    .cadets-hero {
      padding: 14px !important;
      margin-bottom: 10px !important;
    }
    .cadets-hero h1 {
      font-size: 1.1rem !important;
    }
    .cadets-hero p {
      font-size: 0.72rem !important;
      margin-bottom: 8px !important;
    }
    .cadets-hero > div:last-child > div {
      padding: 5px !important;
    }
    .cadets-hero > div:last-child > div > div:first-child {
      font-size: 0.85rem !important;
    }
    .cadets-hero > div:last-child > div > div:last-child {
      font-size: 0.52rem !important;
    }
    .journee-section {
      margin-bottom: 10px !important;
    }
    .journee-header {
      padding: 12px 14px !important;
    }
    .journee-header h2 {
      font-size: 0.9rem !important;
    }
    .journee-header div:first-child > div:first-child {
      width: 30px !important;
      height: 30px !important;
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
    .match-row .terrain-badge {
      font-size: 0.6rem !important;
    }
    .match-row .ordre-badge {
      font-size: 0.58rem !important;
      padding: 2px 6px !important;
    }
    .match-card {
      padding: 10px !important;
    }
    .match-card .team-badge {
      width: 34px !important;
      height: 34px !important;
    }
    .match-card .team-badge img {
      width: 34px !important;
      height: 34px !important;
    }
    .match-card .vs-badge {
      width: 30px !important;
      height: 30px !important;
      font-size: 0.65rem !important;
    }
    .match-card .team-name {
      font-size: 0.7rem !important;
    }
    .match-card-top {
      padding: 6px 8px !important;
      margin-bottom: 8px !important;
    }
    .match-card .cta-button {
      padding: 7px !important;
      font-size: 0.72rem !important;
    }
  }
`}</style>
