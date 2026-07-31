import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { defaultCadetMatches, normalizeAscName, type CadetEquipe, type CadetMatch } from '@/lib/cadets'

const formatDate = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
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
        <div style={{
          background: 'linear-gradient(135deg, #004d27 0%, #006233 50%, #00A651 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: 'clamp(32px, 5vw, 48px)',
          marginBottom: 32,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-green)',
        }}>
          {/* Decorative circles */}
          <div style={{
            position: 'absolute',
            top: -80,
            right: -60,
            width: 240,
            height: 240,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
          }} />
          <div style={{
            position: 'absolute',
            bottom: -60,
            left: -40,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255,215,0,0.1)',
          }} />
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '8rem',
            opacity: 0.03,
          }}>
            ⚽
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Badges */}
            <div style={{
              display: 'flex',
              gap: 8,
              marginBottom: 16,
              flexWrap: 'wrap',
            }}>
              <span style={{
                background: 'rgba(255,255,255,0.15)',
                color: 'white',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.02em',
                backdropFilter: 'blur(10px)',
              }}>
                🏆 ONCAV · ODCAV THIES
              </span>
              <span style={{
                background: 'rgba(255,215,0,0.25)',
                color: '#FFD700',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 700,
                backdropFilter: 'blur(10px)',
              }}>
                📍 ZONE 06 DE KHOMBOLE
              </span>
            </div>

            {/* Title */}
            <h1 style={{
              color: 'white',
              fontFamily: 'var(--font-outfit)',
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 900,
              marginBottom: 12,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              textAlign: 'center',
            }}>
              Calendrier Cadets
            </h1>
            <p style={{
              color: 'rgba(255,255,255,0.85)',
              fontSize: 'clamp(0.9rem, 2vw, 1.05rem)',
              marginBottom: 24,
              maxWidth: 600,
              lineHeight: 1.5,
            }}>
              Championnat National des Poules - Saison 2026
            </p>

            {/* Stats Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: 10,
              maxWidth: 600,
            }}>
              <div style={{
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(10px)',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255,255,255,0.2)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-outfit)', color: 'white', lineHeight: 1 }}>
                  {cadetMatches.length}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.85)', fontWeight: 600, marginTop: 3 }}>
                  Matchs
                </div>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(10px)',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255,255,255,0.2)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-outfit)', color: 'white', lineHeight: 1 }}>
                  {journees.length}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.85)', fontWeight: 600, marginTop: 3 }}>
                  Journées
                </div>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(10px)',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255,255,255,0.2)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-outfit)', color: 'white', lineHeight: 1 }}>
                  {equipesList.length}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.85)', fontWeight: 600, marginTop: 3 }}>
                  Équipes
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Matchs par journée */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {journees.map(journee => {
            const matches = cadetMatches.filter(match => match.journee === journee)
            const matchesByDate = matches.reduce<Record<string, CadetMatch[]>>((acc, match) => {
              acc[match.date_match] = [...(acc[match.date_match] || []), match]
              return acc
            }, {})

            return (
              <section key={journee} style={{
                background: 'var(--color-surface-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-md)',
                overflow: 'hidden',
              }}>
                {/* Journée Header */}
                <div style={{
                  background: 'linear-gradient(135deg, #004d27 0%, #006233 100%)',
                  padding: '20px 24px',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute',
                    top: -20,
                    right: -10,
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)',
                  }} />

                  <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(10px)',
                        border: '2px solid rgba(255,255,255,0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
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
                          fontSize: '1.25rem',
                          fontWeight: 800,
                          margin: 0,
                          letterSpacing: '-0.01em',
                        }}>
                          {journee}{getOrdinalSuffix(journee)} Journée
                        </h2>
                        <p style={{
                          color: 'rgba(255,255,255,0.75)',
                          fontSize: '0.75rem',
                          margin: '2px 0 0',
                          fontWeight: 500,
                        }}>
                          {matches.length} rencontre{matches.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    <div style={{
                      background: 'rgba(255,215,0,0.2)',
                      color: '#FFD700',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                    }}>
                      🏆 CNP 2026
                    </div>
                  </div>
                </div>

                {/* Matchs par date */}
                <div style={{ padding: '16px' }}>
                  {Object.entries(matchesByDate).map(([date, dateMatches], dateIndex) => (
                    <div key={date} style={{
                      marginBottom: dateIndex < Object.keys(matchesByDate).length - 1 ? 24 : 0,
                    }}>
                      {/* Date Header */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                        paddingBottom: 10,
                        marginBottom: 10,
                        borderBottom: '1px solid var(--color-border)',
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          color: 'var(--color-text-primary)',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                        }}>
                          <span>📅</span>
                          <span>{formatDate(date)}</span>
                        </div>
                        <span style={{
                          background: 'var(--gradient-green)',
                          color: 'white',
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          boxShadow: 'var(--shadow-green)',
                        }}>
                          {dateMatches.length} match{dateMatches.length > 1 ? 'es' : ''}
                        </span>
                      </div>

                      {/* Match Cards - Compact */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                        gap: 10,
                      }}>
                        {dateMatches.map(match => {
                          const equipeA = match.equipe_a_info || (match.equipe_a_id ? logoMap.get(match.equipe_a_id) : undefined) || logoMap.get(normalizeAscName(match.equipe_a))
                          const equipeB = match.equipe_b_info || (match.equipe_b_id ? logoMap.get(match.equipe_b_id) : undefined) || logoMap.get(normalizeAscName(match.equipe_b))
                          const equipeAName = equipeA?.nom || match.equipe_a
                          const equipeBName = equipeB?.nom || match.equipe_b

                          return (
                            <div key={`${match.date_match}-${match.equipe_a}-${match.equipe_b}`} style={{
                              background: 'var(--color-surface-card)',
                              borderRadius: 'var(--radius-lg)',
                              padding: 'clamp(14px, 3vw, 18px)',
                              border: '1px solid var(--color-border)',
                              boxShadow: 'var(--shadow-sm)',
                              transition: 'all 0.2s ease',
                            }}>
                              {/* Teams VS Compact */}
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 10,
                                marginBottom: 12,
                              }}>
                                {/* Équipe A */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
                                  <div style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 'var(--radius-md)',
                                    overflow: 'hidden',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                    border: '2px solid var(--color-border)',
                                  }}>
                                    <TeamLogo name={equipeAName} align="right" logo={equipeA} />
                                  </div>
                                  <span style={{
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    textAlign: 'center',
                                    color: 'var(--color-text-primary)',
                                    lineHeight: 1.2,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: '100%',
                                  }}>
                                    {equipeAName}
                                  </span>
                                </div>

                                {/* VS Badge */}
                                <div style={{
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
                                  flexShrink: 0,
                                }}>
                                  VS
                                </div>

                                {/* Équipe B */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
                                  <div style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 'var(--radius-md)',
                                    overflow: 'hidden',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                    border: '2px solid var(--color-border)',
                                  }}>
                                    <TeamLogo name={equipeBName} align="left" logo={equipeB} />
                                  </div>
                                  <span style={{
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    textAlign: 'center',
                                    color: 'var(--color-text-primary)',
                                    lineHeight: 1.2,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: '100%',
                                  }}>
                                    {equipeBName}
                                  </span>
                                </div>
                              </div>

                              {/* Info bar */}
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                paddingTop: 10,
                                borderTop: '1px solid var(--color-border)',
                                fontSize: '0.68rem',
                                color: 'var(--color-text-muted)',
                                fontWeight: 500,
                              }}>
                                <span>📍 {match.terrain}</span>
                                {match.ordre && <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>#{match.ordre}</span>}
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
    <div style={{
      background: 'var(--color-surface-card)',
      borderRadius: 'var(--radius-lg)',
      padding: 20,
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-sm)',
      transition: 'all 0.25s ease',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Status bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4px 10px',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(0, 98, 51, 0.12)',
          color: '#006233',
          fontWeight: 800,
          fontSize: '0.72rem',
          letterSpacing: '0.02em',
        }}>
          Poule {match.poule}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
          <span>📍 {match.terrain}</span>
          {match.ordre && <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>· #{match.ordre}</span>}
        </div>
      </div>

      {/* Teams VS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        gap: 12,
        alignItems: 'center',
        marginBottom: 16,
      }}>
        {/* Équipe A */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: '2px solid var(--color-border)',
          }}>
            <TeamLogo name={equipeAName} align="right" logo={equipeA} />
          </div>
          <span style={{
            fontSize: '0.88rem',
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
        <div style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(232,0,45,0.12), rgba(232,0,45,0.06))',
          color: 'var(--color-red)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.8rem',
          fontWeight: 900,
          fontFamily: 'var(--font-outfit)',
          border: '2px solid rgba(232,0,45,0.2)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}>
          VS
        </div>

        {/* Équipe B */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: '2px solid var(--color-border)',
          }}>
            <TeamLogo name={equipeBName} align="left" logo={equipeB} />
          </div>
          <span style={{
            fontSize: '0.88rem',
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
      <div style={{
        width: '100%',
        padding: '10px',
        background: 'var(--gradient-green)',
        color: 'white',
        border: 'none',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.82rem',
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
