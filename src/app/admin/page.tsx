import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin - NavéStats' }

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
}

function predictionLabel(result: string, match: any) {
  if (result === 'equipe_a') return match?.equipe_a?.nom || 'Equipe A'
  if (result === 'equipe_b') return match?.equipe_b?.nom || 'Equipe B'
  return 'Nul'
}

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: totalUsers },
    { count: totalMatchs },
    { count: totalPronostics },
    { count: totalEquipes },
    { data: recentPronosticsRaw },
    { data: matchsAVenirRaw },
    { data: pronoDistRaw },
    { data: topUsersRaw },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('matchs').select('*', { count: 'exact', head: true }),
    supabase.from('pronostics').select('*', { count: 'exact', head: true }),
    supabase.from('equipes').select('*', { count: 'exact', head: true }),
    supabase.from('pronostics').select('*, user:profiles(username), match:matchs(equipe_a:equipes!matchs_equipe_a_id_fkey(nom), equipe_b:equipes!matchs_equipe_b_id_fkey(nom))').order('created_at', { ascending: false }).limit(8),
    supabase.from('matchs').select('*, equipe_a:equipes!matchs_equipe_a_id_fkey(nom,sigle), equipe_b:equipes!matchs_equipe_b_id_fkey(nom,sigle)').eq('statut', 'a_venir').order('date_match').limit(5),
    supabase.from('pronostics').select('resultat_predit'),
    supabase.from('profiles').select('username, points').order('points', { ascending: false }).limit(5),
  ])

  const recentPronostics = (recentPronosticsRaw || []) as any[]
  const matchsAVenir = (matchsAVenirRaw || []) as any[]
  const pronoDist = (pronoDistRaw || []) as any[]
  const topUsers = (topUsersRaw || []) as any[]

  let pronoDom = 0
  let pronoNul = 0
  let pronoExt = 0
  pronoDist.forEach(p => {
    if (p.resultat_predit === 'equipe_a') pronoDom++
    else if (p.resultat_predit === 'nul') pronoNul++
    else if (p.resultat_predit === 'equipe_b') pronoExt++
  })

  const realPronoTotal = pronoDom + pronoNul + pronoExt
  const pronoTotal = realPronoTotal || 1
  const pctDom = Math.round((pronoDom / pronoTotal) * 100)
  const pctNul = Math.round((pronoNul / pronoTotal) * 100)
  const pctExt = Math.round((pronoExt / pronoTotal) * 100)
  const maxPoints = Math.max(...topUsers.map(u => u.points || 0), 1)

  const statCards = [
    { label: 'Utilisateurs', helper: 'comptes actifs', value: totalUsers || 0, icon: '👥', color: '#006233', bg: 'rgba(0,98,51,0.1)' },
    { label: 'Matchs', helper: 'au calendrier', value: totalMatchs || 0, icon: '⚽', color: '#1D4ED8', bg: 'rgba(29,78,216,0.1)' },
    { label: 'Pronostics', helper: 'soumis', value: totalPronostics || 0, icon: '🎯', color: '#B45309', bg: 'rgba(180,83,9,0.1)' },
    { label: 'Equipes', helper: 'enregistrées', value: totalEquipes || 0, icon: '🛡️', color: '#7C3AED', bg: 'rgba(124,58,237,0.1)' },
  ]

  const quickActions = [
    { href: '/admin/matchs', icon: '＋', label: 'Nouveau match', detail: 'Créer une affiche' },
    { href: '/admin/resultats', icon: '✓', label: 'Résultats', detail: 'Saisir les scores' },
    { href: '/admin/equipes', icon: '◆', label: 'Equipes', detail: 'ASC et couleurs' },
    { href: '/admin/actualites', icon: '↗', label: 'Annonce', detail: 'Publier une info' },
  ]

  return (
    <div className="admin-dashboard">
      <section className="admin-hero">
        <div>
          <span className="admin-kicker">Console NavéStats</span>
          <h1>Tableau de bord</h1>
          <p>Pilote les matchs, les pronostics, les équipes et l'activité de la communauté depuis une vue claire.</p>
        </div>
        <div className="admin-hero-panel">
          <span>Activité pronostics</span>
          <strong>{realPronoTotal.toLocaleString('fr-FR')}</strong>
          <small>Total enregistré</small>
        </div>
      </section>

      <section className="admin-stats-grid">
        {statCards.map(s => (
          <article key={s.label} className="admin-stat-card">
            <div className="admin-stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div>
              <strong style={{ color: s.color }}>{s.value.toLocaleString('fr-FR')}</strong>
              <span>{s.label}</span>
              <small>{s.helper}</small>
            </div>
          </article>
        ))}
      </section>

      <section className="admin-actions">
        <div className="admin-section-heading">
          <div>
            <h2>Actions rapides</h2>
            <p>Les raccourcis utiles pour gérer le tournoi sans chercher dans les menus.</p>
          </div>
        </div>
        <div className="admin-actions-grid">
          {quickActions.map(action => (
            <a key={action.href} href={action.href} className="admin-action-card">
              <span>{action.icon}</span>
              <div>
                <strong>{action.label}</strong>
                <small>{action.detail}</small>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="admin-main-grid">
        <div className="admin-panel">
          <div className="admin-section-heading">
            <div>
              <h2>Distribution des pronostics</h2>
              <p>Lecture rapide des tendances de la communauté.</p>
            </div>
            <span className="admin-pill">{realPronoTotal} votes</span>
          </div>
          <div className="admin-bars">
            <PredictionBar label="Victoire équipe A" value={pronoDom} pct={pctDom} color="#006233" />
            <PredictionBar label="Match nul" value={pronoNul} pct={pctNul} color="#64748B" />
            <PredictionBar label="Victoire équipe B" value={pronoExt} pct={pctExt} color="#1D4ED8" />
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-section-heading">
            <div>
              <h2>Top supporters</h2>
              <p>Les profils les plus performants au classement.</p>
            </div>
          </div>
          <div className="admin-leaderboard">
            {topUsers.length === 0 ? (
              <EmptyPanel text="Aucun utilisateur pour le moment" />
            ) : topUsers.map((user, index) => {
              const pct = Math.round(((user.points || 0) / maxPoints) * 100)
              return (
                <div key={`${user.username}-${index}`} className="admin-leader-row">
                  <div className="admin-rank">{index + 1}</div>
                  <div className="admin-leader-content">
                    <div>
                      <strong>{user.username}</strong>
                      <span>{(user.points || 0).toLocaleString('fr-FR')} pts</span>
                    </div>
                    <div className="admin-meter"><i style={{ width: `${pct}%` }} /></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="admin-bottom-grid">
        <div className="admin-panel">
          <div className="admin-section-heading">
            <div>
              <h2>Prochains matchs</h2>
              <p>Affiches à venir et saisie rapide des résultats.</p>
            </div>
            <a href="/admin/matchs" className="admin-link">Tout voir</a>
          </div>
          <div className="admin-list">
            {matchsAVenir.length === 0 ? (
              <EmptyPanel text="Aucun match programmé" />
            ) : matchsAVenir.map(match => (
              <div key={match.id} className="admin-match-row">
                <div className="admin-date-box">
                  <strong>{new Date(match.date_match).toLocaleDateString('fr-FR', { day: '2-digit' })}</strong>
                  <span>{new Date(match.date_match).toLocaleDateString('fr-FR', { month: 'short' })}</span>
                </div>
                <div className="admin-row-main">
                  <strong>{match.equipe_a?.nom} vs {match.equipe_b?.nom}</strong>
                  <span>{formatDate(match.date_match)} · {match.heure_match?.slice(0, 5)} · {match.stade}</span>
                </div>
                <a href={`/admin/resultats?match=${match.id}`} className="admin-row-action">Saisir</a>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-section-heading">
            <div>
              <h2>Derniers pronostics</h2>
              <p>Suivi en temps réel des choix des supporters.</p>
            </div>
          </div>
          <div className="admin-list">
            {recentPronostics.length === 0 ? (
              <EmptyPanel text="Aucun pronostic reçu" />
            ) : recentPronostics.map(pronostic => {
              const match = pronostic.match as any
              return (
                <div key={pronostic.id} className="admin-prono-row">
                  <div className="admin-user-dot">{(pronostic.user?.username || '?').charAt(0).toUpperCase()}</div>
                  <div className="admin-row-main">
                    <strong>{pronostic.user?.username || 'Utilisateur'}</strong>
                    <span>{match?.equipe_a?.nom} vs {match?.equipe_b?.nom}</span>
                  </div>
                  <span className={`admin-choice ${pronostic.resultat_predit === 'nul' ? 'muted' : ''}`}>
                    {predictionLabel(pronostic.resultat_predit, match)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <style>{`
        .admin-dashboard {
          display: grid;
          gap: 24px;
        }
        .admin-hero {
          display: grid;
          gap: 20px;
          align-items: stretch;
          padding: clamp(24px, 4vw, 34px);
          border-radius: 18px;
          color: white;
          background:
            linear-gradient(135deg, rgba(0,98,51,0.96), rgba(0,166,81,0.86)),
            radial-gradient(circle at 85% 20%, rgba(251,191,0,0.28), transparent 28%);
          box-shadow: 0 18px 46px rgba(0,98,51,0.18);
        }
        .admin-kicker {
          display: inline-flex;
          padding: 5px 11px;
          border-radius: 999px;
          background: rgba(255,255,255,0.16);
          border: 1px solid rgba(255,255,255,0.22);
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 12px;
        }
        .admin-hero h1 {
          font-family: var(--font-outfit);
          font-size: clamp(2rem, 4vw, 3.1rem);
          line-height: 1;
          font-weight: 950;
          margin-bottom: 12px;
        }
        .admin-hero p {
          max-width: 620px;
          color: rgba(255,255,255,0.82);
          font-size: 0.98rem;
          line-height: 1.55;
        }
        .admin-hero-panel {
          min-height: 150px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.22);
          background: rgba(255,255,255,0.14);
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 22px;
        }
        .admin-hero-panel span,
        .admin-hero-panel small {
          color: rgba(255,255,255,0.76);
          font-weight: 700;
          font-size: 0.78rem;
        }
        .admin-hero-panel strong {
          font-family: var(--font-outfit);
          font-size: 2.7rem;
          line-height: 1;
          margin: 8px 0;
        }
        .admin-stats-grid,
        .admin-actions-grid,
        .admin-main-grid,
        .admin-bottom-grid {
          display: grid;
          gap: 16px;
        }
        .admin-stats-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .admin-stat-card,
        .admin-panel,
        .admin-actions {
          background: var(--color-surface-card);
          border: 1px solid rgba(15,23,42,0.06);
          border-radius: 16px;
          box-shadow: 0 10px 28px rgba(15,23,42,0.05);
        }
        .admin-stat-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 18px;
        }
        .admin-stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.35rem;
          flex-shrink: 0;
        }
        .admin-stat-card strong {
          display: block;
          font-family: var(--font-outfit);
          font-size: 1.8rem;
          line-height: 1;
          font-weight: 950;
        }
        .admin-stat-card span {
          display: block;
          margin-top: 4px;
          color: var(--color-text-primary);
          font-weight: 800;
          font-size: 0.88rem;
        }
        .admin-stat-card small {
          color: var(--color-text-muted);
          font-size: 0.72rem;
        }
        .admin-actions,
        .admin-panel {
          padding: 22px;
        }
        .admin-section-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 18px;
        }
        .admin-section-heading h2 {
          font-family: var(--font-outfit);
          font-size: 1.08rem;
          font-weight: 900;
          color: var(--color-text-primary);
          margin-bottom: 4px;
        }
        .admin-section-heading p {
          color: var(--color-text-muted);
          font-size: 0.8rem;
          line-height: 1.4;
        }
        .admin-actions-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .admin-action-card {
          display: flex;
          gap: 12px;
          align-items: center;
          padding: 15px;
          border-radius: 14px;
          background: var(--color-surface);
          border: 1px solid transparent;
          text-decoration: none;
          color: var(--color-text-primary);
          transition: transform 0.18s, border-color 0.18s, background 0.18s;
        }
        .admin-action-card:hover {
          transform: translateY(-2px);
          border-color: rgba(0,98,51,0.16);
          background: rgba(0,98,51,0.035);
        }
        .admin-action-card > span {
          width: 36px;
          height: 36px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          color: var(--color-primary);
          font-weight: 950;
          box-shadow: 0 6px 16px rgba(15,23,42,0.06);
        }
        .admin-action-card strong,
        .admin-action-card small {
          display: block;
        }
        .admin-action-card strong {
          font-size: 0.9rem;
          font-weight: 850;
        }
        .admin-action-card small {
          margin-top: 2px;
          color: var(--color-text-muted);
          font-size: 0.72rem;
        }
        .admin-pill,
        .admin-link,
        .admin-choice,
        .admin-row-action {
          border-radius: 999px;
          font-size: 0.74rem;
          font-weight: 800;
          white-space: nowrap;
        }
        .admin-pill {
          padding: 6px 11px;
          color: var(--color-primary);
          background: rgba(0,98,51,0.08);
        }
        .admin-link {
          color: var(--color-primary);
          text-decoration: none;
          padding: 7px 11px;
          background: rgba(0,98,51,0.08);
        }
        .admin-bars {
          display: grid;
          gap: 18px;
        }
        .admin-bar-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 8px;
          font-size: 0.82rem;
          font-weight: 800;
          color: var(--color-text-primary);
        }
        .admin-bar-track,
        .admin-meter {
          height: 9px;
          overflow: hidden;
          border-radius: 999px;
          background: #EEF2F7;
        }
        .admin-bar-track i,
        .admin-meter i {
          display: block;
          height: 100%;
          border-radius: inherit;
        }
        .admin-leaderboard,
        .admin-list {
          display: grid;
          gap: 12px;
        }
        .admin-leader-row,
        .admin-match-row,
        .admin-prono-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 14px;
          background: var(--color-surface);
        }
        .admin-rank {
          width: 34px;
          height: 34px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          color: var(--color-primary);
          font-weight: 950;
          box-shadow: 0 6px 14px rgba(15,23,42,0.06);
        }
        .admin-leader-content {
          flex: 1;
          min-width: 0;
        }
        .admin-leader-content > div:first-child {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 7px;
          font-size: 0.82rem;
        }
        .admin-leader-content strong,
        .admin-row-main strong {
          color: var(--color-text-primary);
          font-weight: 850;
        }
        .admin-leader-content span,
        .admin-row-main span {
          color: var(--color-text-muted);
          font-size: 0.74rem;
        }
        .admin-meter i {
          background: linear-gradient(90deg, #006233, #00A651);
        }
        .admin-date-box,
        .admin-user-dot {
          width: 44px;
          height: 44px;
          border-radius: 13px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          box-shadow: 0 6px 14px rgba(15,23,42,0.06);
        }
        .admin-date-box {
          flex-direction: column;
        }
        .admin-date-box strong {
          font-family: var(--font-outfit);
          line-height: 1;
          color: var(--color-primary);
        }
        .admin-date-box span {
          font-size: 0.65rem;
          color: var(--color-text-muted);
          text-transform: uppercase;
        }
        .admin-user-dot {
          color: white;
          background: linear-gradient(135deg, #006233, #00A651);
          font-family: var(--font-outfit);
          font-weight: 900;
        }
        .admin-row-main {
          flex: 1;
          min-width: 0;
        }
        .admin-row-main strong,
        .admin-row-main span {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .admin-row-action {
          padding: 7px 12px;
          color: var(--color-primary);
          background: rgba(0,98,51,0.08);
          text-decoration: none;
        }
        .admin-choice {
          max-width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
          padding: 7px 10px;
          color: var(--color-primary);
          background: rgba(0,98,51,0.08);
        }
        .admin-choice.muted {
          color: var(--color-text-secondary);
          background: rgba(100,116,139,0.1);
        }
        .admin-empty {
          padding: 28px;
          text-align: center;
          color: var(--color-text-muted);
          font-size: 0.86rem;
          border-radius: 14px;
          background: var(--color-surface);
        }
        @media (min-width: 760px) {
          .admin-hero { grid-template-columns: minmax(0, 1fr) 260px; }
          .admin-actions-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        }
        @media (min-width: 920px) {
          .admin-main-grid,
          .admin-bottom-grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
        }
        @media (min-width: 1180px) {
          .admin-stats-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        }
        @media (max-width: 560px) {
          .admin-stats-grid,
          .admin-actions-grid { grid-template-columns: 1fr; }
          .admin-section-heading { flex-direction: column; }
          .admin-choice { max-width: 110px; }
        }
      `}</style>
    </div>
  )
}

function PredictionBar({ label, value, pct, color }: { label: string; value: number; pct: number; color: string }) {
  return (
    <div>
      <div className="admin-bar-head">
        <span>{label}</span>
        <span>{value} · {pct}%</span>
      </div>
      <div className="admin-bar-track">
        <i style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

function EmptyPanel({ text }: { text: string }) {
  return <div className="admin-empty">{text}</div>
}
