import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'

type Props = { params: Promise<{ id: string }> }

type Team = {
  id: string
  nom: string
  sigle: string | null
  logo_url: string | null
  quartier: string | null
  asc_nom: string | null
  couleur_principale: string
  couleur_secondaire: string
  points_classement: number
  victoires: number
  nuls: number
  defaites: number
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('profiles').select('username, full_name').eq('id', id).single() as any
  return {
    title: `${data?.full_name || data?.username || 'Profil'} - NavéStats`,
    description: `Profil communautaire NavéStats de ${data?.username || 'ce pronostiqueur'}.`,
  }
}

const BADGES_ICONS: Record<string, string> = {
  Expert: '🏅',
  'Légende': '🦁',
  Champion: '🏆',
  'Roi des Pronostics': '👑',
  'Score Master': '🎯',
  Invincible: '🔥',
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getLevel(points: number) {
  const level = Math.max(1, Math.floor(points / 100) + 1)
  const currentFloor = (level - 1) * 100
  const nextFloor = level * 100
  const progress = Math.min(100, Math.round(((points - currentFloor) / (nextFloor - currentFloor)) * 100))
  return { level, progress, next: nextFloor - points }
}

function resultLabel(prono: any, match: any) {
  if (prono.resultat_predit === 'equipe_a') return match.equipe_a?.nom || 'Equipe A'
  if (prono.resultat_predit === 'equipe_b') return match.equipe_b?.nom || 'Equipe B'
  return 'Match nul'
}

function phaseLabel(phase?: string | null) {
  const labels: Record<string, string> = {
    phase_groupe: 'Phase de groupes',
    quart_finale: 'Quart de finale',
    demi_finale: 'Demi-finale',
    finale: 'Finale',
  }
  return phase ? labels[phase] || phase : 'Match'
}

export default async function ProfilPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: rawProfile },
    { data: rawBadges },
    { data: rawPronostics },
    { data: rawComments },
    { data: rawTeams },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', id).single(),
    supabase.from('user_badges').select('*, badge:badges_types(*)').eq('user_id', id).order('obtenu_le', { ascending: false }),
    supabase
      .from('pronostics')
      .select(`
        *,
        premier_buteur:joueurs!pronostics_premier_buteur_id_fkey(nom, prenom),
        homme_du_match:joueurs!pronostics_homme_du_match_predit_id_fkey(nom, prenom),
        match:matchs(
          id, date_match, heure_match, statut, phase, score_a, score_b, homme_du_match_id,
          equipe_a:equipes!matchs_equipe_a_id_fkey(nom, sigle, logo_url, couleur_principale),
          equipe_b:equipes!matchs_equipe_b_id_fkey(nom, sigle, logo_url, couleur_principale)
        )
      `)
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(12),
    supabase
      .from('commentaires')
      .select('id, contenu, created_at, match:matchs(id, equipe_a:equipes!matchs_equipe_a_id_fkey(nom), equipe_b:equipes!matchs_equipe_b_id_fkey(nom))')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('equipes').select('id, nom, sigle, logo_url, quartier, asc_nom, couleur_principale, couleur_secondaire, points_classement, victoires, nuls, defaites'),
  ])

  const profile = rawProfile as any
  if (!profile) notFound()

  const userBadges = (rawBadges || []) as any[]
  const pronostics = (rawPronostics || []) as any[]
  const comments = (rawComments || []) as any[]
  const teams = (rawTeams || []) as Team[]
  const isOwnProfile = user?.id === id

  const favoriteTeam = teams.find(team => {
    const target = `${profile.asc_nom || ''} ${profile.quartier || ''}`.toLowerCase()
    return target.includes(team.nom.toLowerCase())
      || target.includes((team.sigle || '').toLowerCase())
      || target.includes((team.asc_nom || '').toLowerCase())
  }) || null

  const pct = profile.total_pronostics > 0
    ? Math.round((profile.pronostics_corrects / profile.total_pronostics) * 100)
    : 0
  const level = getLevel(profile.points || 0)
  const exactScores = pronostics.filter(p => p.score_exact).length
  const pendingPronostics = pronostics.filter(p => p.est_correct === null).length
  const avgPoints = profile.total_pronostics > 0 ? (profile.points / profile.total_pronostics).toFixed(1) : '0.0'
  const memberSince = profile.created_at ? formatDate(profile.created_at) : 'Nouveau'

  const statCards = [
    { label: 'Points', value: profile.points || 0, icon: '⭐', color: 'var(--color-accent)' },
    { label: 'Pronostics', value: profile.total_pronostics || 0, icon: '🎯', color: 'var(--color-primary)' },
    { label: 'Corrects', value: profile.pronostics_corrects || 0, icon: '✅', color: '#059669' },
    { label: 'Réussite', value: `${pct}%`, icon: '📊', color: '#7C3AED' },
  ]

  const activity = [
    ...pronostics.slice(0, 4).map(p => ({
      id: `p-${p.id}`,
      icon: p.est_correct === true ? '✅' : p.est_correct === false ? '❌' : '⏳',
      title: `Pronostic sur ${p.match?.equipe_a?.nom || 'Equipe A'} vs ${p.match?.equipe_b?.nom || 'Equipe B'}`,
      detail: `Choix : ${resultLabel(p, p.match || {})}`,
      date: p.created_at,
      href: `/matchs/${p.match_id}`,
    })),
    ...comments.slice(0, 3).map(c => ({
      id: `c-${c.id}`,
      icon: '💬',
      title: 'Commentaire publié',
      detail: c.contenu,
      date: c.created_at,
      href: c.match?.id ? `/matchs/${c.match.id}` : '/communaute',
    })),
    ...userBadges.slice(0, 3).map(ub => ({
      id: `b-${ub.id}`,
      icon: BADGES_ICONS[ub.badge?.nom] || ub.badge?.icone || '🏅',
      title: `Badge obtenu : ${ub.badge?.nom || 'Badge'}`,
      detail: ub.badge?.description || 'Nouvelle récompense communautaire',
      date: ub.obtenu_le,
      href: `/profil/${id}`,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 7)

  return (
    <div className="page-content">
      <div className="container-app">
        <section style={{
          background: favoriteTeam
            ? `linear-gradient(135deg, ${favoriteTeam.couleur_principale} 0%, ${favoriteTeam.couleur_secondaire} 115%)`
            : 'var(--gradient-hero)',
          borderRadius: 'var(--radius-xl)',
          padding: 'clamp(24px, 4vw, 44px)',
          marginBottom: 28,
          color: 'white',
          overflow: 'hidden',
          position: 'relative',
        }}>
          <div style={{ display: 'grid', gap: 24 }} className="profile-hero-grid">
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, minWidth: 0 }} className="profile-hero-main">
              <div style={{
                width: 104,
                height: 104,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.18)',
                border: '4px solid rgba(255,255,255,0.55)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.6rem',
                fontWeight: 900,
                fontFamily: 'var(--font-outfit)',
                overflow: 'hidden',
                flexShrink: 0,
              }}>
                {profile.avatar_url
                  ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : profile.username.charAt(0).toUpperCase()}
              </div>

              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                  <span className="badge" style={{ background: 'rgba(255,255,255,0.18)', color: 'white' }}>Niveau {level.level}</span>
                  <span className="badge" style={{ background: 'rgba(251,191,0,0.22)', color: '#fff7cc' }}>Rang #{profile.rang || '-'}</span>
                  {profile.is_admin && <span className="badge" style={{ background: 'rgba(255,255,255,0.18)', color: 'white' }}>Admin</span>}
                </div>
                <h1 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: 'clamp(1.7rem, 4vw, 2.55rem)', marginBottom: 4 }}>
                  {profile.full_name || profile.username}
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '0.95rem' }}>@{profile.username} · membre depuis {memberSince}</p>
                {(profile.quartier || profile.asc_nom || (isOwnProfile && user?.user_metadata?.phone)) && (
                  <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: '0.85rem', marginTop: 8 }}>
                    {profile.quartier && `🏘️ ${profile.quartier}`}
                    {profile.quartier && profile.asc_nom && ' · '}
                    {profile.asc_nom && `🛡️ ${profile.asc_nom}`}
                    {isOwnProfile && user?.user_metadata?.phone && (
                      <>{(profile.quartier || profile.asc_nom) && ' · '}📞 {user.user_metadata.phone}</>
                    )}
                  </p>
                )}
                {profile.bio && (
                  <p style={{ color: 'rgba(255,255,255,0.9)', marginTop: 14, maxWidth: 620, lineHeight: 1.55, fontSize: '0.95rem' }}>
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.14)',
              border: '1px solid rgba(255,255,255,0.22)',
              borderRadius: 16,
              padding: 18,
              alignSelf: 'stretch',
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.78, marginBottom: 12 }}>Equipe favorite</div>
              {favoriteTeam ? (
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontWeight: 900 }}>
                    {favoriteTeam.logo_url
                      ? <img src={favoriteTeam.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : favoriteTeam.sigle || favoriteTeam.nom.slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 900, fontFamily: 'var(--font-outfit)', fontSize: '1.05rem' }}>{favoriteTeam.nom}</div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.76)' }}>
                      {favoriteTeam.points_classement} pts · {favoriteTeam.victoires}V {favoriteTeam.nuls}N {favoriteTeam.defaites}D
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontWeight: 800 }}>ASC non renseignée</div>
                  <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.76)', marginTop: 4 }}>Choisis une ASC pour afficher ses couleurs ici.</p>
                </div>
              )}
              {isOwnProfile && (
                <Link href="/profil/modifier" className="btn btn-sm" style={{ marginTop: 16, textDecoration: 'none', background: 'rgba(255,255,255,0.18)', color: 'white', border: '1px solid rgba(255,255,255,0.26)' }}>
                  Modifier mon profil
                </Link>
              )}
            </div>
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 28 }} className="stats-4-grid">
          {statCards.map(s => (
            <div key={s.label} className="card" style={{ padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: '1.7rem', marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: '1.7rem', color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 6, fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </section>

        <section style={{ display: 'grid', gap: 24 }} className="profile-content-grid">
          <div style={{ display: 'grid', gap: 24 }}>
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 14 }}>
                <div>
                  <h2 className="section-title" style={{ fontSize: '1.2rem' }}>Progression</h2>
                  <p className="section-subtitle">Encore {level.next} pts avant le niveau {level.level + 1}</p>
                </div>
                <span className="badge badge-gold">Niveau {level.level}</span>
              </div>
              <div className="progress-bar" style={{ height: 12 }}>
                <div className="progress-fill" style={{ width: `${level.progress}%` }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 18 }}>
                <MiniStat label="Score exact" value={exactScores} />
                <MiniStat label="En attente" value={pendingPronostics} />
                <MiniStat label="Moy. pts" value={avgPoints} />
              </div>
            </div>

            <div>
              <h2 className="section-title" style={{ marginBottom: 16 }}>Derniers pronostics</h2>
              <div className="card" style={{ overflow: 'hidden' }}>
                {pronostics.length === 0 ? (
                  <EmptyState icon="🎯" title="Aucun pronostic pour l'instant" actionHref="/matchs" actionLabel="Pronostiquer un match" />
                ) : (
                  pronostics.map(p => {
                    const match = p.match as any
                    if (!match) return null
                    const isCorrect = p.est_correct === true
                    const isWrong = p.est_correct === false
                    // 🔒 Hide details of upcoming matches for other users
                    const isHidden = !isOwnProfile && (match.statut === 'a_venir' || match.statut === 'en_cours')
                    return (
                      <Link key={p.id} href={`/matchs/${p.match_id}`} style={{ textDecoration: 'none' }}>
                        <div className="profile-row">
                          <div style={{
                            width: 42, height: 42, borderRadius: 12,
                            background: isHidden ? 'var(--color-surface)' : isCorrect ? 'rgba(0,166,81,0.1)' : isWrong ? 'rgba(232,0,45,0.1)' : 'var(--color-surface)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.15rem', flexShrink: 0,
                          }}>
                            {isHidden ? '🔒' : isCorrect ? '✅' : isWrong ? '❌' : '⏳'}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                              <strong style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {match.equipe_a?.nom} vs {match.equipe_b?.nom}
                              </strong>
                              <span className="badge badge-gray" style={{ fontSize: '0.65rem' }}>{phaseLabel(match.phase)}</span>
                            </div>
                            {isHidden ? (
                              <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                                🔒 Masqué — Match non commencé
                              </div>
                            ) : (
                              <div style={{ fontSize: '0.76rem', color: 'var(--color-text-secondary)' }}>
                                Prédit : {resultLabel(p, match)}
                                {p.score_a_predit !== null && p.score_b_predit !== null && ` (${p.score_a_predit}-${p.score_b_predit})`}
                                {p.premier_buteur && (
                                  <span style={{ color: '#1D4ED8' }}> · ⚽ {p.premier_buteur.prenom} {p.premier_buteur.nom}</span>
                                )}
                                {p.homme_du_match && (
                                  <span style={{ color: '#7C3AED' }}> · ⭐ {p.homme_du_match.prenom} {p.homme_du_match.nom}</span>
                                )}
                                {' · '}{formatDate(p.created_at)}
                              </div>
                            )}
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            {isHidden ? (
                              <span className="badge badge-gray" style={{ fontSize: '0.65rem' }}>À venir</span>
                            ) : (
                              <>
                                <div className="stat-number" style={{ fontSize: '0.95rem', color: p.points_gagnes > 0 ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                                  +{p.points_gagnes || 0}
                                </div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>pts</div>
                              </>
                            )}
                          </div>
                        </div>
                      </Link>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          <aside style={{ display: 'grid', gap: 24, alignContent: 'start' }}>
            <div className="card" style={{ padding: 24 }}>
              <h2 className="section-title" style={{ fontSize: '1.2rem', marginBottom: 16 }}>Badges</h2>
              {userBadges.length === 0 ? (
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Aucun badge encore. Les récompenses arrivent avec l'activité.</div>
              ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                  {userBadges.slice(0, 6).map(ub => (
                    <div key={ub.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 12, borderRadius: 12, background: 'var(--color-surface)' }}>
                      <div style={{ fontSize: '1.6rem' }}>{BADGES_ICONS[ub.badge?.nom] || ub.badge?.icone || '🏅'}</div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.86rem', color: ub.badge?.couleur || 'var(--color-text-primary)' }}>{ub.badge?.nom || 'Badge'}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{formatDate(ub.obtenu_le)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card" style={{ padding: 24 }}>
              <h2 className="section-title" style={{ fontSize: '1.2rem', marginBottom: 16 }}>Activité récente</h2>
              {activity.length === 0 ? (
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Aucune activité publique pour le moment.</div>
              ) : (
                <div style={{ display: 'grid', gap: 14 }}>
                  {activity.map(item => (
                    <Link key={item.id} href={item.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{item.icon}</div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 750, fontSize: '0.84rem', color: 'var(--color-text-primary)' }}>{item.title}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.detail}</div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', marginTop: 2 }}>{formatDate(item.date)}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="card" style={{ padding: 24 }}>
              <h2 className="section-title" style={{ fontSize: '1.2rem', marginBottom: 12 }}>Visibilité</h2>
              <div style={{ display: 'grid', gap: 10 }}>
                <VisibilityRow label="Profil public" active />
                <VisibilityRow label="Equipe soutenue" active={Boolean(profile.asc_nom)} />
                <VisibilityRow label="Historique pronostics" active />
                <VisibilityRow label="Téléphone" active={isOwnProfile && Boolean(user?.user_metadata?.phone)} privateLabel />
              </div>
            </div>
          </aside>
        </section>

        <style>{`
          .profile-row {
            padding: 16px 20px;
            border-bottom: 1px solid var(--color-border);
            display: flex;
            align-items: center;
            gap: 14px;
            transition: background 0.2s;
          }
          .profile-row:hover { background: rgba(0,98,51,0.035); }
          @media (min-width: 680px) {
            .stats-4-grid { grid-template-columns: repeat(4, 1fr) !important; }
          }
          @media (min-width: 900px) {
            .profile-hero-grid { grid-template-columns: minmax(0, 1fr) 340px; align-items: stretch; }
            .profile-content-grid { grid-template-columns: minmax(0, 1fr) 360px; }
          }
          @media (max-width: 560px) {
            .profile-hero-main { flex-direction: column; text-align: center; }
            .profile-row { align-items: flex-start; }
          }
        `}</style>
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div style={{ padding: 12, borderRadius: 12, background: 'var(--color-surface)', textAlign: 'center' }}>
      <div className="stat-number" style={{ fontSize: '1.05rem' }}>{value}</div>
      <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', marginTop: 4 }}>{label}</div>
    </div>
  )
}

function EmptyState({ icon, title, actionHref, actionLabel }: { icon: string; title: string; actionHref: string; actionLabel: string }) {
  return (
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
      <div style={{ fontSize: '2.4rem', marginBottom: 8 }}>{icon}</div>
      <p>{title}</p>
      <Link href={actionHref} className="btn btn-primary" style={{ textDecoration: 'none', marginTop: 16, display: 'inline-flex' }}>{actionLabel}</Link>
    </div>
  )
}

function VisibilityRow({ label, active, privateLabel = false }: { label: string; active: boolean; privateLabel?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', fontSize: '0.85rem' }}>
      <span style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
      <span className={`badge ${active ? 'badge-green' : 'badge-gray'}`} style={{ fontSize: '0.68rem' }}>
        {privateLabel ? 'Privé' : active ? 'Visible' : 'Masqué'}
      </span>
    </div>
  )
}
