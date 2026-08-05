import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { BarChart3, CalendarDays, ClipboardList, Shield, Target, Trophy, Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Senior – Navétanes Khombole 2026 | NavéStats',
  description: 'Classements officiels des Poules A, B, C, statistiques des joueurs, top buteurs et performances des équipes des Navétanes de Khombole saison 2026.',
  openGraph: {
    title: 'Senior – Navétanes Khombole 2026',
    description: 'Consultez les classements des poules et statistiques des équipes et joueurs',
    url: 'https://navestats.site/statistiques',
    siteName: 'NavéStats',
    images: [{ url: 'https://navestats.site/og-statistiques.jpg', width: 1200, height: 630, alt: 'NavéStats - Senior' }],
    type: 'website', locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Senior – Navétanes Khombole',
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

const MEDALS = ['🥇', '🥈', '🥉']

function formatMatchDate(date: string) {
  const d = new Date(`${date}T12:00:00`)
  return {
    day: d.toLocaleDateString('fr-FR', { day: 'numeric' }),
    month: d.toLocaleDateString('fr-FR', { month: 'short' }),
    full: d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }),
  }
}

type TeamLike = Pick<Team, 'nom' | 'couleur_principale' | 'couleur_secondaire' | 'sigle' | 'logo_url'>

function TeamLogo({ team, size = 32, radius = 'var(--radius-md)' }: { team: TeamLike | null; size?: number; radius?: string }) {
  if (team?.logo_url) {
    return (
      <img src={team.logo_url} alt={team.nom}
        style={{ width: size, height: size, borderRadius: radius, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--color-border-subtle)', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
      />
    )
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: radius, flexShrink: 0,
      background: `linear-gradient(135deg, ${team?.couleur_principale || '#0dca6b'}, ${team?.couleur_secondaire || '#ffc94d'})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.32, fontWeight: 900, color: 'white',
      fontFamily: 'var(--font-plus-jakarta)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    }}>
      {team?.sigle || team?.nom?.charAt(0) || '?'}
    </div>
  )
}

function SectionTitle({ icon, title, color, sub }: { icon: React.ReactNode; title: string; color: string; sub?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <div style={{
        width: 34, height: 34, borderRadius: 'var(--radius-md)', flexShrink: 0,
        background: `linear-gradient(135deg, ${color}, ${color}99)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', boxShadow: `0 4px 14px ${color}40`,
      }}>
        {icon}
      </div>
      <div>
        <h2 style={{
          fontFamily: 'var(--font-plus-jakarta)', fontWeight: 800, fontSize: '1.05rem',
          margin: 0, color: 'var(--color-text-primary)', letterSpacing: '-0.01em',
        }}>
          {title}
        </h2>
        {sub && <p style={{ margin: '1px 0 0', fontSize: '0.68rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{sub}</p>}
      </div>
    </div>
  )
}

function StandingsTable({ pouleTeams, color, bg, name }: { pouleTeams: Team[]; color: string; bg: string; name: string }) {
  const qualifiedCount = name === 'Poule A' ? 2 : 3
  const maxPoints = Math.max(...pouleTeams.map(t => t.points_classement || 0), 1)

  return (
    <div className="card" style={{ overflow: 'hidden', marginBottom: 28, borderTop: `4px solid ${color}`, boxShadow: 'var(--shadow-card)' }}>
      <div style={{
        padding: '12px 18px',
        background: `linear-gradient(90deg, ${color}14, transparent)`,
        borderBottom: '1px solid var(--color-border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 'var(--radius-sm)', flexShrink: 0,
            background: `linear-gradient(135deg, ${color}, ${color}bb)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: '0.95rem', color: 'white', fontFamily: 'var(--font-plus-jakarta)',
            boxShadow: `0 4px 12px ${color}40`,
          }}>
            {name.replace('Poule ', '')}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', fontFamily: 'var(--font-plus-jakarta)', color: 'var(--color-text-primary)' }}>{name}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
              {pouleTeams.length} équipe{pouleTeams.length > 1 ? 's' : ''} · Top {qualifiedCount} qualifié{pouleTeams.length > 1 ? 'es' : ''}
            </div>
          </div>
        </div>
        <span className="badge" style={{
          background: `${color}1f`, color, border: `1px solid ${color}40`,
          fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.6rem',
        }}>
          {pouleTeams.reduce((acc, t) => acc + (t.points_classement || 0), 0)} pts
        </span>
      </div>

      <div className="desktop-table-only">
        <div className="table-scroll">
          <table className="data-table standings-table" style={{ minWidth: 720 }}>
            <thead>
              <tr style={{ background: bg }}>
                <th style={{ color, fontWeight: 800, width: 52, fontFamily: 'var(--font-plus-jakarta)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>#</th>
                <th style={{ color, fontWeight: 800, fontFamily: 'var(--font-plus-jakarta)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Équipe</th>
                <th style={{ textAlign: 'center', width: 40, fontFamily: 'var(--font-plus-jakarta)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>MJ</th>
                <th style={{ textAlign: 'center', width: 42, fontFamily: 'var(--font-plus-jakarta)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>V</th>
                <th style={{ textAlign: 'center', width: 42, fontFamily: 'var(--font-plus-jakarta)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>N</th>
                <th style={{ textAlign: 'center', width: 42, fontFamily: 'var(--font-plus-jakarta)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>D</th>
                <th style={{ textAlign: 'center', width: 44, fontFamily: 'var(--font-plus-jakarta)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>BP</th>
                <th style={{ textAlign: 'center', width: 44, fontFamily: 'var(--font-plus-jakarta)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>BC</th>
                <th style={{ textAlign: 'center', width: 48, fontFamily: 'var(--font-plus-jakarta)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>Diff</th>
                <th style={{ textAlign: 'center', width: 52, fontFamily: 'var(--font-plus-jakarta)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color }}>Pts</th>
              </tr>
            </thead>
            <tbody>
              {pouleTeams.map((eq, i) => {
                const diff = eq.buts_marques - eq.buts_encaisses
                const isQualifie = i < qualifiedCount
                const isLeader = i === 0
                const barWidth = Math.round(((eq.points_classement || 0) / maxPoints) * 100)
                return (
                  <tr key={eq.id} className={`row-hover ${isLeader ? 'is-leader' : ''}`} style={{
                    borderLeft: isQualifie ? `4px solid ${color}` : '4px solid transparent',
                    background: isLeader ? 'rgba(255,201,77,0.03)' : isQualifie ? 'rgba(255,255,255,0.012)' : 'transparent',
                  }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                        {i < 3 ? (
                          <span style={{ fontSize: '0.95rem', lineHeight: 1 }}>{MEDALS[i]}</span>
                        ) : (
                          <span style={{
                            width: 24, height: 24, borderRadius: '50%',
                            background: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 800, fontSize: '0.72rem', color: 'var(--color-text-muted)',
                            fontFamily: 'var(--font-plus-jakarta)',
                          }}>{i + 1}</span>
                        )}
                        {isQualifie && <span title="Qualifié" style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <TeamLogo team={eq} size={34} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{eq.nom}</span>
                            {isLeader && (
                              <span style={{
                                fontSize: '0.5rem', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase',
                                color: '#2b1b00', background: 'var(--gradient-gold)', borderRadius: 999,
                                padding: '2px 7px', fontFamily: 'var(--font-plus-jakarta)', flexShrink: 0,
                              }}>Leader</span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)', marginTop: 1 }}>{eq.asc_nom || eq.quartier}</div>
                          <div className="progress-bar" style={{ height: 3, marginTop: 5, maxWidth: 140 }}>
                            <div className="progress-fill" style={{ width: `${barWidth}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)` }} />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>{eq.matchs_joues}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="standings-stat" style={{ background: 'rgba(42,255,160,0.08)', color: 'var(--color-primary)', border: '1px solid rgba(42,255,160,0.16)' }}>{eq.victoires}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="standings-stat" style={{ background: 'rgba(255,201,77,0.08)', color: 'var(--color-accent)', border: '1px solid rgba(255,201,77,0.18)' }}>{eq.nuls}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="standings-stat" style={{ background: 'rgba(255,77,90,0.08)', color: 'var(--color-red)', border: '1px solid rgba(255,77,90,0.18)' }}>{eq.defaites}</span>
                    </td>
                    <td style={{ textAlign: 'center', fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>{eq.buts_marques}</td>
                    <td style={{ textAlign: 'center', fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>{eq.buts_encaisses}</td>
                    <td style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: diff > 0 ? 'var(--color-primary)' : diff < 0 ? 'var(--color-red)' : 'var(--color-text-secondary)' }}>
                      {diff > 0 ? `+${diff}` : diff}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        minWidth: 34, padding: '5px 10px',
                        background: isLeader ? 'var(--gradient-gold)' : `${color}18`,
                        color: isLeader ? '#2b1b00' : color,
                        borderRadius: 'var(--radius-md)', fontWeight: 900, fontSize: '0.95rem',
                        fontFamily: 'var(--font-plus-jakarta)',
                        boxShadow: isLeader ? 'var(--shadow-gold)' : `inset 0 0 0 1px ${color}30`,
                      }}>
                        {eq.points_classement}
                      </span>
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
                const isQualifie = i < qualifiedCount
                const isLeader = i === 0

                return (
                  <tr key={eq.id} className={isQualifie ? 'is-qualified' : undefined}>
                    <td className="mobile-rank-cell" style={isQualifie ? { boxShadow: `inset 3px 0 ${color}` } : undefined}>
                      <span style={{ fontSize: i < 3 ? '0.85rem' : undefined }}>{i < 3 ? MEDALS[i] : i + 1}</span>
                      {isQualifie && <span className="qualification-dot" style={{ background: color, boxShadow: `0 0 5px ${color}` }} title="Qualifié" aria-label="Qualifié" />}
                    </td>
                    <th scope="row" className="mobile-team-cell">
                      {eq.logo_url ? (
                        <img src={eq.logo_url} alt="" className="mobile-team-logo" />
                      ) : (
                        <span
                          className="mobile-team-logo mobile-team-logo-fallback"
                          style={{ background: `linear-gradient(135deg, ${eq.couleur_principale || '#0dca6b'}, ${eq.couleur_secondaire || '#ffc94d'})` }}
                        >
                          {eq.sigle || eq.nom.charAt(0)}
                        </span>
                      )}
                      <span className="mobile-team-name">
                        {isLeader && <span style={{ fontSize: '0.7rem', marginRight: 3 }}>👑</span>}
                        {eq.nom}
                      </span>
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
    { name: 'Poule A', teams: pouleA, color: '#2affa0', bg: 'rgba(42,255,160,0.04)' },
    { name: 'Poule B', teams: pouleB, color: '#4da6ff', bg: 'rgba(77,166,255,0.04)' },
    { name: 'Poule C', teams: pouleC, color: '#ff4d5a', bg: 'rgba(255,77,90,0.04)' },
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
        <div className="hero-gradient" style={{
          borderRadius: 'var(--radius-xl)',
          padding: 'clamp(18px, 4vw, 28px)',
          marginBottom: 20,
          boxShadow: 'var(--shadow-green)',
          border: '1px solid rgba(42,255,160,0.14)',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -20, width: 160, height: 160, borderRadius: '50%', background: 'rgba(42,255,160,0.08)', filter: 'blur(20px)' }} />
          <div style={{ position: 'absolute', bottom: -48, left: -24, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,201,77,0.12)', filter: 'blur(24px)' }} />
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,201,77,0.12)',
              border: '1px solid rgba(255,201,77,0.3)',
              color: 'var(--color-accent)',
              fontSize: '0.62rem', fontWeight: 800,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              padding: '5px 14px', borderRadius: 'var(--radius-full)',
              fontFamily: 'var(--font-plus-jakarta)',
              marginBottom: 10,
            }}>
              <BarChart3 size={12} />
              Navétanes Khombole 2026
            </span>
            <h1 style={{
              color: 'white', fontFamily: 'var(--font-plus-jakarta)', fontWeight: 900,
              fontSize: 'clamp(1.3rem, 4vw, 1.9rem)', marginBottom: 4, letterSpacing: '-0.02em',
            }}>
              Senior
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'clamp(0.72rem, 2vw, 0.85rem)' }}>
              {teams.length} équipes · {totalMatchsJoues} matchs joués · {totalButs} buts marqués
            </p>
          </div>
        </div>

        {/* Stats Highlights */}
        <div className="stats-highlight-grid">
          {[
            { label: 'Matchs joués', value: totalMatchsJoues, icon: '⚽', color: '#2affa0' },
            { label: 'Buts marqués', value: totalButs, icon: '⚡', color: '#ffc94d' },
            { label: 'Moy. buts/match', value: moyenneButsParMatch, icon: '📈', color: '#4da6ff' },
            { label: 'Meilleure attaque', value: meilleureAttaque ? `${meilleureAttaque.buts_marques} buts` : '—', detail: meilleureAttaque?.nom, icon: '🔥', color: '#ff4d5a' },
            { label: 'Meilleure défense', value: meilleureDefense ? `${meilleureDefense.buts_encaisses} encaissés` : '—', detail: meilleureDefense?.nom, icon: '🧱', color: '#4da6ff' },
            { label: 'Clean sheets', value: cleanSheetsTeams.length, detail: 'équipes invaincues', icon: '🧤', color: '#ffc94d' },
            { label: 'Plus large victoire', value: plusLargeVictoire.match ? `${Math.abs((plusLargeVictoire.match.score_a || 0) - (plusLargeVictoire.match.score_b || 0))} buts d\'écart` : '—', icon: '💥', color: '#ffc94d' },
            { label: 'Top buteur', value: topButeurs[0] ? `${topButeurs[0].buts} buts` : '—', detail: topButeurs[0] ? `${topButeurs[0].prenom} ${topButeurs[0].nom}` : '—', icon: '🥇', color: '#2affa0' },
          ].map(item => (
            <article key={item.label} className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 'var(--radius-md)',
                background: `${item.color}16`,
                border: `1px solid ${item.color}30`,
                boxShadow: `0 4px 14px ${item.color}22`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', flexShrink: 0
              }}>{item.icon}</div>
              <div style={{ minWidth: 0 }}>
                <span style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.label}</span>
                <strong style={{ display: 'block', color: item.color, fontFamily: 'var(--font-plus-jakarta)', fontSize: '1.05rem', lineHeight: 1.15, textShadow: `0 0 18px ${item.color}30` }}>{item.value}</strong>
                {item.detail && <small style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: '0.68rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.detail}</small>}
              </div>
            </article>
          ))}
        </div>

        {/* Poules & Sidebar */}
        <div style={{ display: 'grid', gap: 32 }} className="stats-page-grid">
          {/* Poules */}
          <div>
            {poules.map(p => (
              <div key={p.name}>
                <SectionTitle icon={<Shield size={16} />} title={p.name} color={p.color} sub="Classement officiel de la poule" />
                <StandingsTable pouleTeams={p.teams} color={p.color} bg={p.bg} name={p.name} />
              </div>
            ))}

            {/* Derniers résultats */}
            {matchsTermines.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <SectionTitle icon={<ClipboardList size={16} />} title="Derniers Résultats" color="var(--color-primary)" sub="Les matchs terminés" />
                <div className="card" style={{ overflow: 'hidden' }}>
                  {matchsTermines.slice(0, 8).map((m, i) => {
                    const scoreA = m.score_a ?? 0
                    const scoreB = m.score_b ?? 0
                    const winA = scoreA > scoreB
                    const winB = scoreB > scoreA
                    const draw = scoreA === scoreB
                    const { day, month } = formatMatchDate(m.date_match)
                    return (
                      <div key={m.id} className="row-hover" style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 14px',
                        borderBottom: i < Math.min(matchsTermines.length, 8) - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                      }}>
                        <div style={{
                          width: 46, flexShrink: 0, textAlign: 'center',
                          background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)',
                          padding: '4px 2px', border: '1px solid var(--color-border-subtle)',
                        }}>
                          <div style={{ fontWeight: 900, fontSize: '0.82rem', fontFamily: 'var(--font-plus-jakarta)', color: 'var(--color-text-primary)', lineHeight: 1 }}>{day}</div>
                          <div style={{ fontSize: '0.55rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{month}</div>
                        </div>

                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                          <span style={{ fontWeight: winA ? 800 : 600, fontSize: '0.85rem', textAlign: 'right', color: winA ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>{m.equipe_a?.nom}</span>
                          <TeamLogo team={m.equipe_a} size={26} radius="var(--radius-sm)" />
                        </div>

                        <div style={{
                          background: draw ? 'var(--color-surface)' : 'var(--gradient-green)',
                          borderRadius: 'var(--radius-md)', padding: '5px 14px',
                          fontFamily: 'var(--font-plus-jakarta)', fontWeight: 900, fontSize: '0.95rem',
                          color: draw ? 'var(--color-text-secondary)' : 'var(--color-text-on-primary)',
                          display: 'flex', gap: 8, flexShrink: 0,
                          boxShadow: draw ? 'none' : 'var(--shadow-green)',
                        }}>
                          <span>{scoreA}</span>
                          <span style={{ opacity: 0.5 }}>:</span>
                          <span>{scoreB}</span>
                        </div>

                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <TeamLogo team={m.equipe_b} size={26} radius="var(--radius-sm)" />
                          <span style={{ fontWeight: winB ? 800 : 600, fontSize: '0.85rem', color: winB ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>{m.equipe_b?.nom}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Prochains matchs */}
            {matchsAVenir.length > 0 && (
              <div>
                <SectionTitle icon={<CalendarDays size={16} />} title="Prochains Matchs" color="var(--color-accent)" sub="Le programme à venir" />
                <div className="card" style={{ overflow: 'hidden' }}>
                  {matchsAVenir.map((m, i) => {
                    const { day, month } = formatMatchDate(m.date_match)
                    return (
                      <div key={m.id} className="row-hover" style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px',
                        borderBottom: i < matchsAVenir.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                      }}>
                        <div style={{
                          width: 46, flexShrink: 0, textAlign: 'center',
                          background: 'var(--color-accent-50)', borderRadius: 'var(--radius-sm)',
                          padding: '4px 2px', border: '1px solid rgba(255,201,77,0.22)',
                        }}>
                          <div style={{ fontWeight: 900, fontSize: '0.82rem', fontFamily: 'var(--font-plus-jakarta)', color: 'var(--color-accent)', lineHeight: 1 }}>{day}</div>
                          <div style={{ fontSize: '0.55rem', color: 'var(--color-accent-dark)', fontWeight: 700, textTransform: 'uppercase' }}>{month}</div>
                        </div>

                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem', textAlign: 'right' }}>{m.equipe_a?.nom}</span>
                          <TeamLogo team={m.equipe_a} size={26} radius="var(--radius-sm)" />
                        </div>

                        <div style={{
                          width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                          background: 'linear-gradient(135deg, #E8002D, #ff6b6b)',
                          color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.62rem', fontWeight: 900, fontFamily: 'var(--font-plus-jakarta)',
                          boxShadow: '0 3px 12px rgba(232,0,45,0.3)',
                        }}>
                          VS
                        </div>

                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <TeamLogo team={m.equipe_b} size={26} radius="var(--radius-sm)" />
                          <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{m.equipe_b?.nom}</span>
                        </div>

                        {m.heure_match && (
                          <span className="badge badge-gray" style={{ flexShrink: 0, fontSize: '0.6rem', fontFamily: 'var(--font-mono)' }}>
                            {m.heure_match}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Top Buteurs */}
            <div>
              <SectionTitle icon={<Target size={16} />} title="Top Buteurs" color="var(--color-primary)" sub="Classement des buteurs" />
              <div className="card" style={{ overflow: 'hidden' }}>
                {(!topButeurs || topButeurs.length === 0) ? (
                  <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 8 }}>⚽</div>
                    <p style={{ fontSize: '0.875rem' }}>Aucun buteur enregistré</p>
                  </div>
                ) : topButeurs.map((j, i) => (
                  <div key={j.id} className="row-hover" style={{
                    padding: '10px 14px',
                    borderBottom: i < topButeurs.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: i === 0 ? 'linear-gradient(135deg,#ffd97d,#f0a800)' : i === 1 ? 'linear-gradient(135deg,#c8d2d0,#8f9d99)' : i === 2 ? 'linear-gradient(135deg,#d97706,#92400e)' : 'var(--color-surface)',
                      border: i < 3 ? 'none' : '1px solid var(--color-border-subtle)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: i < 3 ? '0.82rem' : '0.65rem', fontWeight: 700,
                      color: i < 3 ? undefined : 'var(--color-text-secondary)',
                      boxShadow: i === 0 ? '0 2px 12px rgba(255,201,77,0.4)' : i < 3 ? '0 2px 12px rgba(0,0,0,0.25)' : 'none',
                      flexShrink: 0,
                    }}>{i < 3 ? MEDALS[i] : i + 1}</div>
                    <TeamLogo team={j.equipe} size={28} radius="var(--radius-sm)" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.prenom} {j.nom}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>{j.equipe?.nom}</div>
                    </div>
                    <div style={{ background: 'rgba(42,255,160,0.08)', border: '1px solid rgba(42,255,160,0.15)', borderRadius: 'var(--radius-md)', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                      <span style={{ fontFamily: 'var(--font-plus-jakarta)', fontWeight: 900, fontSize: '1rem', color: 'var(--color-primary)' }}>{j.buts}</span>
                      <span style={{ fontSize: '0.7rem' }}>⚽</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Passeurs */}
            {topPasseurs.length > 0 && (
              <div>
                <SectionTitle icon={<Zap size={16} />} title="Top Passeurs" color="var(--color-blue)" sub="Classement des passeurs décisifs" />
                <div className="card" style={{ overflow: 'hidden' }}>
                  {topPasseurs.map((j, i) => (
                    <div key={j.id} className="row-hover" style={{
                      padding: '10px 14px',
                      borderBottom: i < topPasseurs.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                      display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: i < 3 ? ['linear-gradient(135deg,#ffd97d,#f0a800)','linear-gradient(135deg,#c8d2d0,#8f9d99)','linear-gradient(135deg,#d97706,#92400e)'][i] : 'var(--color-surface)',
                        border: i < 3 ? 'none' : '1px solid var(--color-border-subtle)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: i < 3 ? '0.82rem' : '0.65rem', fontWeight: 700, flexShrink: 0,
                      }}>{i < 3 ? MEDALS[i] : i + 1}</div>
                      <TeamLogo team={j.equipe} size={28} radius="var(--radius-sm)" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.prenom} {j.nom}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>{j.equipe?.nom}</div>
                      </div>
                      <div style={{ background: 'rgba(77,166,255,0.08)', border: '1px solid rgba(77,166,255,0.18)', borderRadius: 'var(--radius-md)', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                        <span style={{ fontFamily: 'var(--font-plus-jakarta)', fontWeight: 900, fontSize: '1rem', color: 'var(--color-blue)' }}>{j.passes_decisives}</span>
                        <span style={{ fontSize: '0.7rem' }}>🎯</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fiches Équipes */}
            <div>
              <SectionTitle icon={<Trophy size={16} />} title="Fiches Équipes" color="var(--color-accent)" sub="Les performances du moment" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {teams.slice(0, 5).map(eq => {
                  const pctV = eq.matchs_joues > 0 ? Math.round((eq.victoires / eq.matchs_joues) * 100) : 0
                  const pctN = eq.matchs_joues > 0 ? Math.round((eq.nuls / eq.matchs_joues) * 100) : 0
                  const pctD = eq.matchs_joues > 0 ? Math.round((eq.defaites / eq.matchs_joues) * 100) : 0
                  const diff = eq.buts_marques - eq.buts_encaisses
                  return (
                    <div key={eq.id} className="card" style={{ overflow: 'hidden' }}>
                      <div style={{
                        height: 4,
                        background: `linear-gradient(90deg, ${eq.couleur_principale || '#0dca6b'}, ${eq.couleur_secondaire || '#ffc94d'})`,
                      }} />
                      <div style={{ padding: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                          <TeamLogo team={eq} size={46} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 800, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{eq.nom}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                              {eq.asc_nom || eq.quartier}
                              {eq.poule && <span className="badge badge-gray" style={{ marginLeft: 6, fontSize: '0.55rem', padding: '1px 6px', verticalAlign: 'middle' }}>Poule {eq.poule}</span>}
                            </div>
                          </div>
                          <div style={{ marginLeft: 'auto', textAlign: 'right', flexShrink: 0 }}>
                            <div style={{
                              fontFamily: 'var(--font-plus-jakarta)', fontWeight: 900, fontSize: '1.25rem',
                              color: 'var(--color-primary)', textShadow: '0 0 18px rgba(42,255,160,0.4)',
                              lineHeight: 1,
                            }}>
                              {eq.points_classement}
                            </div>
                            <div style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>points</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 2, height: 6, borderRadius: 'var(--radius-full)', overflow: 'hidden', marginBottom: 10 }}>
                          {pctV > 0 && <div style={{ width: `${pctV}%`, background: 'var(--gradient-green)' }} />}
                          {pctN > 0 && <div style={{ width: `${pctN}%`, background: 'var(--color-accent)' }} />}
                          {pctD > 0 && <div style={{ width: `${pctD}%`, background: 'var(--color-red)' }} />}
                        </div>
                        <div style={{ display: 'flex', gap: 6, fontSize: '0.6rem', marginBottom: 10, color: 'var(--color-text-muted)', fontWeight: 600 }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--color-primary)' }} />Victoires {pctV}%</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--color-accent)' }} />Nuls {pctN}%</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--color-red)' }} />Défaites {pctD}%</span>
                        </div>

                        <div className="mobile-stat-grid" style={{ marginTop: 6 }}>
                          {[
                            { label: 'MJ', value: eq.matchs_joues },
                            { label: 'V', value: eq.victoires, c: '#2affa0' },
                            { label: 'N', value: eq.nuls, c: '#ffc94d' },
                            { label: 'D', value: eq.defaites, c: '#ff4d5a' },
                            { label: 'BP', value: eq.buts_marques },
                            { label: 'BC', value: eq.buts_encaisses },
                            { label: 'Diff', value: diff > 0 ? `+${diff}` : diff, c: diff >= 0 ? '#2affa0' : '#ff4d5a' },
                            { label: 'Pts', value: eq.points_classement, c: '#2affa0' },
                          ].map(s => (
                            <div key={s.label} className="mobile-stat-cell">
                              <span className="mobile-stat-label">{s.label}</span>
                              <span className="mobile-stat-value" style={{ color: s.c || 'var(--color-text-primary)' }}>{s.value}</span>
                            </div>
                          ))}
                        </div>
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
          .data-table tbody tr:hover td { background: rgba(42,255,160,0.02); }
          .standings-stat {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 24px;
            height: 22px;
            border-radius: 7px;
            font-family: var(--font-mono), monospace;
            font-size: 0.78rem;
            font-weight: 800;
          }
          .standings-table tr.is-leader td {
            background: rgba(255, 201, 77, 0.03);
          }
          .standings-table tr.is-leader:hover td {
            background: rgba(255, 201, 77, 0.06);
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
              font-family: var(--font-plus-jakarta);
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
              background: rgba(255, 255, 255, 0.015);
            }
            .mobile-standings-table .mobile-rank-cell {
              padding-left: 7px;
              box-shadow: inset 3px 0 transparent;
              font-family: var(--font-plus-jakarta);
              font-size: 0.82rem;
              font-weight: 900;
              white-space: nowrap;
            }
            .qualification-dot {
              display: inline-block;
              width: 5px;
              height: 5px;
              margin-left: 3px;
              border-radius: 50%;
              background: #2affa0;
              vertical-align: middle;
            }
            .mobile-standings-table .mobile-team-cell {
              padding-left: 7px;
              overflow: hidden;
              font-family: var(--font-plus-jakarta);
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
              font-family: var(--font-plus-jakarta);
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
