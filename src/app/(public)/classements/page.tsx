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

  const top3 = classementGeneral.slice(0, 3)
  const rest = classementGeneral.slice(3)

  return (
    <div className="page-content">
      <div className="container-app">
        {/* Hero Header */}
        <div style={{
          background: 'linear-gradient(135deg, #004d27 0%, #006233 50%, #008a44 100%)',
          borderRadius: 20,
          padding: '24px 16px',
          marginBottom: 24,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -20, right: -10, fontSize: 100, opacity: 0.04 }}>🏆</div>
          <div style={{ position: 'absolute', bottom: -20, left: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.2rem'
              }}>🏆</div>
              <div>
                <h1 style={{ color: 'white', fontSize: '1.4rem', fontFamily: 'var(--font-outfit)', fontWeight: 900, margin: 0, lineHeight: 1.1 }}>
                  Classements
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.75rem', margin: '4px 0 0 0' }}>
                  Saison Navétanes 2026
                </p>
              </div>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(8px)',
              borderRadius: 10,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white', fontFamily: 'var(--font-outfit)' }}>{classementGeneral.length}</div>
                <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.6)' }}>Pronostiqueurs</div>
              </div>
              <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.15)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#FBBF00', fontFamily: 'var(--font-outfit)' }}>3</div>
                <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.6)' }}>Classements</div>
              </div>
              <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.15)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#FF6B6B', fontFamily: 'var(--font-outfit)' }}>⚡</div>
                <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.6)' }}>Live</div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Classement Général ===== */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: '1.1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            👑 Classement Général
          </h2>

          {/* Top 3 Podium */}
          {top3.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
              {[top3[1], top3[0], top3[2]].map((u, podiumIndex) => {
                if (!u) return <div key={podiumIndex} />
                const realIndex = podiumIndex === 0 ? 1 : podiumIndex === 1 ? 0 : 2
                return (
                  <div key={u.id} style={{
                    background: 'var(--color-surface-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 14,
                    padding: '12px 6px',
                    textAlign: 'center',
                    position: 'relative',
                    transform: realIndex === 0 ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: realIndex === 0 ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                  }}>
                    {realIndex === 0 && (
                      <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', fontSize: '1.2rem' }}>👑</div>
                    )}
                    <Link href={`/profil/${u.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: realIndex === 0 ? 'linear-gradient(135deg,#FFD700,#FFA500)' : 
                                  realIndex === 1 ? 'linear-gradient(135deg,#E8E8E8,#B0B0B0)' : 
                                  'linear-gradient(135deg,#CD7F32,#9A5E20)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 6px',
                        fontSize: '1.1rem',
                        boxShadow: realIndex === 0 ? '0 4px 12px rgba(255,165,0,0.4)' : 
                                  realIndex === 1 ? '0 4px 12px rgba(150,150,150,0.3)' : 
                                  '0 4px 12px rgba(160,90,30,0.3)',
                      }}>
                        {u.avatar_url
                          ? <img src={u.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                          : ['🥇', '🥈', '🥉'][realIndex]
                        }
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.7rem', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                        {u.username}
                      </div>
                    </Link>
                    <div style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: '0.95rem', color: 'var(--color-primary)' }}>
                      {u.points}
                      <span style={{ fontSize: '0.6rem', fontWeight: 500, color: 'var(--color-text-muted)', marginLeft: 2 }}>pts</span>
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
            borderRadius: 14,
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
          }}>
            {rest.map((u, idx) => {
              const i = idx + 3
              const pct = u.total_pronostics > 0 ? Math.round((u.pronostics_corrects / u.total_pronostics) * 100) : 0
              return (
                <div key={u.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px',
                  borderBottom: idx < rest.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'var(--color-surface)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.65rem', fontWeight: 700,
                    color: 'var(--color-text-muted)', flexShrink: 0,
                  }}>{i + 1}</div>

                  <Link href={`/profil/${u.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0, textDecoration: 'none', color: 'inherit' }}>
                    <div className="avatar" style={{ width: 30, height: 30, fontSize: '0.7rem', flexShrink: 0 }}>
                      {u.avatar_url
                        ? <img src={u.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        : u.username.charAt(0).toUpperCase()
                      }
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.username}</div>
                      {u.quartier && <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>{u.quartier}</div>}
                    </div>
                  </Link>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: '0.9rem', color: 'var(--color-primary)' }}>{u.points}</div>
                    <div style={{ fontSize: '0.6rem', color: pct >= 60 ? 'var(--color-primary)' : pct >= 40 ? '#D97706' : 'var(--color-red)', fontWeight: 600 }}>{pct}%</div>
                  </div>
                </div>
              )
            })}
            {classementGeneral.length === 0 && (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                Aucun pronostiqueur pour l'instant
              </div>
            )}
          </div>
        </div>

        {/* ===== Classement Équipes ===== */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: '1.1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            ⚽ Classement Équipes
          </h2>
          <div style={{ display: 'grid', gap: 16 }}>
            {groupes.map((groupe) => {
              const eqs = equipesParGroupe[groupe]
              if (!eqs || eqs.length === 0) return null
              return (
                <div key={groupe} style={{
                  background: 'var(--color-surface-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 14,
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  <div style={{
                    padding: '12px 16px',
                    background: 'rgba(0,166,81,0.06)',
                    borderBottom: '1px solid var(--color-border)',
                    fontWeight: 800,
                    fontFamily: 'var(--font-outfit)',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}>
                    {groupe === 'Général' ? '🏆 Classement Général' : `🏆 Poule ${groupe}`}
                    <span style={{ fontSize: '0.65rem', fontWeight: 500, color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
                      {eqs.length} équipes
                    </span>
                  </div>

                  {/* Mobile card view */}
                  <div style={{ padding: 12 }}>
                    {eqs.map((eq: any, i: number) => (
                      <div key={eq.id} style={{
                        background: 'var(--color-surface)',
                        borderRadius: 10,
                        padding: 10,
                        border: i < 3 ? `1.5px solid ${['#FFD700','#C0C0C0','#CD7F32'][i]}` : '1px solid var(--color-border)',
                        marginBottom: 8,
                        position: 'relative',
                        overflow: 'hidden',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: 8,
                            background: i < 3 ? ['linear-gradient(135deg,#FFD700,#FFA500)','linear-gradient(135deg,#E8E8E8,#B0B0B0)','linear-gradient(135deg,#CD7F32,#9A5E20)'][i] : 'var(--gradient-green)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.65rem', fontWeight: 900, color: 'white', flexShrink: 0,
                          }}>
                            {i < 3 ? ['🥇','🥈','🥉'][i] : i+1}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{eq.nom}</div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                              {eq.quartier || eq.asc_nom || ''}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: '1rem', color: 'var(--color-primary)' }}>
                              {eq.points_classement || 0}
                            </div>
                            <div style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)' }}>pts</div>
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 8 }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', marginBottom: 2 }}>MJ</div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{eq.matchs_joues || 0}</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.6rem', color: '#006233', marginBottom: 2 }}>V</div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#006233' }}>{eq.victoires || 0}</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.6rem', color: '#E8002D', marginBottom: 2 }}>D</div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#E8002D' }}>{eq.defaites || 0}</div>
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
              borderRadius: 14,
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)',
            }}>
              {classementQuartier.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Aucune donnée</div>
              ) : classementQuartier.map((q, i) => (
                <div key={q.quartier} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px',
                  borderBottom: i < classementQuartier.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}>
                  <span style={{ fontSize: i < 3 ? '1rem' : '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', flexShrink: 0, width: 22, textAlign: 'center' }}>
                    {i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>🏘️ {q.quartier}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>{q.membres} membres</div>
                  </div>
                  <div style={{
                    background: 'rgba(0,98,51,0.08)', borderRadius: 6, padding: '3px 8px',
                    fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: '0.85rem', color: 'var(--color-primary)',
                  }}>
                    {q.points} <span style={{ fontSize: '0.55rem', fontWeight: 500 }}>pts</span>
                  </div>
                </div>
              ))}
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
              borderRadius: 14,
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)',
            }}>
              {classementASC.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Aucune donnée</div>
              ) : classementASC.map((a, i) => {
                const eq = equipeByAsc[a.asc]
                return (
                  <div key={a.asc} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px',
                    borderBottom: i < classementASC.length - 1 ? '1px solid var(--color-border)' : 'none',
                  }}>
                    <span style={{ fontSize: i < 3 ? '1rem' : '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', flexShrink: 0, width: 22, textAlign: 'center' }}>
                      {i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}
                    </span>

                    {eq?.logo_url ? (
                      <img src={eq.logo_url} alt={a.asc} style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{
                        width: 32, height: 32, borderRadius: 6, flexShrink: 0,
                        background: eq ? `linear-gradient(135deg, ${eq.couleur_principale}, ${eq.couleur_secondaire})` : 'var(--color-surface)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.6rem', fontWeight: 800, color: 'white',
                      }}>
                        {eq?.sigle || a.asc.charAt(0)}
                      </div>
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>ASC {a.asc}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>{a.membres} membres</div>
                    </div>

                    <div style={{
                      background: 'rgba(0,98,51,0.08)', borderRadius: 6, padding: '3px 8px',
                      fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: '0.85rem', color: 'var(--color-primary)',
                      flexShrink: 0,
                    }}>
                      {a.points} <span style={{ fontSize: '0.55rem', fontWeight: 500 }}>pts</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
