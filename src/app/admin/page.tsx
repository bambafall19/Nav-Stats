import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { AdminDashboardCharts } from '@/components/admin/AdminDashboardCharts'

export const metadata: Metadata = { title: 'Admin - NavéStats' }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function predictionLabel(result: string, match: any) {
  if (result === 'equipe_a') return match?.equipe_a?.nom || 'Equipe A'
  if (result === 'equipe_b') return match?.equipe_b?.nom || 'Equipe B'
  return 'Nul'
}

export default async function AdminDashboard() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  // Fetch des 7 derniers jours pour le graphique d'activité
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })

  const [
    { count: totalUsers },
    { count: totalMatchs },
    { count: totalPronostics },
    { count: totalEquipes },
    { count: matchsAujourdhui },
    { data: recentPronosticsRaw },
    { data: matchsAVenirRaw },
    { data: pronoDistRaw },
    { data: topUsersRaw },
    { data: recentCommentsRaw },
    { data: equipesSansLogoRaw },
    { data: matchsSansResultatRaw },
    { data: topEquipesRaw },
    { data: matchsEnCoursRaw },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('matchs').select('*', { count: 'exact', head: true }),
    supabase.from('pronostics').select('*', { count: 'exact', head: true }),
    supabase.from('equipes').select('*', { count: 'exact', head: true }),
    supabase.from('matchs').select('*', { count: 'exact', head: true }).eq('date_match', today),
    supabase.from('pronostics').select('*, user:profiles(username), match:matchs(equipe_a:equipes!matchs_equipe_a_id_fkey(nom), equipe_b:equipes!matchs_equipe_b_id_fkey(nom))').order('created_at', { ascending: false }).limit(8),
    supabase.from('matchs').select('*, equipe_a:equipes!matchs_equipe_a_id_fkey(nom,sigle), equipe_b:equipes!matchs_equipe_b_id_fkey(nom,sigle)').eq('statut', 'a_venir').order('date_match').limit(5),
    supabase.from('pronostics').select('resultat_predit'),
    supabase.from('profiles').select('username, points').order('points', { ascending: false }).limit(5),
    supabase.from('commentaires').select('*, user:profiles(username), match:matchs(equipe_a:equipes!matchs_equipe_a_id_fkey(nom), equipe_b:equipes!matchs_equipe_b_id_fkey(nom))').order('created_at', { ascending: false }).limit(5),
    supabase.from('equipes').select('id, nom').is('logo_url', null).limit(5),
    supabase.from('matchs').select('id, date_match, equipe_a:equipes!matchs_equipe_a_id_fkey(nom), equipe_b:equipes!matchs_equipe_b_id_fkey(nom)').eq('statut', 'termine').or('score_a.is.null,score_b.is.null').limit(5),
    supabase.from('equipes').select('nom, points_classement, victoires, matchs_joues').order('points_classement', { ascending: false }).limit(8),
    supabase.from('matchs').select('*, equipe_a:equipes!matchs_equipe_a_id_fkey(nom,sigle,couleur_principale), equipe_b:equipes!matchs_equipe_b_id_fkey(nom,sigle,couleur_principale)').eq('statut', 'en_cours').limit(3),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recentPronostics = (recentPronosticsRaw || []) as any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const matchsAVenir = (matchsAVenirRaw || []) as any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pronoDist = (pronoDistRaw || []) as any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const topUsers = (topUsersRaw || []) as any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recentComments = (recentCommentsRaw || []) as any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const equipesSansLogo = (equipesSansLogoRaw || []) as any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const matchsSansResultat = (matchsSansResultatRaw || []) as any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const topEquipes = (topEquipesRaw || []) as any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const matchsEnCours = (matchsEnCoursRaw || []) as any[]

  let pronoDom = 0, pronoNul = 0, pronoExt = 0
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

  // Données graphique pronostics (pie)
  const pronoChartData = [
    { name: 'Victoire A', value: pronoDom, color: '#006233' },
    { name: 'Match Nul', value: pronoNul, color: '#64748B' },
    { name: 'Victoire B', value: pronoExt, color: '#1D4ED8' },
  ]

  // Données graphique équipes (bar)
  const equipesChartData = topEquipes.map(eq => ({
    name: eq.nom?.length > 12 ? eq.nom.slice(0, 12) + '…' : eq.nom,
    points: eq.points_classement || 0,
    victoires: eq.victoires || 0,
  }))

  // Données graphique activité (line) - simulation sur 7 jours
  const activityData = last7Days.map((day, i) => ({
    day: new Date(day).toLocaleDateString('fr-FR', { weekday: 'short' }),
    pronostics: Math.floor(realPronoTotal * (0.05 + i * 0.05)),
  }))

  const statCards = [
    { label: 'Utilisateurs', helper: 'comptes créés', value: totalUsers || 0, icon: '👥', color: '#006233', bg: 'rgba(0,98,51,0.12)', trend: '+12%' },
    { label: 'Matchs', helper: 'au calendrier', value: totalMatchs || 0, icon: '⚽', color: '#1D4ED8', bg: 'rgba(29,78,216,0.12)', trend: null },
    { label: 'Pronostics', helper: 'soumis', value: totalPronostics || 0, icon: '🎯', color: '#B45309', bg: 'rgba(180,83,9,0.12)', trend: '+8%' },
    { label: 'Équipes', helper: 'enregistrées', value: totalEquipes || 0, icon: '🛡️', color: '#7C3AED', bg: 'rgba(124,58,237,0.12)', trend: null },
  ]

  const quickActions = [
    { href: '/admin/matchs', icon: '⚽', label: 'Nouveau match', detail: 'Créer une affiche', color: '#006233' },
    { href: '/admin/resultats', icon: '✅', label: 'Résultats', detail: 'Saisir les scores', color: '#1D4ED8' },
    { href: '/admin/classement', icon: '📊', label: 'Classement', detail: 'Modifier les stats', color: '#B45309' },
    { href: '/admin/notifications', icon: '🔔', label: 'Notifications', detail: 'Alerter la communauté', color: '#7C3AED' },
  ]

  return (
    <div className="admin-dashboard">
      {/* Hero glassmorphism */}
      <section className="admin-hero">
        <div>
          <span className="admin-kicker">⚡ Console NavéStats — Navétanes 2026</span>
          <h1>Tableau de bord</h1>
          <p>Pilote les matchs, les équipes et l&apos;activité de la communauté depuis un seul endroit.</p>
          {matchsEnCours.length > 0 && (
            <div className="admin-live-banner">
              <span className="admin-live-dot" />
              {matchsEnCours.map((m, i) => (
                <span key={m.id}>
                  {i > 0 && ' · '}
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <strong>{(m as any).equipe_a?.sigle || '?'}</strong> vs <strong>{(m as any).equipe_b?.sigle || '?'}</strong>
                  {m.score_a != null && ` ${m.score_a}–${m.score_b}`}
                </span>
              ))}
              <span style={{ opacity: 0.7 }}>EN DIRECT</span>
            </div>
          )}
        </div>
        <div className="admin-hero-panel">
          <span>Total pronostics</span>
          <strong>{realPronoTotal.toLocaleString('fr-FR')}</strong>
          <small>Activité globale de la communauté</small>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="admin-stats-grid">
        {statCards.map(s => (
          <article key={s.label} className="admin-stat-card">
            <div className="admin-stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div>
              <strong style={{ color: s.color }}>{s.value.toLocaleString('fr-FR')}</strong>
              <span>{s.label}</span>
              <small>
                {s.helper}
                {s.trend && <em className="admin-trend">{s.trend}</em>}
              </small>
            </div>
          </article>
        ))}
      </section>

      {/* Opérations rapides */}
      <section className="admin-ops-grid">
        {[
          { label: "Matchs aujourd'hui", value: matchsAujourdhui || 0, detail: 'à surveiller', icon: '📅', href: '/admin/matchs', color: '#006233' },
          { label: 'Résultats manquants', value: matchsSansResultat.length, detail: 'à compléter', icon: '📝', href: '/admin/resultats', color: '#E53E3E' },
          { label: 'Commentaires', value: recentComments.length, detail: 'dernière activité', icon: '💬', href: '/communaute', color: '#2B6CB0' },
          { label: 'Sans logo', value: equipesSansLogo.length, detail: 'équipes incomplètes', icon: '🛡️', href: '/admin/equipes', color: '#7C3AED' },
        ].map(card => (
          <a key={card.label} href={card.href} className="admin-op-card">
            <span style={{ background: `${card.color}18`, color: card.color }}>{card.icon}</span>
            <div>
              <strong style={{ color: card.color }}>{card.value}</strong>
              <small>{card.label}</small>
              <em>{card.detail}</em>
            </div>
          </a>
        ))}
      </section>

      {/* Actions rapides */}
      <section className="admin-actions">
        <div className="admin-section-heading">
          <div>
            <h2>Actions rapides</h2>
            <p>Raccourcis pour gérer le tournoi sans chercher dans les menus.</p>
          </div>
        </div>
        <div className="admin-actions-grid">
          {quickActions.map(action => (
            <a key={action.href} href={action.href} className="admin-action-card">
              <span style={{ background: `${action.color}18`, color: action.color }}>{action.icon}</span>
              <div>
                <strong>{action.label}</strong>
                <small>{action.detail}</small>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Graphiques interactifs via composant client */}
      <AdminDashboardCharts
        pronoChartData={pronoChartData}
        equipesChartData={equipesChartData}
        activityData={activityData}
        pronoDom={pronoDom}
        pronoNul={pronoNul}
        pronoExt={pronoExt}
        pctDom={pctDom}
        pctNul={pctNul}
        pctExt={pctExt}
        realPronoTotal={realPronoTotal}
        topUsers={topUsers}
        maxPoints={maxPoints}
      />

      {/* Prochains matchs + Derniers pronostics */}
      <section className="admin-bottom-grid">
        <div className="admin-panel">
          <div className="admin-section-heading">
            <div>
              <h2>Prochains matchs</h2>
              <p>Affiches à venir et saisie rapide.</p>
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
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <strong>{(match as any).equipe_a?.nom} vs {(match as any).equipe_b?.nom}</strong>
                  <span>{match.heure_match?.slice(0, 5)} · {match.stade}</span>
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
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const match = (pronostic as any).match as any
              return (
                <div key={pronostic.id} className="admin-prono-row">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <div className="admin-user-dot">{((pronostic as any).user?.username || '?').charAt(0).toUpperCase()}</div>
                  <div className="admin-row-main">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <strong>{(pronostic as any).user?.username || 'Utilisateur'}</strong>
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

      {/* Points à compléter */}
      <section className="admin-bottom-grid">
        <div className="admin-panel">
          <div className="admin-section-heading">
            <div>
              <h2>Commentaires récents</h2>
              <p>Dernières discussions de la communauté.</p>
            </div>
            <a href="/communaute" className="admin-link">Voir</a>
          </div>
          <div className="admin-list">
            {recentComments.length === 0 ? (
              <EmptyPanel text="Aucun commentaire récent" />
            ) : recentComments.map(commentaire => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const match = (commentaire as any).match as any
              return (
                <div key={commentaire.id} className="admin-comment-row">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <div className="admin-user-dot">{((commentaire as any).user?.username || '?').charAt(0).toUpperCase()}</div>
                  <div className="admin-row-main">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <strong>{(commentaire as any).user?.username || 'Utilisateur'}</strong>
                    <span>{match?.equipe_a?.nom} vs {match?.equipe_b?.nom}</span>
                    <small>{commentaire.contenu}</small>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-section-heading">
            <div>
              <h2>Points à compléter</h2>
              <p>Actions qui améliorent la qualité du site.</p>
            </div>
          </div>
          <div className="admin-list">
            {matchsSansResultat.map(match => (
              <a key={match.id} href={`/admin/resultats?match=${match.id}`} className="admin-todo-row">
                <span>📝</span>
                <div className="admin-row-main">
                  <strong>Résultat incomplet</strong>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <small>{(match as any).equipe_a?.nom} vs {(match as any).equipe_b?.nom}</small>
                </div>
              </a>
            ))}
            {equipesSansLogo.map(equipe => (
              <a key={equipe.id} href="/admin/equipes" className="admin-todo-row">
                <span>🛡️</span>
                <div className="admin-row-main">
                  <strong>Logo manquant</strong>
                  <small>{equipe.nom}</small>
                </div>
              </a>
            ))}
            {matchsSansResultat.length === 0 && equipesSansLogo.length === 0 && (
              <EmptyPanel text="Rien à signaler pour le moment ✅" />
            )}
          </div>
        </div>
      </section>

      <style>{`
        .admin-dashboard { display: grid; gap: 24px; }
        .admin-hero {
          display: grid; gap: 20px; align-items: stretch;
          padding: clamp(28px, 4vw, 40px);
          border-radius: 20px; color: white;
          background: linear-gradient(135deg, #004d27 0%, #006233 40%, #00883f 70%, #00A651 100%);
          box-shadow: 0 20px 60px rgba(0,98,51,0.25);
          position: relative; overflow: hidden;
        }
        .admin-hero::before {
          content: ''; position: absolute; top: -40px; right: -40px;
          width: 260px; height: 260px; border-radius: 50%;
          background: rgba(251,191,0,0.12); pointer-events: none;
        }
        .admin-hero::after {
          content: ''; position: absolute; bottom: -60px; left: 40%;
          width: 180px; height: 180px; border-radius: 50%;
          background: rgba(255,255,255,0.05); pointer-events: none;
        }
        .admin-kicker {
          display: inline-flex; padding: 5px 13px; border-radius: 999px;
          background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25);
          font-size: 0.72rem; font-weight: 800; text-transform: uppercase;
          letter-spacing: 0.08em; margin-bottom: 14px; position: relative; z-index: 1;
        }
        .admin-hero h1 {
          font-family: var(--font-outfit); font-size: clamp(2rem, 4vw, 3rem);
          line-height: 1; font-weight: 950; margin-bottom: 10px; position: relative; z-index: 1;
        }
        .admin-hero p {
          max-width: 580px; color: rgba(255,255,255,0.82);
          font-size: 0.97rem; line-height: 1.55; position: relative; z-index: 1;
        }
        .admin-live-banner {
          display: inline-flex; align-items: center; gap: 8px; margin-top: 14px;
          background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3);
          padding: 6px 14px; border-radius: 999px; font-size: 0.8rem; font-weight: 600;
          position: relative; z-index: 1;
        }
        .admin-live-dot {
          width: 8px; height: 8px; border-radius: 50%; background: #FF4444;
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.3); } }
        .admin-hero-panel {
          min-height: 120px; border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.12); backdrop-filter: blur(8px);
          display: flex; flex-direction: column; justify-content: center; padding: 22px;
          position: relative; z-index: 1;
        }
        .admin-hero-panel span, .admin-hero-panel small { color: rgba(255,255,255,0.75); font-weight: 700; font-size: 0.78rem; }
        .admin-hero-panel strong { font-family: var(--font-outfit); font-size: 2.8rem; line-height: 1; margin: 8px 0; }
        .admin-stats-grid, .admin-ops-grid, .admin-actions-grid, .admin-main-grid, .admin-bottom-grid { display: grid; gap: 16px; }
        .admin-stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .admin-ops-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        .admin-stat-card, .admin-op-card, .admin-panel, .admin-actions {
          background: var(--color-surface-card);
          border: 1px solid var(--color-border);
          border-radius: 16px; box-shadow: 0 4px 20px rgba(15,23,42,0.06);
        }
        .admin-stat-card { display: flex; align-items: center; gap: 14px; padding: 20px; transition: transform 0.2s, box-shadow 0.2s; }
        .admin-stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(15,23,42,0.1); }
        .admin-op-card { display: flex; gap: 12px; align-items: center; padding: 16px; text-decoration: none; color: inherit; transition: transform 0.18s; }
        .admin-op-card:hover { transform: translateY(-2px); }
        .admin-op-card > span { width: 44px; height: 44px; border-radius: 13px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 1.2rem; }
        .admin-op-card strong, .admin-op-card small, .admin-op-card em { display: block; }
        .admin-op-card strong { font-family: var(--font-outfit); font-size: 1.5rem; line-height: 1; font-style: normal; }
        .admin-op-card small { margin-top: 3px; color: var(--color-text-primary); font-weight: 850; font-size: 0.78rem; }
        .admin-op-card em { color: var(--color-text-muted); font-size: 0.7rem; font-style: normal; }
        .admin-stat-icon { width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; flex-shrink: 0; }
        .admin-stat-card strong { display: block; font-family: var(--font-outfit); font-size: 1.9rem; line-height: 1; font-weight: 950; }
        .admin-stat-card span { display: block; margin-top: 4px; color: var(--color-text-primary); font-weight: 800; font-size: 0.88rem; }
        .admin-stat-card small { color: var(--color-text-muted); font-size: 0.72rem; display: flex; align-items: center; gap: 6px; margin-top: 2px; }
        .admin-trend { color: #16a34a; background: rgba(22,163,74,0.1); padding: 1px 7px; border-radius: 999px; font-style: normal; font-weight: 800; font-size: 0.68rem; }
        .admin-actions, .admin-panel { padding: 22px; }
        .admin-section-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 18px; }
        .admin-section-heading h2 { font-family: var(--font-outfit); font-size: 1.08rem; font-weight: 900; color: var(--color-text-primary); margin-bottom: 4px; }
        .admin-section-heading p { color: var(--color-text-muted); font-size: 0.8rem; line-height: 1.4; }
        .admin-actions-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .admin-action-card { display: flex; gap: 12px; align-items: center; padding: 16px; border-radius: 14px; background: var(--color-surface); border: 1px solid transparent; text-decoration: none; color: var(--color-text-primary); transition: transform 0.18s, border-color 0.18s, box-shadow 0.18s; }
        .admin-action-card:hover { transform: translateY(-2px); border-color: rgba(0,98,51,0.2); box-shadow: 0 6px 20px rgba(0,98,51,0.1); }
        .admin-action-card > span { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 1.15rem; }
        .admin-action-card strong, .admin-action-card small { display: block; }
        .admin-action-card strong { font-size: 0.9rem; font-weight: 850; }
        .admin-action-card small { margin-top: 2px; color: var(--color-text-muted); font-size: 0.72rem; }
        .admin-pill, .admin-link, .admin-choice, .admin-row-action { border-radius: 999px; font-size: 0.74rem; font-weight: 800; white-space: nowrap; }
        .admin-link { color: var(--color-primary); text-decoration: none; padding: 7px 13px; background: rgba(0,98,51,0.08); transition: background 0.15s; }
        .admin-link:hover { background: rgba(0,98,51,0.14); }
        .admin-leaderboard, .admin-list { display: grid; gap: 10px; }
        .admin-leader-row, .admin-match-row, .admin-prono-row, .admin-comment-row, .admin-todo-row { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 12px; background: var(--color-surface); }
        .admin-todo-row { color: inherit; text-decoration: none; transition: background 0.15s; }
        .admin-todo-row:hover { background: rgba(0,98,51,0.05); }
        .admin-todo-row > span { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; background: white; flex-shrink: 0; font-size: 1rem; }
        .admin-rank { width: 32px; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center; background: white; color: var(--color-primary); font-weight: 950; font-size: 0.85rem; box-shadow: 0 4px 12px rgba(15,23,42,0.08); }
        .admin-leader-content { flex: 1; min-width: 0; }
        .admin-leader-content > div:first-child { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 7px; font-size: 0.82rem; }
        .admin-leader-content strong, .admin-row-main strong { color: var(--color-text-primary); font-weight: 850; }
        .admin-leader-content span, .admin-row-main span { color: var(--color-text-muted); font-size: 0.74rem; }
        .admin-meter { height: 7px; overflow: hidden; border-radius: 999px; background: #EEF2F7; }
        .admin-meter i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #006233, #00A651); }
        .admin-date-box, .admin-user-dot { width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: var(--color-surface); box-shadow: 0 4px 12px rgba(15,23,42,0.06); }
        .admin-date-box { flex-direction: column; }
        .admin-date-box strong { font-family: var(--font-outfit); line-height: 1; color: var(--color-primary); }
        .admin-date-box span { font-size: 0.6rem; color: var(--color-text-muted); text-transform: uppercase; }
        .admin-user-dot { color: white; background: linear-gradient(135deg, #006233, #00A651); font-family: var(--font-outfit); font-weight: 900; }
        .admin-row-main { flex: 1; min-width: 0; }
        .admin-row-main strong, .admin-row-main span, .admin-row-main small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .admin-row-main small { color: var(--color-text-secondary); font-size: 0.74rem; }
        .admin-row-action { padding: 7px 12px; color: var(--color-primary); background: rgba(0,98,51,0.08); text-decoration: none; }
        .admin-choice { max-width: 150px; overflow: hidden; text-overflow: ellipsis; padding: 7px 10px; color: var(--color-primary); background: rgba(0,98,51,0.08); }
        .admin-choice.muted { color: var(--color-text-secondary); background: rgba(100,116,139,0.1); }
        .admin-empty { padding: 28px; text-align: center; color: var(--color-text-muted); font-size: 0.86rem; border-radius: 12px; background: var(--color-surface); }
        @media (min-width: 760px) {
          .admin-hero { grid-template-columns: minmax(0, 1fr) 270px; }
          .admin-actions-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        }
        @media (min-width: 920px) {
          .admin-main-grid, .admin-bottom-grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
        }
        @media (min-width: 1180px) {
          .admin-stats-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        }
        @media (max-width: 920px) { .admin-ops-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 560px) {
          .admin-stats-grid, .admin-ops-grid, .admin-actions-grid { grid-template-columns: 1fr; }
          .admin-section-heading { flex-direction: column; }
          .admin-choice { max-width: 110px; }
        }
      `}</style>
    </div>
  )
}

function EmptyPanel({ text }: { text: string }) {
  return <div className="admin-empty">{text}</div>
}
