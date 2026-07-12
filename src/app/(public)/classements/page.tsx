import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Classements – NavéStats',
  description: 'Classement général, hebdomadaire, par quartier et par ASC des pronostiqueurs Navétanes Khombole',
}

export default async function ClassementsPage() {
  const supabase = await createClient()

  const { data: rawClassement } = await supabase
    .from('profiles')
    .select('*')
    .order('points', { ascending: false })
    .limit(50)
  
  const classementGeneral = (rawClassement || []) as any[]

  // Classement par quartier (aggrégé)
  const quartiersMap: Record<string, { points: number; membres: number }> = {}
  classementGeneral?.forEach(u => {
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
  const ascMap: Record<string, { points: number; membres: number }> = {}
  classementGeneral?.forEach(u => {
    if (u.asc_nom) {
      if (!ascMap[u.asc_nom]) ascMap[u.asc_nom] = { points: 0, membres: 0 }
      ascMap[u.asc_nom].points += u.points
      ascMap[u.asc_nom].membres++
    }
  })
  const classementASC = Object.entries(ascMap)
    .map(([asc, v]) => ({ asc, ...v }))
    .sort((a, b) => b.points - a.points)

  const tabs = ['Général', 'Quartier', 'ASC']

  const rankStyle = (i: number) => {
    if (i === 0) return { background: 'linear-gradient(135deg,#FFD700,#FFA500)', color: '#5a3800' }
    if (i === 1) return { background: 'linear-gradient(135deg,#C0C0C0,#A0A0A0)', color: '#2a2a2a' }
    if (i === 2) return { background: 'linear-gradient(135deg,#CD7F32,#A0522D)', color: 'white' }
    return { background: 'var(--color-surface)', color: 'var(--color-text-secondary)' }
  }

  return (
    <div className="page-content">
      <div className="container-app">
        {/* Header */}
        <div style={{
          background: 'var(--gradient-hero)',
          borderRadius: 'var(--radius-xl)',
          padding: 32,
          marginBottom: 32,
          textAlign: 'center',
        }}>
          <h1 style={{ color: 'white', fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontFamily: 'var(--font-outfit)', fontWeight: 900, marginBottom: 8 }}>
            🏆 Classements
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
            Général · Par Quartier · Par ASC
          </p>
        </div>

        <div style={{ display: 'grid', gap: 32 }} className="classements-grid">
          {/* Classement Général */}
          <div>
            <h2 className="section-title" style={{ marginBottom: 16 }}>👑 Classement Général</h2>
            <div className="card" style={{ overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 48 }}>#</th>
                    <th>Pronostiqueur</th>
                    <th style={{ textAlign: 'center' }}>Pts</th>
                    <th style={{ textAlign: 'center' }}>✓</th>
                    <th style={{ textAlign: 'center' }}>%</th>
                  </tr>
                </thead>
                <tbody>
                  {(classementGeneral || []).map((u, i) => {
                    const pct = u.total_pronostics > 0 ? Math.round((u.pronostics_corrects / u.total_pronostics) * 100) : 0
                    return (
                      <tr key={u.id}>
                        <td>
                          <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: i < 3 ? '0.9rem' : '0.75rem', ...rankStyle(i) }}>
                            {i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                              {u.avatar_url
                                ? <img src={u.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                : u.username.charAt(0).toUpperCase()
                              }
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{u.username}</div>
                              {u.quartier && <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{u.quartier}</div>}
                            </div>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="stat-number" style={{ fontSize: '0.95rem' }}>{u.points}</span>
                        </td>
                        <td style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                          {u.pronostics_corrects}/{u.total_pronostics}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: pct >= 60 ? 'var(--color-primary)' : pct >= 40 ? '#D97706' : 'var(--color-red)' }}>
                            {pct}%
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                  {(!classementGeneral || classementGeneral.length === 0) && (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
                      Aucun pronostiqueur pour l'instant
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Classements latéraux */}
          <div style={{ display: 'grid', gap: 24 }}>
            {/* Par Quartier */}
            <div>
              <h2 className="section-title" style={{ marginBottom: 16 }}>🏘️ Par Quartier</h2>
              <div className="card" style={{ overflow: 'hidden' }}>
                <table className="data-table">
                  <thead>
                    <tr><th>#</th><th>Quartier</th><th style={{ textAlign: 'center' }}>Membres</th><th style={{ textAlign: 'center' }}>Pts</th></tr>
                  </thead>
                  <tbody>
                    {classementQuartier.length === 0 ? (
                      <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32, color: 'var(--color-text-muted)' }}>Aucune donnée</td></tr>
                    ) : classementQuartier.map((q, i) => (
                      <tr key={q.quartier}>
                        <td>
                          <div style={{ width: 24, height: 24, borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: i < 3 ? '0.85rem' : '0.7rem', fontWeight: 700, ...rankStyle(i) }}>
                            {i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}
                          </div>
                        </td>
                        <td style={{ fontWeight: 600, fontSize: '0.875rem' }}>🏘️ {q.quartier}</td>
                        <td style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>{q.membres}</td>
                        <td style={{ textAlign: 'center' }}><span className="stat-number">{q.points}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Par ASC */}
            <div>
              <h2 className="section-title" style={{ marginBottom: 16 }}>🛡️ Par ASC</h2>
              <div className="card" style={{ overflow: 'hidden' }}>
                <table className="data-table">
                  <thead>
                    <tr><th>#</th><th>ASC</th><th style={{ textAlign: 'center' }}>Membres</th><th style={{ textAlign: 'center' }}>Pts</th></tr>
                  </thead>
                  <tbody>
                    {classementASC.length === 0 ? (
                      <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32, color: 'var(--color-text-muted)' }}>Aucune donnée</td></tr>
                    ) : classementASC.map((a, i) => (
                      <tr key={a.asc}>
                        <td>
                          <div style={{ width: 24, height: 24, borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: i < 3 ? '0.85rem' : '0.7rem', fontWeight: 700, ...rankStyle(i) }}>
                            {i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}
                          </div>
                        </td>
                        <td style={{ fontWeight: 600, fontSize: '0.875rem' }}>🛡️ {a.asc}</td>
                        <td style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>{a.membres}</td>
                        <td style={{ textAlign: 'center' }}><span className="stat-number">{a.points}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @media (min-width: 1024px) {
            .classements-grid { grid-template-columns: 2fr 1fr !important; }
          }
        `}</style>
      </div>
    </div>
  )
}
