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
    images: [
      {
        url: 'https://navestats.site/og-statistiques.jpg',
        width: 1200,
        height: 630,
        alt: 'NavéStats - Poules & Statistiques',
      },
    ],
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Poules & Statistiques – Navétanes Khombole',
    description: 'Classements et statistiques des Navétanes de Khombole',
    images: ['https://navestats.site/og-statistiques.jpg'],
  },
}

interface Team {
  id: string
  nom: string
  sigle: string | null
  poule: 'A' | 'B' | 'C' | null
  couleur_principale: string
  couleur_secondaire: string
  logo_url: string | null
  quartier: string | null
  asc_nom: string | null
  matchs_joues: number
  victoires: number
  defaites: number
  nuls: number
  buts_marques: number
  buts_encaisses: number
  points_classement: number
}

interface TopButeur {
  id: string
  prenom: string
  nom: string
  buts: number
  equipe: Pick<Team, 'nom' | 'couleur_principale' | 'couleur_secondaire' | 'sigle' | 'logo_url'> | null
}

export default async function StatistiquesPage() {
  const supabase = await createClient()

  const { data: equipes } = await supabase
    .from('equipes')
    .select('*')
    .order('points_classement', { ascending: false })
    .order('buts_marques', { ascending: false })

  const { data: rawButeurs } = await supabase
    .from('joueurs')
    .select('*, equipe:equipes(nom, couleur_principale, couleur_secondaire, sigle, logo_url)')
    .order('buts', { ascending: false })
    .gt('buts', 0)
    .limit(10)

  const topButeurs = (rawButeurs || []) as TopButeur[]

  const teams = (equipes || []) as Team[]
  const pouleA = teams.filter(t => t.poule === 'A')
  const pouleB = teams.filter(t => t.poule === 'B')
  const pouleC = teams.filter(t => t.poule === 'C')

  const poules = [
    { name: 'Poule A', teams: pouleA, color: '#006233', bg: 'rgba(0,98,51,0.05)' },
    { name: 'Poule B', teams: pouleB, color: '#1E40AF', bg: 'rgba(30,64,175,0.05)' },
    { name: 'Poule C', teams: pouleC, color: '#B91C1C', bg: 'rgba(185,28,28,0.05)' },
  ]

  const meilleureAttaque = [...teams].sort((a, b) => b.buts_marques - a.buts_marques)[0]
  const meilleureDefense = [...teams].sort((a, b) => a.buts_encaisses - b.buts_encaisses)[0]
  const meilleureForme = [...teams].sort((a, b) => {
    const pctA = a.matchs_joues > 0 ? a.victoires / a.matchs_joues : 0
    const pctB = b.matchs_joues > 0 ? b.victoires / b.matchs_joues : 0
    return pctB - pctA
  })[0]
  const cleanSheets = teams.filter(t => t.matchs_joues > 0 && t.buts_encaisses === 0).length

  function StandingsTable({ pouleTeams, color, bg }: { pouleTeams: Team[]; color: string; bg: string }) {
    return (
      <div className="card" style={{ overflow: 'hidden', marginBottom: 28, borderTop: `4px solid ${color}`, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <div className="desktop-table-only">
          <div className="table-scroll">
            <table className="data-table" style={{ minWidth: 620 }}>
              <thead>
                <tr style={{ background: bg }}>
                  <th style={{ color: color, fontWeight: 800, width: 50, fontFamily: 'var(--font-outfit)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>#</th>
                  <th style={{ color: color, fontWeight: 800, fontFamily: 'var(--font-outfit)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Équipe</th>
                  <th style={{ textAlign: 'center', width: 45, fontFamily: 'var(--font-outfit)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>MJ</th>
                  <th style={{ textAlign: 'center', width: 45, fontFamily: 'var(--font-outfit)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)' }}>V</th>
                  <th style={{ textAlign: 'center', width: 45, fontFamily: 'var(--font-outfit)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#D97706' }}>N</th>
                  <th style={{ textAlign: 'center', width: 45, fontFamily: 'var(--font-outfit)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-red)' }}>D</th>
                  <th style={{ textAlign: 'center', width: 55, fontFamily: 'var(--font-outfit)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Diff</th>
                  <th style={{ textAlign: 'center', width: 55, fontFamily: 'var(--font-outfit)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: color }}>Pts</th>
                </tr>
              </thead>
              <tbody>
                {pouleTeams.map((eq, i) => {
                  const diff = eq.buts_marques - eq.buts_encaisses
                  const isQualifie = eq.poule === 'A' ? i < 2 : i < 3

                  return (
                    <tr key={eq.id} style={{
                      position: 'relative',
                      borderLeft: isQualifie ? '4px solid #00A651' : '4px solid transparent',
                      background: isQualifie ? 'rgba(0,166,81,0.01)' : 'transparent',
                    }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                          <span style={{ fontWeight: 700, color: isQualifie ? '#00A651' : 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                            {i + 1}
                          </span>
                          {isQualifie && (
                            <span title="Qualifié" style={{ width: 6, height: 6, borderRadius: '50%', background: '#00A651' }} />
                          )}
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
                            }}>
                              {eq.sigle || eq.nom.charAt(0)}
                            </div>
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
                      <td style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: diff > 0 ? 'var(--color-primary)' : diff < 0 ? 'var(--color-red)' : 'var(--color-text-secondary)' }}>
                        {diff > 0 ? `+${diff}` : diff}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="stat-number" style={{ fontSize: '1rem', fontWeight: 800, color: color, fontFamily: 'var(--font-outfit)' }}>{eq.points_classement}</span>
                      </td>
                    </tr>
                  )
                })}
                {pouleTeams.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                      Aucune équipe dans cette poule
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mobile-table-cards" style={{ background: bg }}>
          {pouleTeams.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              Aucune équipe dans cette poule
            </div>
          ) : pouleTeams.map((eq, i) => {
            const diff = eq.buts_marques - eq.buts_encaisses
            const isQualifie = eq.poule === 'A' ? i < 2 : i < 3
            const stats = [
              { label: 'MJ', value: eq.matchs_joues, valueColor: 'var(--color-text-secondary)' },
              { label: 'V', value: eq.victoires, valueColor: 'var(--color-primary)' },
              { label: 'N', value: eq.nuls, valueColor: '#D97706' },
              { label: 'D', value: eq.defaites, valueColor: 'var(--color-red)' },
              { label: 'Diff', value: diff > 0 ? `+${diff}` : diff, valueColor: diff > 0 ? 'var(--color-primary)' : diff < 0 ? 'var(--color-red)' : 'var(--color-text-secondary)' },
              { label: 'Pts', value: eq.points_classement, valueColor: color },
            ]

            return (
              <div key={eq.id} style={{
                background: 'var(--color-surface-card)',
                border: '1px solid var(--color-border)',
                borderLeft: isQualifie ? '4px solid #00A651' : '4px solid transparent',
                borderRadius: 12,
                padding: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <span style={{ fontWeight: 800, color: isQualifie ? '#00A651' : 'var(--color-text-muted)', fontSize: '0.9rem' }}>{i + 1}</span>
                    {isQualifie && <span title="Qualifié" style={{ width: 6, height: 6, borderRadius: '50%', background: '#00A651' }} />}
                  </div>

                  {eq.logo_url ? (
                    <img src={eq.logo_url} alt={eq.nom} style={{ width: 38, height: 38, borderRadius: 9, objectFit: 'cover', flexShrink: 0, boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }} />
                  ) : (
                    <div style={{
                      width: 38, height: 38, borderRadius: 9,
                      background: `linear-gradient(135deg, ${eq.couleur_principale || '#006233'}, ${eq.couleur_secondaire || '#FBBF00'})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.68rem', fontWeight: 800, color: 'white', flexShrink: 0,
                    }}>
                      {eq.sigle || eq.nom.charAt(0)}
                    </div>
                  )}

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-text-primary)', lineHeight: 1.15, overflowWrap: 'anywhere' }}>{eq.nom}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', lineHeight: 1.25, overflowWrap: 'anywhere' }}>{eq.asc_nom}</div>
                  </div>
                </div>

                <div className="mobile-stat-grid">
                  {stats.map(stat => (
                    <div key={stat.label} className="mobile-stat-cell">
                      <span className="mobile-stat-label">{stat.label}</span>
                      <span className="mobile-stat-value" style={{ color: stat.valueColor }}>{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="page-content">
      <div className="container-app">
        <div style={{ marginBottom: 32 }}>
          <h1 className="section-title" style={{ fontSize: '2rem', marginBottom: 4 }}>📊 Poules & Statistiques</h1>
          <p className="section-subtitle">Les classements officiels du tournoi et performances des joueurs</p>
        </div>

        <section className="stats-highlight-grid">
          {[
            {
              label: 'Meilleure attaque',
              value: meilleureAttaque ? `${meilleureAttaque.buts_marques} buts` : '—',
              detail: meilleureAttaque?.nom || 'Aucune donnée',
              icon: '⚡',
              color: '#006233',
            },
            {
              label: 'Meilleure défense',
              value: meilleureDefense ? `${meilleureDefense.buts_encaisses} encaissé(s)` : '—',
              detail: meilleureDefense?.nom || 'Aucune donnée',
              icon: '🧱',
              color: '#1D4ED8',
            },
            {
              label: 'Forme récente',
              value: meilleureForme && meilleureForme.matchs_joues > 0 ? `${Math.round((meilleureForme.victoires / meilleureForme.matchs_joues) * 100)}%` : '—',
              detail: meilleureForme?.nom || 'Aucune donnée',
              icon: '📈',
              color: '#B45309',
            },
            {
              label: 'Clean sheets',
              value: cleanSheets,
              detail: 'équipes invaincues défensivement',
              icon: '🧤',
              color: '#7C3AED',
            },
          ].map(item => (
            <article key={item.label} className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: `${item.color}14`, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                {item.icon}
              </div>
              <div style={{ minWidth: 0 }}>
                <span style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.label}</span>
                <strong style={{ display: 'block', color: item.color, fontFamily: 'var(--font-outfit)', fontSize: '1.2rem', lineHeight: 1.1 }}>{item.value}</strong>
                <small style={{ display: 'block', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.detail}</small>
              </div>
            </article>
          ))}
        </section>

        <div style={{ display: 'grid', gap: 32 }} className="stats-page-grid">
          {/* Poules de qualification */}
          <div>
            {poules.map(p => (
              <div key={p.name} style={{ marginBottom: 32 }}>
                <h2 className="section-title" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, color: p.color }}>
                  <span>🛡️</span> {p.name}
                </h2>
                <StandingsTable pouleTeams={p.teams} color={p.color} bg={p.bg} />
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Top Buteurs */}
            <div>
              <h2 className="section-title" style={{ marginBottom: 16 }}>⚽ Top Buteurs</h2>
              <div className="card" style={{ overflow: 'hidden' }}>
                {(!topButeurs || topButeurs.length === 0) ? (
                  <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 8 }}>⚽</div>
                    <p style={{ fontSize: '0.875rem' }}>Aucun buteur enregistré</p>
                  </div>
                ) : topButeurs.map((j, i) => (
                  <div key={j.id} style={{
                    padding: '12px 16px',
                    borderBottom: i < topButeurs.length - 1 ? '1px solid var(--color-border)' : 'none',
                    display: 'flex', alignItems: 'center', gap: 12,
                    transition: 'background 0.15s',
                  }}>
                    {/* Rank badge */}
                    <div style={{
                      width: 28, height: 28, borderRadius: 'var(--radius-full)',
                      background: i === 0 ? 'linear-gradient(135deg,#FFD700,#FFA500)' : i === 1 ? 'linear-gradient(135deg,#C0C0C0,#A0A0A0)' : i === 2 ? 'linear-gradient(135deg,#CD7F32,#A0522D)' : 'var(--color-surface)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: i < 3 ? '0.85rem' : '0.7rem', fontWeight: 700,
                      color: i < 3 ? (i === 1 ? '#2a2a2a' : i === 2 ? 'white' : '#5a3800') : 'var(--color-text-secondary)',
                      flexShrink: 0,
                      boxShadow: i < 3 ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                    }}>{i < 3 ? ['🥇','🥈','🥉'][i] : i + 1}</div>

                    {/* Team mini-logo */}
                    {j.equipe?.logo_url ? (
                      <img src={j.equipe.logo_url} alt={j.equipe.nom} style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{
                        width: 32, height: 32, borderRadius: 6,
                        background: `linear-gradient(135deg, ${j.equipe?.couleur_principale || '#006233'}, ${j.equipe?.couleur_secondaire || '#FBBF00'})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.6rem', fontWeight: 800, color: 'white', flexShrink: 0,
                      }}>{j.equipe?.sigle || '?'}</div>
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.prenom} {j.nom}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: 1 }}>{j.equipe?.nom}</div>
                    </div>

                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      background: 'rgba(0,98,51,0.08)', borderRadius: 8, padding: '4px 10px',
                    }}>
                      <span style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: '1.15rem', color: 'var(--color-primary)' }}>{j.buts}</span>
                      <span style={{ fontSize: '0.85rem' }}>⚽</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fiches équipes */}
            <div>
              <h2 className="section-title" style={{ marginBottom: 16 }}>🛡️ Fiches Équipes</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {teams.slice(0, 5).map(eq => {
                  const pctV = eq.matchs_joues > 0 ? Math.round((eq.victoires / eq.matchs_joues) * 100) : 0
                  const diff = eq.buts_marques - eq.buts_encaisses
                  return (
                    <div key={eq.id} className="card" style={{ padding: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        {eq.logo_url ? (
                          <img src={eq.logo_url} alt={eq.nom} style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                        ) : (
                          <div style={{
                            width: 48, height: 48, borderRadius: 'var(--radius-md)',
                            background: `linear-gradient(135deg, ${eq.couleur_principale || '#006233'}, ${eq.couleur_secondaire || '#FBBF00'})`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.9rem', fontWeight: 800, color: 'white', flexShrink: 0,
                          }}>{eq.sigle}</div>
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
                        <div style={{ width: `${pctV}%`, background: 'var(--color-primary-light)' }} />
                        <div style={{ width: `${eq.matchs_joues > 0 ? (eq.nuls / eq.matchs_joues) * 100 : 0}%`, background: '#FBBF00' }} />
                        <div style={{ width: `${eq.matchs_joues > 0 ? (eq.defaites / eq.matchs_joues) * 100 : 0}%`, background: 'var(--color-red)' }} />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                        <span>{eq.matchs_joues} matchs joués</span>
                        <span style={{ color: diff >= 0 ? 'var(--color-primary)' : 'var(--color-red)', fontWeight: 600 }}>
                          Diff : {diff >= 0 ? '+' : ''}{diff}
                        </span>
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
            gap: 14px;
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
        `}</style>
      </div>
    </div>
  )
}
