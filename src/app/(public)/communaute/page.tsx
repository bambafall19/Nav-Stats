import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import Link from 'next/link'
import CommunityReactionButton from '@/components/communaute/CommunityReactionButton'

export const metadata: Metadata = {
  title: 'Communauté – NavéStats',
  description: 'Rejoignez la communauté NavéStats, commentez, réagissez et votez pour l\'homme du match',
}

export default async function CommunautePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Recent comments across all matches
  const { data: rawCommentaires } = await supabase
    .from('commentaires')
    .select('*, user:profiles(*), match:matchs(*, equipe_a:equipes!matchs_equipe_a_id_fkey(nom), equipe_b:equipes!matchs_equipe_b_id_fkey(nom))')
    .order('created_at', { ascending: false })
    .limit(20)
  const commentaires = (rawCommentaires || []) as any[]

  // Votes HdM
  const { data: rawVotes } = await supabase
    .from('votes_hdm')
    .select('joueur:joueurs(nom, prenom, equipe:equipes(nom)), match:matchs(equipe_a:equipes!matchs_equipe_a_id_fkey(nom), equipe_b:equipes!matchs_equipe_b_id_fkey(nom))')
    .order('created_at', { ascending: false })
    .limit(10)
  const votesHdM = (rawVotes || []) as any[]
  const commentairesPopulaires = [...commentaires].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 4)

  return (
    <div className="page-content">
      <div className="container-app">
        {/* Hero */}
        <div style={{
          background: 'var(--gradient-hero)',
          borderRadius: 'var(--radius-xl)',
          padding: 32,
          marginBottom: 32,
          textAlign: 'center',
        }}>
          <h1 style={{ color: 'white', fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontFamily: 'var(--font-outfit)', fontWeight: 900, marginBottom: 8 }}>
            💬 Communauté NavéStats
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: 500, margin: '0 auto', fontSize: '0.9rem' }}>
            Discutez des matchs, partagez vos analyses et votez pour vos joueurs préférés !
          </p>
        </div>

        <div style={{ display: 'grid', gap: 32 }} className="comm-grid">
          {/* Feed de commentaires */}
          <div>
            <h2 className="section-title" style={{ marginBottom: 16 }}>🗣️ Discussions Récentes</h2>

            {!user && (
              <div className="card" style={{ padding: 24, textAlign: 'center', marginBottom: 16 }}>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 16, fontSize: '0.9rem' }}>
                  Connectez-vous pour participer aux discussions !
                </p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                  <Link href="/auth/login" className="btn btn-primary" style={{ textDecoration: 'none' }}>🔑 Connexion</Link>
                  <Link href="/auth/register" className="btn btn-outline" style={{ textDecoration: 'none' }}>✨ S'inscrire</Link>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {(!commentaires || commentaires.length === 0) ? (
                <div className="card" style={{ padding: 48, textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 12 }}>💬</div>
                  <p style={{ color: 'var(--color-text-secondary)' }}>Aucun commentaire pour l'instant. Soyez le premier !</p>
                  <Link href="/matchs" className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', marginTop: 16 }}>
                    Voir les matchs
                  </Link>
                </div>
              ) : commentaires.map(c => {
                const match = c.match as any
                const profile = c.user as any
                return (
                  <div key={c.id} className="card" style={{ padding: 20 }}>
                    {/* Match context */}
                    {match && (
                      <Link href={`/matchs/${match.id}`} style={{ textDecoration: 'none' }}>
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '4px 10px',
                          background: 'rgba(0,98,51,0.06)',
                          borderRadius: 'var(--radius-full)',
                          marginBottom: 12,
                          fontSize: '0.75rem',
                          color: 'var(--color-primary)',
                          fontWeight: 600,
                        }}>
                          ⚽ {match.equipe_a?.nom} vs {match.equipe_b?.nom}
                        </div>
                      </Link>
                    )}

                    <div style={{ display: 'flex', gap: 12 }}>
                      <div className="avatar" style={{ width: 38, height: 38, fontSize: '0.875rem', flexShrink: 0 }}>
                        {profile?.avatar_url
                          ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                          : (profile?.username || '?').charAt(0).toUpperCase()
                        }
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 6 }}>
                          <Link href={`/profil/${profile?.id}`} style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text-primary)', textDecoration: 'none' }}>
                            {profile?.username || 'Utilisateur'}
                          </Link>
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                            {new Date(c.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{c.contenu}</p>
                        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                          <CommunityReactionButton commentId={c.id} initialLikes={c.likes || 0} />
                          <Link href={match ? `/matchs/${match.id}` : '#'} style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                            Répondre →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Commentaires populaires */}
            <div style={{ marginBottom: 24 }}>
              <h2 className="section-title" style={{ marginBottom: 16 }}>🔥 Commentaires populaires</h2>
              <div className="card" style={{ padding: 20 }}>
                {commentairesPopulaires.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 24, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                    Aucun commentaire populaire pour l'instant
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {commentairesPopulaires.map(commentaire => (
                      <Link key={commentaire.id} href={commentaire.match ? `/matchs/${commentaire.match.id}` : '/communaute'} style={{ textDecoration: 'none', color: 'inherit', paddingBottom: 12, borderBottom: '1px solid var(--color-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 4 }}>
                          <strong style={{ fontSize: '0.82rem' }}>{commentaire.user?.username || 'Utilisateur'}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-red)', fontWeight: 800 }}>❤️ {commentaire.likes || 0}</span>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {commentaire.contenu}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Vote HdM */}
            <div style={{ marginBottom: 24 }}>
              <h2 className="section-title" style={{ marginBottom: 16 }}>⭐ Votes Homme du Match</h2>
              <div className="card" style={{ padding: 20 }}>
                {(!votesHdM || votesHdM.length === 0) ? (
                  <div style={{ textAlign: 'center', padding: 32, color: 'var(--color-text-muted)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 8 }}>⭐</div>
                    <p style={{ fontSize: '0.875rem' }}>Aucun vote pour l'instant</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {votesHdM.map((v, i) => {
                      const joueur = v.joueur as any
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < votesHdM.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                          <div className="avatar" style={{ width: 36, height: 36, fontSize: '0.8rem' }}>
                            {(joueur?.prenom || '?').charAt(0)}{(joueur?.nom || '').charAt(0)}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                              {joueur?.prenom} {joueur?.nom}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                              {joueur?.equipe?.nom}
                            </div>
                          </div>
                          <span style={{ fontSize: '1rem' }}>⭐</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Stats communauté */}
            <div>
              <h2 className="section-title" style={{ marginBottom: 16 }}>📊 Communauté</h2>
              <div className="card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { label: 'Discussions actives', value: commentaires?.length || 0, icon: '💬' },
                    { label: 'Votes HdM', value: votesHdM?.length || 0, icon: '⭐' },
                  ].map(s => (
                    <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{s.icon} {s.label}</span>
                      <span className="stat-number">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @media (min-width: 1024px) { .comm-grid { grid-template-columns: 2fr 1fr !important; } }
        `}</style>
      </div>
    </div>
  )
}
