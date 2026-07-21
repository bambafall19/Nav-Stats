import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Poules & Statistiques – Navétanes Khombole 2026 | NavéStats',
  description: 'Classements officiels des Poules A, B, C, statistiques des joueurs, top buteurs et performances des équipes des Navétanes de Khombole saison 2026.',
  openGraph: {
    title: 'Poules & Statistiques – Navétanes Khombole 2026',
    description: 'Consultez les classements des poules et statistiques des équipes et joueurs',
    url: 'https://navestats.site/statistiques',
    siteName: 'NavéStats',
    images: [{ url: 'https://navestats.site/og-statistiques.jpg', width: 1200, height: 630, alt: 'NavéStats - Poules & Statistiques' }],
    type: 'website', locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Poules & Statistiques – Navétanes Khombole',
    description: 'Classements et statistiques des Navétanes de Khombole',
    images: ['https://navestats.site/og-statistiques.jpg'],
  },
}

interface Team {
  id: string; nom: string; sigle: string | null
  poule: 'A' | 'B' | 'C' | null
  couleur_principale: string; couleur_secondaire: string
  logo_url: string | null; quartier: string | null; asc_nom: string | null
  matchs_joues: number; victoires: number; defaites: number; nuls: number
  buts_marques: number; buts_encaisses: number; points_classement: number
}

interface Player {
  id: string; prenom: string; nom: string; buts: number; passes_decisives: number
  cartons_jaunes: number; cartons_rouges: number; matchs_joues: number
  equipe: Pick<Team, 'nom' | 'couleur_principale' | 'couleur_secondaire' | 'sigle' | 'logo_url'> | null
}

interface Match {
  id: string; equipe_a_id: string; equipe_b_id: string
  score_a: number | null; score_b: number | null; statut: string
  date_match: string; heure_match: string | null
  equipe_a: Team | null; equipe_b: Team | null
}

