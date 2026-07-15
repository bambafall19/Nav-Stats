import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Classements Pronostiqueurs – Navétanes Khombole 2026 | NavéStats',
  description: 'Classement général des pronostiqueurs, par quartier et par ASC. Découvrez qui sont les meilleurs pronostiqueurs des Navétanes de Khombole cette saison 2026.',
  openGraph: {
    title: 'Classements Pronostiqueurs – Navétanes Khombole 2026',
    description: 'Classement général, par quartier et par ASC des pronostiqueurs. Qui sera le champion cette saison ?',
    url: 'https://navestats.site/classements',
    siteName: 'NavéStats',
    images: [
      {
        url: 'https://navestats.site/og-classements.jpg',
        width: 1200,
        height: 630,
        alt: 'NavéStats - Classements Pronostiqueurs',
      },
    ],
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Classements – Navétanes Khombole',
    description: 'Découvrez le classement des meilleurs pronostiqueurs des Navétanes de Khombole',
    images: ['https://navestats.site/og-classements.jpg'],
  },
}

export default async function ClassementsPage() {
  const supabase = await createClient()

  const { data: rawClassement } = await supabase
    .from('profiles')
    .select('*')
    .order('points', { ascending: false })
    .limit(50)

  const classementGeneral = (rawClassement || []) as any[]

  // Classement par quartier
  const quartiersMap: Record<string, { points: number; membres: number }> = {}
  classementGeneral.forEach(u => {
    if (u.quartier) {
      if (!quartiersMap[u.quartier]) quartiersMap[u.quartier] = { points: 0, membres: 0 }
      quartiersMap[u.quartier].points += u.points
      quartiersMap[u.quartier].membres++
    }
  })
  const classementQuartier = Object.entries(quartiersMap)
    .map(([q, v]) => ({ quartier: q, ...v }))
    .sort((a, b) => b.points - a.points)

  // Classement par ASC – fetch equipe logos
  const { data: equipes } = await supabase.from('equipes').select('nom, logo_url, asc_nom, couleur_principale, couleur_secondaire, sigle')
  const equipeByAsc: Record<string, any> = {}
  ;(equipes || []).forEach((eq: any) => {
    if (eq.asc_nom && !equipeByAsc[eq.asc_nom]) equipeByAsc[eq.asc_nom] = eq
  })

  const ascMap: Record<string, { points: number; membres: number }> = {}
  classementGeneral.forEach(u => {
    if (u.asc_nom) {
      if (!ascMap[u.asc_nom]) ascMap[u.asc_nom] = { points: 0, membres: 0 }
      ascMap[u.asc_nom].points += u.points
      ascMap[u.asc_nom].membres++
    }
  })
  const classementASC = Object.entries(ascMap)
    .map(([asc, v]) => ({ asc, ...v }))
    .sort((a, b) => b.points - a.points)

  // Classement Équipes – fetch all teams ordered by points
  const { data: rawEquipes } = await supabase
    .from('equipes')
    .select('*')
    .order('points_classement', { ascending: false })
  const equipesRanked = (rawEquipes || []) as any[]

  // Group by groupe (poule) if available
  const groupes = [...new Set(equipesRanked.map((e: any) => e.groupe || 'Général'))].sort()
  const equipesParGroupe: Record<string, any[]> = {}
  for (const eq of equipesRanked) {
    const g = eq.groupe || 'Général'
    if (!equipesParGroupe[g]) equipesParGroupe[g] = []
    equipesParGroupe[g].push(eq)
  }

  const medalStyle = (i: number) => {
    if (i === 0) return { bg: 'linear-gradient(135deg,#FFD700,#FFA500)', color: '#5a3800', shadow: '0 4px 12px rgba(255,165,0,0.4)' }
    if (i === 1) return { bg: 'linear-gradient(135deg,#E8E8E8,#B0B0B0)', color: '#2a2a2a', shadow: '0 4px 12px rgba(150,150,150,0.3)' }
    if (i === 2) return { bg: 'linear-gradient(135deg,#CD7F32,#9A5E20)', color: 'white', shadow: '0 4px 12px rgba(160,90,30,0.3)' }
    return { bg: 'var(--color-surface)', color: 'var(--color-text-secondary)', shadow: 'none' }
  }

  const top3 = classementGeneral.slice(0, 3)
  const rest = classementGeneral.slice(3)

  return (
    <div className="page-content">
      <div className="container-app">
        {/* Hero Header */}
        <div style={{
          background: 'linear-gradient(135deg, #004d27 0%, #006233 50%, #008a44 100%)',
          borderRadius: 24,
          padding: 'clamp(28px, 6vw, 48px) clamp(20px, 4vw, 40px)',
          marginBottom: 32,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Background decoration */}
          <div style={{ position: 'absolute', top: -40, right: -20, fontSize: 140, opacity: 0.04 }}>🏆</div>
          <div style={{ position: 'absolute', bottom: -30, left: -30, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
          <div style={{ position: 'absolute', top: 20, left: '30%', width: 80, height: 80, borderRadius: '50%', background: 'rgba(251,191,0,0.06)' }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 16,
                    background: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem'
                  }}>🏆</div>
                  <div>
                    <h1 style={{ color: 'white', fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontFamily: 'var(--font-outfit)', fontWeight: 900, margin: 0, lineHeight: 1.1 }}>
                      Classements
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.8rem', margin: '4px 0 0 0' }}>
                      Saison Navétanes 2026
                    </p>
                  </div>
                </div>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(8px)',
                borderRadius: 12,
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 16
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'white', fontFamily: 'var(--font-outfit)' }}>{classementGeneral.length}</div>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)' }}>Pronostiqueurs</div>
                </div>
                <div style={{ width: 1, height: 30, background: 'rgba(255,255,255,0.15)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#FBBF00', fontFamily: 'var(--font-outfit)' }}>3</div>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)' }}>Classements</div>
                </div>
                <div style={{ width: 1, height: 30, background: 'rgba(255,255,255,0.15)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#FF6B6B', fontFamily: 'var(--font-outfit)' }}>⚡</div>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)' }}>Live</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Classement Équipes ===== */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: '1.1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            ⚽ Classement Équipes
          </h2>
          <div style={{ display: 'grid', gap: 24 }}>
            {groupes.map((groupe) => {
              const eqs = equipesParGroupe[groupe]
              if (!eqs || eqs.length === 0) return null
              return (
                <div key={groupe} style={{
                  background: 'var(--color-surface-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 16,
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  <div style={{
                    padding: '14px 20px',
                    background: 'rgba(0,166,81,0.06)',
                    borderBottom: '1px solid var(--color-border)',
                    fontWeight: 800,
                    fontFamily: 'var(--font-outfit)',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}>
                    {groupe === 'Général' ? '🏆 Classement Général' : `🏆 Poule ${groupe}`}
                    <span style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
                      {eqs.length} équipes
                    </span>
                  </div>

                  {/* Desktop table view */}
                  <div className="desktop-table-only">
                    <div className="table-scroll">
                      <table className="data-table" style={{ fontSize: '0.82rem' }}>
                        <thead>
                          <tr>
                            <th style={{ width: 36, textAlign: 'center' }}>#</th>
                            <th>Équipe</th>
                            <th style={{ textAlign: 'center' }}>MJ</th>
                            <th style={{ textAlign: 'center' }}>V</th>
                            <th style={{ textAlign: 'center' }}>N</th>
                            <th style={{ textAlign: 'center' }}>D</th>
                            <th style={{ textAlign: 'center' }}>BP</th>
                            <th style={{ textAlign: 'center' }}>BC</th>
                            <th style={{ textAlign: 'center' }}>Diff</th>
                            <th style={{ textAlign: 'center', fontWeight: 800 }}>Pts</th>
                          </tr>
                        </thead>
                        <tbody>
                          {eqs.map((eq: any, i: number) => (
                            <tr key={eq.id} style={{
                              background: i < 3 ? 'rgba(0,166,81,0.03)' : 'transparent',
                              borderLeft: i === 0 ? '3px solid #FFD700' : i === 1 ? '3px solid #C0C0C0' : i === 2 ? '3px solid #CD7F32' : '3px solid transparent',
                            }}>
                              <td style={{ textAlign: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
                                {i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}
                              </td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  {eq.logo_url ? (
                                    <img src={eq.logo_url} alt={eq.nom} style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover' }} />
                                  ) : (
                                    <div style={{
                                      width: 28, height: 28, borderRadius: 6,
                                      background: 'var(--gradient-green)',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      fontSize: '0.6rem', fontWeight: 800, color: 'white',
                                    }}>
                                      {eq.nom?.charAt(0) || '?'}
                                    </div>
                                  )}
                                  <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{eq.nom}</div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>{eq.quartier || eq.asc_nom || ''}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ textAlign: 'center', fontWeight: 600 }}>{eq.matchs_joues || 0}</td>
                              <td style={{ textAlign: 'center', fontWeight: 600, color: '#006233' }}>{eq.victoires || 0}</td>
                              <td style={{ textAlign: 'center', fontWeight: 600, color: '#D97706' }}>{eq.nuls || 0}</td>
                              <td style={{ textAlign: 'center', fontWeight: 600, color: '#E8002D' }}>{eq.defaites || 0}</td>
                              <td style={{ textAlign: 'center', fontWeight: 600 }}>{eq.buts_marques || 0}</td>
                              <td style={{ textAlign: 'center', fontWeight: 600 }}>{eq.buts_encaisses || 0}</td>
                              <td style={{ textAlign: 'center', fontWeight: 800 }}>
                                <span style={{
                                  color: ((eq.buts_marques || 0) - (eq.buts_encaisses || 0)) > 0 ? '#006233' : ((eq.buts_marques || 0) - (eq.buts_encaisses || 0)) < 0 ? '#E8002D' : 'var(--color-text-muted)'
                                }}>
                                  {((eq.buts_marques || 0) - (eq.buts_encaisses || 0)) > 0 ? '+' : ''}{(eq.buts_marques || 0) - (eq.buts_encaisses || 0)}
                                </span>
                              </td>
                              <td style={{ textAlign: 'center', fontWeight: 900, fontSize: '1rem', color: 'var(--color-primary)' }}>
                                {eq.points_classement || 0}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mobile card view */}
                  <div className="mobile-table-cards">
                    {eqs.map((eq: any, i: number) => (
                      <div key={eq.id} style={{
                        background: 'var(--color-surface)',
                        borderRadius: 12,
                        padding: 12,
                        border: i < 3 ? `1.5px solid ${['#FFD700','#C0C0C0','#CD7F32'][i]}` : '1px solid var(--color-border)',
                        position: 'relative',
                        overflow: 'hidden',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: i < 3 ? ['linear-gradient(135deg,#FFD700,#FFA500)','linear-gradient(135deg,#E8E8E8,#B0B0B0)','linear-gradient(135deg,#CD7F32,#9A5E20)'][i] : 'var(--gradient-green)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.7rem', fontWeight: 900, color: 'white', flexShrink: 0,
                          }}>
                            {i < 3 ? ['🥇','🥈','🥉'][i] : i+1}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{eq.nom}</div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                              {eq.quartier || eq.asc_nom || ''}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: '1.1rem', color: 'var(--color-primary)' }}>
                              {eq.points_classement || 0}
                            </div>
                            <div style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)' }}>pts</div>
                          </div>
                        </div>
                        <div className="mobile-stat-grid">
                          <div className="mobile-stat-cell">
                            <span className="mobile-stat-label">MJ</span>
                            <span className="mobile-stat-value">{eq.matchs_joues || 0}</span>
                          </div>
                          <div className="mobile-stat-cell">
                            <span className="mobile-stat-label" style={{ color: '#006233' }}>V</span>
                            <span className="mobile-stat-value" style={{ color: '#006233' }}>{eq.victoires || 0}</span>
                          </div>
                          <div className="mobile-stat-cell">
                            <span className="mobile-stat-label" style={{ color: '#D97706' }}>N</span>
                            <span className="mobile-stat-value" style={{ color: '#D97706' }}>{eq.nuls || 0}</span>
                          </div>
                          <div className="mobile-stat-cell">
                            <span className="mobile-stat-label" style={{ color: '#E8002D' }}>D</span>
                            <span className="mobile-stat-value" style={{ color: '#E8002D' }}>{eq.defaites || 0}</span>
                          </div>
                          <div className="mobile-stat-cell">
                            <span className="mobile-stat-label">BP:BC</span>
                            <span className="mobile-stat-value">{eq.buts_marques || 0}:{eq.buts_encaisses || 0}</span>
                          </div>
                          <div className="mobile-stat-cell">
                            <span className="mobile-stat-label">Diff</span>
                            <span className="mobile-stat-value" style={{
                              color: ((eq.buts_marques || 0) - (eq.buts_encaisses || 0)) > 0 ? '#006233' : ((eq.buts_marques || 0) - (eq.buts_encaisses || 0)) < 0 ? '#E8002D' : 'var(--color-text-muted)'
                            }}>
                              {((eq.buts_marques || 0) - (eq.buts_encaisses || 0)) > 0 ? '+' : ''}{(eq.buts_marques || 0) - (eq.buts_encaisses || 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ display: 'grid', gap: 32 }} className="classements-grid">
          {/* ===== Classement Général ===== */}
          <div>
            <h2 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: '1.1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              👑 Classement Général
            </h2>

            {/* Top 3 Podium */}
            {top3.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
                {[top3[1], top3[0], top3[2]].map((u, podiumIndex) => {
                  if (!u) return <div key={podiumIndex} />
                  const realIndex = podiumIndex === 0 ? 1 : podiumIndex === 1 ? 0 : 2
                  const medals = medalStyle(realIndex)
                  return (
                    <div key={u.id} style={{
                      background: 'var(--color-surface-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 16,
                      padding: '16px 8px',
                      textAlign: 'center',
                      position: 'relative',
                      transform: realIndex === 0 ? 'scale(1.04)' : 'scale(1)',
                      boxShadow: realIndex === 0 ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                    }}>
                      {realIndex === 0 && (
                        <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', fontSize: '1.4rem' }}>👑</div>
                      )}
                      <Link href={`/profil/${u.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }} className="ranking-user-link">
                        <div style={{
                          width: 44, height: 44, borderRadius: '50%',
                          background: medals.bg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          margin: '0 auto 8px',
                          fontSize: '1.3rem',
                          boxShadow: medals.shadow,
                        }}>
                          {u.avatar_url
                            ? <img src={u.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            : ['🥇', '🥈', '🥉'][realIndex]
                          }
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '0.75rem', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }} className="user-link">
                          {u.username}
                        </div>
                      </Link>
                      <div style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: '1.1rem', color: 'var(--color-primary)' }}>
                        {u.points}
                        <span style={{ fontSize: '0.65rem', fontWeight: 500, color: 'var(--color-text-muted)', marginLeft: 2 }}>pts</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Rest of ranking */}
            <div style={{
              background: 'var(--color-surface-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)',
            }}>
              {rest.map((u, idx) => {
                const i = idx + 3
                const pct = u.total_pronostics > 0 ? Math.round((u.pronostics_corrects / u.total_pronostics) * 100) : 0
                return (
                  <div key={u.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px',
                    borderBottom: idx < rest.length - 1 ? '1px solid var(--color-border)' : 'none',
                    transition: 'background 0.15s',
                  }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%',
                      background: 'var(--color-surface)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', fontWeight: 700,
                      color: 'var(--color-text-muted)', flexShrink: 0,
                    }}>{i + 1}</div>

                    <Link href={`/profil/${u.id}`} style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0, textDecoration: 'none', color: 'inherit' }} className="ranking-user-link">
                      <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.75rem', flexShrink: 0 }}>
                        {u.avatar_url
                          ? <img src={u.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                          : u.username.charAt(0).toUpperCase()
                        }
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="user-link">{u.username}</div>
                        {u.quartier && <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>{u.quartier}</div>}
                      </div>
                    </Link>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-primary)' }}>{u.points}</div>
                      <div style={{ fontSize: '0.65rem', color: pct >= 60 ? 'var(--color-primary)' : pct >= 40 ? '#D97706' : 'var(--color-red)', fontWeight: 600 }}>{pct}%</div>
                    </div>
                  </div>
                )
              })}
              {classementGeneral.length === 0 && (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  Aucun pronostiqueur pour l'instant
                </div>
              )}
            </div>
          </div>

          {/* ===== Classements secondaires ===== */}
          <div style={{ display: 'grid', gap: 24 }}>
            {/* Par Quartier */}
            <div>
              <h2 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: '1.1rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                🏘️ Par Quartier
              </h2>
              <div style={{
                background: 'var(--color-surface-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)',
              }}>
                {classementQuartier.length === 0 ? (
                  <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Aucune donnée</div>
                ) : classementQuartier.map((q, i) => {
                  const m = medalStyle(i)
                  return (
                    <div key={q.quartier} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 16px',
                      borderBottom: i < classementQuartier.length - 1 ? '1px solid var(--color-border)' : 'none',
                      borderLeft: i < 3 ? `3px solid ${['#FFD700','#C0C0C0','#CD7F32'][i]}` : '3px solid transparent',
                    }}>
                      <span style={{ fontSize: i < 3 ? '1.1rem' : '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', flexShrink: 0, width: 24, textAlign: 'center' }}>
                        {i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>🏘️ {q.quartier}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>{q.membres} membres</div>
                      </div>
                      <div style={{
                        background: 'rgba(0,98,51,0.08)', borderRadius: 8, padding: '4px 10px',
                        fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: '0.95rem', color: 'var(--color-primary)',
                      }}>
                        {q.points} <span style={{ fontSize: '0.6rem', fontWeight: 500 }}>pts</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Par ASC */}
            <div>
              <h2 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: '1.1rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                🛡️ Par ASC
              </h2>
              <div style={{
                background: 'var(--color-surface-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)',
              }}>
                {classementASC.length === 0 ? (
                  <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Aucune donnée</div>
                ) : classementASC.map((a, i) => {
                  const eq = equipeByAsc[a.asc]
                  return (
                    <div key={a.asc} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 16px',
                      borderBottom: i < classementASC.length - 1 ? '1px solid var(--color-border)' : 'none',
                      borderLeft: i < 3 ? `3px solid ${['#FFD700','#C0C0C0','#CD7F32'][i]}` : '3px solid transparent',
                    }}>
                      <span style={{ fontSize: i < 3 ? '1.1rem' : '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', flexShrink: 0, width: 24, textAlign: 'center' }}>
                        {i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}
                      </span>

                      {/* ASC Logo */}
                      {eq?.logo_url ? (
                        <img src={eq.logo_url} alt={a.asc} style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{
                          width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                          background: eq ? `linear-gradient(135deg, ${eq.couleur_principale}, ${eq.couleur_secondaire})` : 'var(--color-surface)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.65rem', fontWeight: 800, color: 'white',
                        }}>
                          {eq?.sigle || a.asc.charAt(0)}
                        </div>
                      )}

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>ASC {a.asc}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>{a.membres} membres</div>
                      </div>

                      <div style={{
                        background: 'rgba(0,98,51,0.08)', borderRadius: 8, padding: '4px 10px',
                        fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: '0.95rem', color: 'var(--color-primary)',
                        flexShrink: 0,
                      }}>
                        {a.points} <span style={{ fontSize: '0.6rem', fontWeight: 500 }}>pts</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @media (min-width: 1024px) {
            .classements-grid { grid-template-columns: 3fr 2fr !important; }
          }
          .ranking-user-link:hover .user-link {
            text-decoration: underline;
            color: var(--color-primary-light);
          }
        `}</style>
      </div>
    </div>
  )
}
