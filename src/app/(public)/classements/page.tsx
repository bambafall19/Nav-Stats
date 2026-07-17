import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Classements – NavéStats',
  description: 'Classement des pronostiqueurs, équipes et ASC des Navétanes de Khombole',
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

  // Classement par ASC
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

  // Classement Équipes
  const { data: rawEquipes } = await supabase
    .from('equipes')
    .select('*')
    .order('points_classement', { ascending: false })
  const equipesRanked = (rawEquipes || []) as any[]

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
          borderRadius: 'clamp(16px, 4vw, 24px)',
          padding: 'clamp(20px, 5vw, 32px)',
          marginBottom: 'clamp(20px, 5vw, 32px)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -20, fontSize: 100, opacity: 0.04 }}>🏆</div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{ color: 'white', fontSize: 'clamp(1.3rem, 5vw, 2rem)', fontFamily: 'var(--font-outfit)', fontWeight: 900, margin: 0, marginBottom: 8 }}>
              🏆 Classements
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'clamp(0.75rem, 2vw, 0.9rem)', margin: 0 }}>
              {classementGeneral.length} pronostiqueurs • {equipesRanked.length} équipes
            </p>
          </div>
        </div>

        {/* Classement Équipes */}
        {equipesRanked.length > 0 && (
          <div style={{ marginBottom: 'clamp(24px, 5vw, 32px)' }}>
            <h2 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: 'clamp(0.95rem, 3vw, 1.1rem)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              ⚽ Classement Équipes
            </h2>
            <div style={{ display: 'grid', gap: 'clamp(16px, 3vw, 20px)' }}>
              {groupes.map((groupe) => {
                const eqs = equipesParGroupe[groupe]
                if (!eqs || eqs.length === 0) return null
                return (
                  <div key={groupe}>
                    <div style={{
                      fontWeight: 800, fontFamily: 'var(--font-outfit)',
                      fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                      marginBottom: 10,
                      color: 'var(--color-text-secondary)',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      🏆 {groupe === 'Général' ? 'Classement Général' : `Poule ${groupe}`}
                      <span style={{ fontSize: '0.7rem', marginLeft: 'auto' }}>({eqs.length})</span>
                    </div>
                    <div style={{ background: 'var(--color-surface-card)', border: '1px solid var(--color-border)', borderRadius: 'clamp(12px, 3vw, 16px)', overflow: 'hidden' }}>
                      {eqs.map((eq: any, i: number) => (
                        <div key={eq.id} style={{
                          display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 12px)',
                          padding: 'clamp(10px, 2vw, 14px) clamp(12px, 3vw, 16px)',
                          borderBottom: i < eqs.length - 1 ? '1px solid var(--color-border)' : 'none',
                          borderLeft: i < 3 ? `3px solid ${['#FFD700', '#C0C0C0', '#CD7F32'][i]}` : '3px solid transparent',
                        }}>
                          <div style={{
                            width: 'clamp(24px, 5vw, 28px)', height: 'clamp(24px, 5vw, 28px)', borderRadius: '50%',
                            background: i < 3 ? `linear-gradient(135deg, ${['#FFD700', '#C0C0C0', '#CD7F32'][i]}, ${['#FFD700', '#C0C0C0', '#CD7F32'][i]}dd)` : 'var(--color-surface)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)', fontWeight: 700,
                            color: i < 3 ? (i === 0 ? '#5a3800' : i === 1 ? '#2a2a2a' : 'white') : 'var(--color-text-muted)',
                            flexShrink: 0,
                          }}>
                            {i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}
                          </div>

                          {eq.logo_url ? (
                            <img src={eq.logo_url} alt={eq.nom} style={{ width: 'clamp(28px, 6vw, 32px)', height: 'clamp(28px, 6vw, 32px)', borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                          ) : (
                            <div style={{
                              width: 'clamp(28px, 6vw, 32px)', height: 'clamp(28px, 6vw, 32px)', borderRadius: 6,
                              background: 'var(--gradient-green)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 'clamp(0.6rem, 1.5vw, 0.7rem)', fontWeight: 800, color: 'white', flexShrink: 0,
                            }}>
                              {eq.nom?.charAt(0) || '?'}
                            </div>
                          )}

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {eq.nom}
                            </div>
                            <div style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)', color: 'var(--color-text-muted)' }}>
                              {eq.quartier || eq.asc_nom || ''}
                            </div>
                          </div>

                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: 'clamp(0.85rem, 2vw, 0.95rem)', color: 'var(--color-primary)' }}>
                              {eq.points_classement || 0}
                            </div>
                            <div style={{ fontSize: 'clamp(0.6rem, 1.5vw, 0.7rem)', color: 'var(--color-text-muted)' }}>
                              {eq.matchs_joues || 0}MJ
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
        )}

        {/* Top 3 Podium */}
        {top3.length > 0 && (
          <div style={{ marginBottom: 'clamp(24px, 5vw, 32px)' }}>
            <h2 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: 'clamp(0.95rem, 3vw, 1.1rem)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              👑 Top 3 Pronostiqueurs
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'clamp(8px, 2vw, 12px)' }}>
              {[top3[1], top3[0], top3[2]].map((u, podiumIndex) => {
                if (!u) return <div key={podiumIndex} />
                const realIndex = podiumIndex === 0 ? 1 : podiumIndex === 1 ? 0 : 2
                const medals = ['#FFD700', '#C0C0C0', '#CD7F32'][realIndex]
                return (
                  <Link key={u.id} href={`/profil/${u.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{
                      background: 'var(--color-surface-card)',
                      border: `1.5px solid ${medals}`,
                      borderRadius: 'clamp(12px, 3vw, 16px)',
                      padding: 'clamp(12px, 3vw, 16px)',
                      textAlign: 'center',
                      position: 'relative',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                    }}
                      onMouseOver={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                      onMouseOut={e => (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                      {realIndex === 0 && <div style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', fontSize: '1.2rem' }}>👑</div>}
                      <div style={{
                        width: 'clamp(36px, 8vw, 44px)', height: 'clamp(36px, 8vw, 44px)', borderRadius: '50%',
                        background: `linear-gradient(135deg, ${medals}, ${medals}dd)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto clamp(6px, 2vw, 8px)',
                        fontSize: 'clamp(1rem, 3vw, 1.3rem)',
                        flexShrink: 0,
                      }}>
                        {u.avatar_url
                          ? <img src={u.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                          : ['🥇', '🥈', '🥉'][realIndex]
                        }
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 'clamp(0.7rem, 2vw, 0.8rem)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {u.username}
                      </div>
                      <div style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: 'clamp(0.95rem, 3vw, 1.1rem)', color: 'var(--color-primary)' }}>
                        {u.points}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Classement Général */}
        <div style={{ marginBottom: 'clamp(24px, 5vw, 32px)' }}>
          <h2 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: 'clamp(0.95rem, 3vw, 1.1rem)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            📊 Classement Général
          </h2>
          <div style={{ background: 'var(--color-surface-card)', border: '1px solid var(--color-border)', borderRadius: 'clamp(12px, 3vw, 16px)', overflow: 'hidden' }}>
            {rest.map((u, idx) => {
              const i = idx + 3
              const pct = u.total_pronostics > 0 ? Math.round((u.pronostics_corrects / u.total_pronostics) * 100) : 0
              return (
                <Link key={u.id} href={`/profil/${u.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 12px)',
                    padding: 'clamp(10px, 2vw, 14px) clamp(12px, 3vw, 16px)',
                    borderBottom: idx < rest.length - 1 ? '1px solid var(--color-border)' : 'none',
                    transition: 'background 0.15s',
                  }}
                    onMouseOver={e => (e.currentTarget.style.background = 'rgba(0,98,51,0.025)')}
                    onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{
                      width: 'clamp(24px, 5vw, 28px)', height: 'clamp(24px, 5vw, 28px)', borderRadius: '50%',
                      background: 'var(--color-surface)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)', fontWeight: 700,
                      color: 'var(--color-text-muted)', flexShrink: 0,
                    }}>
                      {i + 1}
                    </div>

                    <div className="avatar" style={{ width: 'clamp(32px, 7vw, 36px)', height: 'clamp(32px, 7vw, 36px)', fontSize: 'clamp(0.7rem, 1.5vw, 0.8rem)', flexShrink: 0 }}>
                      {u.avatar_url
                        ? <img src={u.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        : u.username.charAt(0).toUpperCase()
                      }
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {u.username}
                      </div>
                      {u.quartier && <div style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)', color: 'var(--color-text-muted)' }}>
                        {u.quartier}
                      </div>}
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: 'clamp(0.85rem, 2vw, 0.95rem)', color: 'var(--color-primary)' }}>
                        {u.points}
                      </div>
                      <div style={{ fontSize: 'clamp(0.6rem, 1.5vw, 0.7rem)', color: pct >= 60 ? 'var(--color-primary)' : 'var(--color-text-muted)', fontWeight: 600 }}>
                        {pct}%
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
            {classementGeneral.length === 0 && (
              <div style={{ padding: 'clamp(24px, 5vw, 32px)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'clamp(0.8rem, 2vw, 0.9rem)' }}>
                Aucun pronostiqueur
              </div>
            )}
          </div>
        </div>

        {/* Classement Quartiers */}
        {classementQuartier.length > 0 && (
          <div style={{ marginBottom: 'clamp(24px, 5vw, 32px)' }}>
            <h2 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: 'clamp(0.95rem, 3vw, 1.1rem)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              🏘️ Par Quartier
            </h2>
            <div style={{ background: 'var(--color-surface-card)', border: '1px solid var(--color-border)', borderRadius: 'clamp(12px, 3vw, 16px)', overflow: 'hidden' }}>
              {classementQuartier.map((q, i) => (
                <div key={q.quartier} style={{
                  display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 12px)',
                  padding: 'clamp(10px, 2vw, 14px) clamp(12px, 3vw, 16px)',
                  borderBottom: i < classementQuartier.length - 1 ? '1px solid var(--color-border)' : 'none',
                  borderLeft: i < 3 ? `3px solid ${['#FFD700', '#C0C0C0', '#CD7F32'][i]}` : '3px solid transparent',
                }}>
                  <span style={{ fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', fontWeight: 700, color: 'var(--color-text-muted)', flexShrink: 0, width: 'clamp(20px, 4vw, 24px)', textAlign: 'center' }}>
                    {i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 'clamp(0.8rem, 2vw, 0.9rem)' }}>
                      {q.quartier}
                    </div>
                    <div style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)', color: 'var(--color-text-muted)' }}>
                      {q.membres} membres
                    </div>
                  </div>
                  <div style={{
                    background: 'rgba(0,98,51,0.08)', borderRadius: 8, padding: 'clamp(4px, 1vw, 6px) clamp(8px, 2vw, 10px)',
                    fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', color: 'var(--color-primary)',
                  }}>
                    {q.points}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Classement ASC */}
        {classementASC.length > 0 && (
          <div style={{ marginBottom: 'clamp(24px, 5vw, 32px)' }}>
            <h2 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: 'clamp(0.95rem, 3vw, 1.1rem)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              🛡️ Par ASC
            </h2>
            <div style={{ background: 'var(--color-surface-card)', border: '1px solid var(--color-border)', borderRadius: 'clamp(12px, 3vw, 16px)', overflow: 'hidden' }}>
              {classementASC.map((a, i) => {
                const eq = equipeByAsc[a.asc]
                return (
                  <div key={a.asc} style={{
                    display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 12px)',
                    padding: 'clamp(10px, 2vw, 14px) clamp(12px, 3vw, 16px)',
                    borderBottom: i < classementASC.length - 1 ? '1px solid var(--color-border)' : 'none',
                    borderLeft: i < 3 ? `3px solid ${['#FFD700', '#C0C0C0', '#CD7F32'][i]}` : '3px solid transparent',
                  }}>
                    <span style={{ fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', fontWeight: 700, color: 'var(--color-text-muted)', flexShrink: 0, width: 'clamp(20px, 4vw, 24px)', textAlign: 'center' }}>
                      {i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}
                    </span>

                    {eq?.logo_url ? (
                      <img src={eq.logo_url} alt={a.asc} style={{ width: 'clamp(32px, 7vw, 36px)', height: 'clamp(32px, 7vw, 36px)', borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{
                        width: 'clamp(32px, 7vw, 36px)', height: 'clamp(32px, 7vw, 36px)', borderRadius: 8, flexShrink: 0,
                        background: eq ? `linear-gradient(135deg, ${eq.couleur_principale}, ${eq.couleur_secondaire})` : 'var(--color-surface)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 'clamp(0.6rem, 1.5vw, 0.7rem)', fontWeight: 800, color: 'white',
                      }}>
                        {eq?.sigle || a.asc.charAt(0)}
                      </div>
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        ASC {a.asc}
                      </div>
                      <div style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)', color: 'var(--color-text-muted)' }}>
                        {a.membres} membres
                      </div>
                    </div>

                    <div style={{
                      background: 'rgba(0,98,51,0.08)', borderRadius: 8, padding: 'clamp(4px, 1vw, 6px) clamp(8px, 2vw, 10px)',
                      fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', color: 'var(--color-primary)',
                      flexShrink: 0,
                    }}>
                      {a.points}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
