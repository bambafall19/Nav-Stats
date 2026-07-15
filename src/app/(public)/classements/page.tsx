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
          background: 'var(--gradient-hero)',
          borderRadius: 24,
          padding: 'clamp(24px, 5vw, 40px)',
          marginBottom: 32,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -30, right: -30, fontSize: 120, opacity: 0.05 }}>🏆</div>
          <h1 style={{ color: 'white', fontSize: 'clamp(1.6rem, 5vw, 2.2rem)', fontFamily: 'var(--font-outfit)', fontWeight: 900, marginBottom: 6 }}>
            🏆 Classements
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem' }}>
            {classementGeneral.length} pronostiqueurs · Général · Quartier · ASC
          </p>
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