function StandingsTable({ pouleTeams, color, bg }: { pouleTeams: Team[]; color: string; bg: string }) {
  return (
    <div className="card" style={{ overflow: 'hidden', marginBottom: 28, borderTop: `4px solid ${color}`, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
      <div className="desktop-table-only">
        <div className="table-scroll">
          <table className="data-table" style={{ minWidth: 680 }}>
            <thead>
              <tr style={{ background: bg }}>
                <th style={{ color, fontWeight: 800, width: 50, fontFamily: 'var(--font-outfit)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>#</th>
                <th style={{ color, fontWeight: 800, fontFamily: 'var(--font-outfit)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Équipe</th>
                <th style={{ textAlign: 'center', width: 40, fontFamily: 'var(--font-outfit)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>MJ</th>
                <th style={{ textAlign: 'center', width: 40, fontFamily: 'var(--font-outfit)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)' }}>V</th>
                <th style={{ textAlign: 'center', width: 40, fontFamily: 'var(--font-outfit)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#D97706' }}>N</th>
                <th style={{ textAlign: 'center', width: 40, fontFamily: 'var(--font-outfit)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-red)' }}>D</th>
                <th style={{ textAlign: 'center', width: 45, fontFamily: 'var(--font-outfit)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>BP</th>
                <th style={{ textAlign: 'center', width: 45, fontFamily: 'var(--font-outfit)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>BC</th>
                <th style={{ textAlign: 'center', width: 48, fontFamily: 'var(--font-outfit)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Diff</th>
                <th style={{ textAlign: 'center', width: 50, fontFamily: 'var(--font-outfit)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color }}>Pts</th>
              </tr>
            </thead>
            <tbody>
              {pouleTeams.map((eq, i) => {
                const diff = eq.buts_marques - eq.buts_encaisses
                const isQualifie = eq.poule === 'A' ? i < 2 : i < 3
                return (
                  <tr key={eq.id} style={{
                    borderLeft: isQualifie ? '4px solid #00A651' : '4px solid transparent',
                    background: isQualifie ? 'rgba(0,166,81,0.01)' : 'transparent',
                  }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                        <span style={{ fontWeight: 700, color: isQualifie ? '#00A651' : 'var(--color-text-muted)', fontSize: '0.85rem' }}>{i + 1}</span>
                        {isQualifie && <span title="Qualifié" style={{ width: 6, height: 6, borderRadius: '50%', background: '#00A651' }} />}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {eq.logo_url ? (
                          <img src={eq.logo_url} alt={eq.nom} style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', flexShrink: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                        ) : (
                          <div style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: `linear-gradient(135deg, ${eq.couleur_principale || '#006233'}, ${eq.couleur_secondaire || '#FBBF00'})`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.65rem', fontWeight: 800, color: 'white', flexShrink: 0,
                          }}>{eq.sigle || eq.nom.charAt(0)}</div>
                        )}
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>{eq.nom}</div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>{eq.asc_nom}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>{eq.matchs_joues}</td>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--color-primary)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>{eq.victoires}</td>
                    <td style={{ textAlign: 'center', color: '#D97706', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>{eq.nuls}</td>
                    <td style={{ textAlign: 'center', color: 'var(--color-red)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>{eq.defaites}</td>
                    <td style={{ textAlign: 'center', fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>{eq.buts_marques}</td>
                    <td style={{ textAlign: 'center', fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>{eq.buts_encaisses}</td>
                    <td style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: diff > 0 ? 'var(--color-primary)' : diff < 0 ? 'var(--color-red)' : 'var(--color-text-secondary)' }}>
                      {diff > 0 ? `+${diff}` : diff}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="stat-number" style={{ fontSize: '1rem', fontWeight: 800, color, fontFamily: 'var(--font-outfit)' }}>{eq.points_classement}</span>
                    </td>
                  </tr>
                )
              })}
              {pouleTeams.length === 0 && (
                <tr><td colSpan={10} style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Aucune équipe dans cette poule</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mobile-table-cards mobile-standings-wrap" style={{ background: bg }}>
        {pouleTeams.length === 0 ? (
          <div className="mobile-standings-empty">Aucune équipe dans cette poule</div>
        ) : (
          <table className="mobile-standings-table" aria-label="Classement de la poule">
            <colgroup>
              <col className="mobile-col-rank" />
              <col />
              <col className="mobile-col-stat" />
              <col className="mobile-col-diff" />
              <col className="mobile-col-points" />
            </colgroup>
            <thead>
              <tr>
                <th scope="col" aria-label="Position">#</th>
                <th scope="col">Équipe</th>
                <th scope="col">MJ</th>
                <th scope="col">Diff</th>
                <th scope="col" style={{ color }}>Pts</th>
              </tr>
            </thead>
            <tbody>
              {pouleTeams.map((eq, i) => {
                const diff = eq.buts_marques - eq.buts_encaisses
                const isQualifie = eq.poule === 'A' ? i < 2 : i < 3

                return (
                  <tr key={eq.id} className={isQualifie ? 'is-qualified' : undefined}>
                    <td className="mobile-rank-cell">
                      <span style={{ color: isQualifie ? '#00A651' : 'var(--color-text-muted)' }}>{i + 1}</span>
                      {isQualifie && <span className="qualification-dot" title="Qualifié" aria-label="Qualifié" />}
                    </td>
                    <th scope="row" className="mobile-team-cell">
                      {eq.logo_url ? (
                        <img src={eq.logo_url} alt="" className="mobile-team-logo" />
                      ) : (
                        <span
                          className="mobile-team-logo mobile-team-logo-fallback"
                          style={{ background: `linear-gradient(135deg, ${eq.couleur_principale || '#006233'}, ${eq.couleur_secondaire || '#FBBF00'})` }}
                        >
                          {eq.sigle || eq.nom.charAt(0)}
                        </span>
                      )}
                      <span className="mobile-team-name">{eq.nom}</span>
                    </th>
                    <td>{eq.matchs_joues}</td>
                    <td className={diff > 0 ? 'positive' : diff < 0 ? 'negative' : undefined}>
                      {diff > 0 ? `+${diff}` : diff}
                    </td>
                    <td className="mobile-points-cell" style={{ color }}>{eq.points_classement}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'

export default async function StatistiquesPage() {
  const supabase = await createClient()

  // Fetch teams
  const { data: equipesRaw } = await supabase
    .from('equipes')
    .select('*')
    .order('points_classement', { ascending: false })
    .order('buts_marques', { ascending: false })
  const teams = (equipesRaw || []) as Team[]

  // Fetch top scorers
  const { data: rawButeurs } = await supabase
    .from('joueurs')
    .select('*, equipe:equipes(nom, couleur_principale, couleur_secondaire, sigle, logo_url)')
    .order('buts', { ascending: false })
    .gt('buts', 0)
    .limit(10)
  const topButeurs = (rawButeurs || []) as Player[]

  // Fetch top assists
  const { data: rawPasseurs } = await supabase
    .from('joueurs')
    .select('*, equipe:equipes(nom, couleur_principale, couleur_secondaire, sigle, logo_url)')
    .order('passes_decisives', { ascending: false })
    .gt('passes_decisives', 0)
    .limit(10)
  const topPasseurs = (rawPasseurs || []) as Player[]

  // Fetch recent matches (terminés)
  const { data: rawMatchs } = await supabase
    .from('matchs')
    .select('*, equipe_a:equipes!matchs_equipe_a_id_fkey(*), equipe_b:equipes!matchs_equipe_b_id_fkey(*)')
    .eq('statut', 'termine')
    .order('date_match', { ascending: false })
    .limit(20)
  const matchsTermines = (rawMatchs || []) as Match[]

  // Fetch upcoming matches
  const { data: rawUpcoming } = await supabase
    .from('matchs')
    .select('*, equipe_a:equipes!matchs_equipe_a_id_fkey(*), equipe_b:equipes!matchs_equipe_b_id_fkey(*)')
    .in('statut', ['a_venir', 'en_cours'])
    .order('date_match', { ascending: true })
    .limit(10)
  const matchsAVenir = (rawUpcoming || []) as Match[]

  // Poules
  const pouleA = teams.filter(t => t.poule === 'A')
  const pouleB = teams.filter(t => t.poule === 'B')
  const pouleC = teams.filter(t => t.poule === 'C')
  const poules = [
    { name: 'Poule A', teams: pouleA, color: '#006233', bg: 'rgba(0,98,51,0.05)' },
    { name: 'Poule B', teams: pouleB, color: '#1E40AF', bg: 'rgba(30,64,175,0.05)' },
    { name: 'Poule C', teams: pouleC, color: '#B91C1C', bg: 'rgba(185,28,28,0.05)' },
  ]

  // Stats globales
  const totalMatchsJoues = teams.reduce((acc, t) => acc + (t.matchs_joues || 0), 0) / 2
  const totalButs = teams.reduce((acc, t) => acc + (t.buts_marques || 0), 0)
  const moyenneButsParMatch = totalMatchsJoues > 0 ? (totalButs / totalMatchsJoues).toFixed(1) : '0'
  const meilleureAttaque = [...teams].sort((a, b) => b.buts_marques - a.buts_marques)[0]
  const meilleureDefense = [...teams].sort((a, b) => a.buts_encaisses - b.buts_encaisses)[0]
  const cleanSheetsTeams = teams.filter(t => t.matchs_joues > 0 && t.buts_encaisses === 0)
  const plusLargeVictoire = matchsTermines.reduce((best, m) => {
    const diff = Math.abs((m.score_a || 0) - (m.score_b || 0))
    return diff > (best.diff || 0) ? { match: m, diff } : best
  }, { match: null as Match | null, diff: 0 })

  return (
    <div className="page-content">
      <div className="container-app">
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #004d27 0%, #006233 50%, #008a44 100%)',
          borderRadius: 24, padding: 'clamp(28px, 5vw, 40px)', marginBottom: 32,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -20, fontSize: 140, opacity: 0.04 }}>📊</div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{ color: 'white', fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: 'clamp(1.5rem, 4vw, 2rem)', marginBottom: 4 }}>
              📊 Poules & Statistiques
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem' }}>
              {teams.length} équipes · {totalMatchsJoues} matchs joués · {totalButs} buts marqués
            </p>
          </div>
        </div>

        {/* Stats Highlights */}
        <div className="stats-highlight-grid">
          {[
            { label: 'Matchs joués', value: totalMatchsJoues, icon: '⚽', color: '#006233' },
            { label: 'Buts marqués', value: totalButs, icon: '⚡', color: '#D97706' },
            { label: 'Moy. buts/match', value: moyenneButsParMatch, icon: '📈', color: '#1D4ED8' },
            { label: 'Meilleure attaque', value: meilleureAttaque ? `${meilleureAttaque.buts_marques} buts` : '—', detail: meilleureAttaque?.nom, icon: '🔥', color: '#E8002D' },
            { label: 'Meilleure défense', value: meilleureDefense ? `${meilleureDefense.buts_encaisses} encaissés` : '—', detail: meilleureDefense?.nom, icon: '🧱', color: '#1D4ED8' },
            { label: 'Clean sheets', value: cleanSheetsTeams.length, detail: 'équipes invaincues', icon: '🧤', color: '#7C3AED' },
            { label: 'Plus large victoire', value: plusLargeVictoire.match ? `${Math.abs((plusLargeVictoire.match.score_a || 0) - (plusLargeVictoire.match.score_b || 0))} buts d\'écart` : '—', icon: '💥', color: '#B45309' },
            { label: 'Top buteur', value: topButeurs[0] ? `${topButeurs[0].buts} buts` : '—', detail: topButeurs[0] ? `${topButeurs[0].prenom} ${topButeurs[0].nom}` : '—', icon: '🥇', color: '#006233' },
          ].map(item => (
            <article key={item.label} className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: `${item.color}14`, color: item.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem', flexShrink: 0
              }}>{item.icon}</div>
              <div style={{ minWidth: 0 }}>
                <span style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.label}</span>
                <strong style={{ display: 'block', color: item.color, fontFamily: 'var(--font-outfit)', fontSize: '1.1rem', lineHeight: 1.1 }}>{item.value}</strong>
                {item.detail && <small style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: '0.7rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.detail}</small>}
              </div>
            </article>
          ))}
        </div>

        {/* Poules & Sidebar */}
        <div style={{ display: 'grid', gap: 32 }} className="stats-page-grid">
          {/* Poules */}
          <div>
            {poules.map(p => (
              <div key={p.name} style={{ marginBottom: 32 }}>
                <h2 style={{
                  fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: '1.1rem',
                  marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, color: p.color,
                }}>
                  <span>🛡️</span> {p.name}
                </h2>
                <StandingsTable pouleTeams={p.teams} color={p.color} bg={p.bg} />
              </div>
            ))}

            {/* Derniers résultats */}
            {matchsTermines.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: '1.1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  📋 Derniers Résultats
                </h2>
                <div className="card" style={{ overflow: 'hidden' }}>
                  {matchsTermines.slice(0, 8).map((m, i) => (
                    <div key={m.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 16px',
                      borderBottom: i < Math.min(matchsTermines.length, 8) - 1 ? '1px solid var(--color-border)' : 'none',
                    }}>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem', textAlign: 'right' }}>{m.equipe_a?.nom}</span>
                        {m.equipe_a?.logo_url ? (
                          <img src={m.equipe_a.logo_url} alt="" style={{ width: 24, height: 24, borderRadius: 4, objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: 24, height: 24, borderRadius: 4, background: 'var(--gradient-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', color: 'white', fontWeight: 800 }}>
                            {m.equipe_a?.sigle || '?'}
                          </div>
                        )}
                      </div>
                      <div style={{
                        background: 'var(--color-surface)', borderRadius: 8, padding: '6px 14px',
                        fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: '1rem',
                        color: 'var(--color-primary)', display: 'flex', gap: 8,
                      }}>
                        <span>{m.score_a ?? '-'}</span>
                        <span style={{ color: 'var(--color-text-muted)' }}>:</span>
                        <span>{m.score_b ?? '-'}</span>
                      </div>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                        {m.equipe_b?.logo_url ? (
                          <img src={m.equipe_b.logo_url} alt="" style={{ width: 24, height: 24, borderRadius: 4, objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: 24, height: 24, borderRadius: 4, background: 'var(--gradient-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', color: 'white', fontWeight: 800 }}>
                            {m.equipe_b?.sigle || '?'}
                          </div>
                        )}
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{m.equipe_b?.nom}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prochains matchs */}
            {matchsAVenir.length > 0 && (
              <div>
                <h2 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: '1.1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  ⏳ Prochains Matchs
                </h2>
                <div className="card" style={{ overflow: 'hidden' }}>
                  {matchsAVenir.map((m, i) => (
                    <div key={m.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                      borderBottom: i < matchsAVenir.length - 1 ? '1px solid var(--color-border)' : 'none',
                    }}>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem', textAlign: 'right' }}>{m.equipe_a?.nom}</span>
                        {m.equipe_a?.logo_url ? (
                          <img src={m.equipe_a.logo_url} alt="" style={{ width: 24, height: 24, borderRadius: 4, objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: 24, height: 24, borderRadius: 4, background: 'var(--gradient-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', color: 'white', fontWeight: 800 }}>
                            {m.equipe_a?.sigle || '?'}
                          </div>
                        )}
                      </div>
                      <div style={{
                        background: 'var(--color-surface)', borderRadius: 8, padding: '4px 10px',
                        fontSize: '0.7rem', color: 'var(--color-text-muted)', textAlign: 'center', minWidth: 80,
                      }}>
                        VS
                      </div>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                        {m.equipe_b?.logo_url ? (
                          <img src={m.equipe_b.logo_url} alt="" style={{ width: 24, height: 24, borderRadius: 4, objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: 24, height: 24, borderRadius: 4, background: 'var(--gradient-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', color: 'white', fontWeight: 800 }}>
                            {m.equipe_b?.sigle || '?'}
                          </div>
                        )}
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{m.equipe_b?.nom}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Top Buteurs */}
            <div>
              <h2 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: '1.1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                ⚽ Top Buteurs
              </h2>
              <div className="card" style={{ overflow: 'hidden' }}>
                {(!topButeurs || topButeurs.length === 0) ? (
                  <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 8 }}>⚽</div>
                    <p style={{ fontSize: '0.875rem' }}>Aucun buteur enregistré</p>
                  </div>
                ) : topButeurs.map((j, i) => (
                  <div key={j.id} style={{
                    padding: '10px 14px',
                    borderBottom: i < topButeurs.length - 1 ? '1px solid var(--color-border)' : 'none',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%',
                      background: i === 0 ? 'linear-gradient(135deg,#FFD700,#FFA500)' : i === 1 ? 'linear-gradient(135deg,#C0C0C0,#A0A0A0)' : i === 2 ? 'linear-gradient(135deg,#CD7F32,#A0522D)' : 'var(--color-surface)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: i < 3 ? '0.8rem' : '0.65rem', fontWeight: 700,
                      color: i < 3 ? (i === 1 ? '#2a2a2a' : i === 2 ? 'white' : '#5a3800') : 'var(--color-text-secondary)',
                      flexShrink: 0,
                    }}>{i < 3 ? ['🥇','🥈','🥉'][i] : i + 1}</div>
                    {j.equipe?.logo_url ? (
                      <img src={j.equipe.logo_url} alt={j.equipe.nom} style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: `linear-gradient(135deg, ${j.equipe?.couleur_principale || '#006233'}, ${j.equipe?.couleur_secondaire || '#FBBF00'})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 800, color: 'white', flexShrink: 0 }}>{j.equipe?.sigle || '?'}</div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.prenom} {j.nom}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>{j.equipe?.nom}</div>
                    </div>
                    <div style={{ background: 'rgba(0,98,51,0.08)', borderRadius: 8, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <span style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: '1rem', color: 'var(--color-primary)' }}>{j.buts}</span>
                      <span style={{ fontSize: '0.75rem' }}>⚽</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Passeurs */}
            {topPasseurs.length > 0 && (
              <div>
                <h2 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: '1.1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  🎯 Top Passeurs
                </h2>
                <div className="card" style={{ overflow: 'hidden' }}>
                  {topPasseurs.map((j, i) => (
                    <div key={j.id} style={{
                      padding: '10px 14px',
                      borderBottom: i < topPasseurs.length - 1 ? '1px solid var(--color-border)' : 'none',
                      display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: '50%',
                        background: i < 3 ? ['linear-gradient(135deg,#FFD700,#FFA500)','linear-gradient(135deg,#C0C0C0,#A0A0A0)','linear-gradient(135deg,#CD7F32,#A0522D)'][i] : 'var(--color-surface)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: i < 3 ? '0.8rem' : '0.65rem', fontWeight: 700, flexShrink: 0,
                      }}>{i < 3 ? ['🥇','🥈','🥉'][i] : i + 1}</div>
                      {j.equipe?.logo_url ? (
                        <img src={j.equipe.logo_url} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: `linear-gradient(135deg, ${j.equipe?.couleur_principale || '#006233'}, ${j.equipe?.couleur_secondaire || '#FBBF00'})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 800, color: 'white', flexShrink: 0 }}>{j.equipe?.sigle || '?'}</div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.prenom} {j.nom}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>{j.equipe?.nom}</div>
                      </div>
                      <div style={{ background: 'rgba(30,64,175,0.08)', borderRadius: 8, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <span style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: '1rem', color: '#1D4ED8' }}>{j.passes_decisives}</span>
                        <span style={{ fontSize: '0.75rem' }}>🎯</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fiches Équipes */}
            <div>
              <h2 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: '1.1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                🛡️ Fiches Équipes
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {teams.slice(0, 5).map(eq => {
                  const pctV = eq.matchs_joues > 0 ? Math.round((eq.victoires / eq.matchs_joues) * 100) : 0
                  const pctN = eq.matchs_joues > 0 ? Math.round((eq.nuls / eq.matchs_joues) * 100) : 0
                  const pctD = eq.matchs_joues > 0 ? Math.round((eq.defaites / eq.matchs_joues) * 100) : 0
                  const diff = eq.buts_marques - eq.buts_encaisses
                  return (
                    <div key={eq.id} className="card" style={{ padding: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        {eq.logo_url ? (
                          <img src={eq.logo_url} alt={eq.nom} style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                        ) : (
                          <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: `linear-gradient(135deg, ${eq.couleur_principale || '#006233'}, ${eq.couleur_secondaire || '#FBBF00'})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 800, color: 'white', flexShrink: 0 }}>{eq.sigle}</div>
                        )}
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{eq.nom}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{eq.asc_nom} · Poule {eq.poule}</div>
                        </div>
                        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '1.3rem', color: 'var(--color-primary)' }}>{eq.points_classement}</div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>points</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 2, height: 6, borderRadius: 'var(--radius-full)', overflow: 'hidden', marginBottom: 8 }}>
                        {pctV > 0 && <div style={{ width: `${pctV}%`, background: 'var(--color-primary-light)' }} />}
                        {pctN > 0 && <div style={{ width: `${pctN}%`, background: '#FBBF00' }} />}
                        {pctD > 0 && <div style={{ width: `${pctD}%`, background: 'var(--color-red)' }} />}
                      </div>
                      <div className="mobile-stat-grid" style={{ marginTop: 8 }}>
                        {[
                          { label: 'MJ', value: eq.matchs_joues },
                          { label: 'V', value: eq.victoires, c: '#006233' },
                          { label: 'N', value: eq.nuls, c: '#D97706' },
                          { label: 'D', value: eq.defaites, c: '#E8002D' },
                          { label: 'BP', value: eq.buts_marques },
                          { label: 'BC', value: eq.buts_encaisses },
                          { label: 'Diff', value: diff > 0 ? `+${diff}` : diff, c: diff >= 0 ? '#006233' : '#E8002D' },
                          { label: 'Pts', value: eq.points_classement, c: '#006233' },
                        ].map(s => (
                          <div key={s.label} className="mobile-stat-cell">
                            <span className="mobile-stat-label">{s.label}</span>
                            <span className="mobile-stat-value" style={{ color: s.c || 'var(--color-text-primary)' }}>{s.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <style>{`
          .stats-highlight-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 12px;
            margin-bottom: 28px;
          }
          @media (min-width: 1024px) {
            .stats-page-grid { grid-template-columns: 2fr 1fr !important; }
          }
          @media (max-width: 920px) {
            .stats-highlight-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          }
          @media (max-width: 560px) {
            .stats-highlight-grid { grid-template-columns: 1fr; }
          }
          @media (max-width: 640px) {
            .mobile-standings-wrap {
              display: block;
              padding: 0;
              overflow: hidden;
            }
            .mobile-standings-table {
              width: 100%;
              border-spacing: 0;
              border-collapse: separate;
              table-layout: fixed;
              background: var(--color-surface-card);
            }
            .mobile-standings-table .mobile-col-rank { width: 38px; }
            .mobile-standings-table .mobile-col-stat { width: 39px; }
            .mobile-standings-table .mobile-col-diff { width: 46px; }
            .mobile-standings-table .mobile-col-points { width: 43px; }
            .mobile-standings-table thead th {
              height: 36px;
              padding: 0 4px;
              border-bottom: 1px solid var(--color-border);
              color: var(--color-text-muted);
              font-family: var(--font-outfit);
              font-size: 0.62rem;
              font-weight: 800;
              letter-spacing: 0.04em;
              text-align: center;
              text-transform: uppercase;
            }
            .mobile-standings-table thead th:nth-child(2) {
              padding-left: 7px;
              text-align: left;
            }
            .mobile-standings-table tbody td,
            .mobile-standings-table tbody th {
              height: 54px;
              padding: 6px 4px;
              border-bottom: 1px solid var(--color-border);
              background: var(--color-surface-card);
              font-family: var(--font-mono), monospace;
              font-size: 0.8rem;
              font-weight: 700;
              text-align: center;
              vertical-align: middle;
            }
            .mobile-standings-table tbody tr:last-child td,
            .mobile-standings-table tbody tr:last-child th {
              border-bottom: 0;
            }
            .mobile-standings-table tbody tr.is-qualified td,
            .mobile-standings-table tbody tr.is-qualified th {
              background: rgba(0, 166, 81, 0.025);
            }
            .mobile-standings-table .mobile-rank-cell {
              padding-left: 7px;
              box-shadow: inset 3px 0 transparent;
              font-family: var(--font-outfit);
              font-size: 0.82rem;
              font-weight: 900;
              white-space: nowrap;
            }
            .mobile-standings-table tr.is-qualified .mobile-rank-cell {
              box-shadow: inset 3px 0 #00A651;
            }
            .qualification-dot {
              display: inline-block;
              width: 5px;
              height: 5px;
              margin-left: 3px;
              border-radius: 50%;
              background: #00A651;
              vertical-align: middle;
            }
            .mobile-standings-table .mobile-team-cell {
              padding-left: 7px;
              overflow: hidden;
              font-family: var(--font-outfit);
              text-align: left;
              white-space: nowrap;
            }
            .mobile-team-logo {
              display: inline-flex;
              width: 30px;
              height: 30px;
              margin-right: 7px;
              border-radius: 7px;
              object-fit: cover;
              box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
              vertical-align: middle;
            }
            .mobile-team-logo-fallback {
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 0.52rem;
              font-weight: 900;
            }
            .mobile-team-name {
              display: inline-block;
              max-width: calc(100% - 41px);
              overflow: hidden;
              color: var(--color-text-primary);
              font-size: 0.79rem;
              font-weight: 800;
              line-height: 1.1;
              text-overflow: ellipsis;
              vertical-align: middle;
            }
            .mobile-standings-table .positive { color: var(--color-primary); }
            .mobile-standings-table .negative { color: var(--color-red); }
            .mobile-standings-table .mobile-points-cell {
              font-family: var(--font-outfit);
              font-size: 0.95rem;
              font-weight: 900;
            }
            .mobile-standings-empty {
              padding: 24px 16px;
              color: var(--color-text-muted);
              font-size: 0.82rem;
              text-align: center;
            }
          }
        `}</style>
      </div>
    </div>
  )
}