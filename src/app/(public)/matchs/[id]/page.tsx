import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CalendarX, BarChart3 } from 'lucide-react'
import type { Metadata } from 'next'
import PronosticForm from '@/components/pronostics/PronosticForm'
import AIEstimation from '@/components/shared/AIEstimation'
import CommentSection from '@/components/communaute/CommentSection'
import HeadToHead from '@/components/matchs/HeadToHead'
import SharePronostic from '@/components/pronostics/SharePronostic'
import PushNotifButton from '@/components/shared/PushNotifButton'
import FormeRecente from '@/components/shared/FormeRecente'
import ScoreboardPanel from '@/components/shared/ScoreboardPanel'
import { MatchHeroClient } from '@/components/matchs/MatchHeroClient'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: match } = await supabase
    .from('matchs')
    .select(`*, equipe_a:equipes!matchs_equipe_a_id_fkey(*), equipe_b:equipes!matchs_equipe_b_id_fkey(*)`)
    .eq('id', id)
    .single()

  if (!match) return { title: 'Match – NavéStats' }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const m = match as any
  const teamA = m.equipe_a?.nom || 'Équipe A'
  const teamB = m.equipe_b?.nom || 'Équipe B'
  const url = `https://navestats.site/matchs/${id}`
  return {
    title: `${teamA} vs ${teamB}`,
    description: `Pronostiquez et analysez le match ${teamA} vs ${teamB} du ${m.date_match} à ${m.heure_match} — NavéStats`,
    alternates: { canonical: url },
    openGraph: {
      title: `${teamA} vs ${teamB} – NavéStats`,
      description: `Pronostiquez ${teamA} vs ${teamB} et gagnez des points !`,
      type: "article",
      url,
      siteName: "NavéStats",
      images: [
        {
          url: "/og.png",
          width: 1200,
          height: 630,
          alt: `NavéStats – ${teamA} vs ${teamB}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${teamA} vs ${teamB} – NavéStats`,
      description: `Pronostiquez ${teamA} vs ${teamB} et gagnez des points !`,
      images: ["/og.png"],
    },
  }
}

function FormeBar({ victoires, nuls, defaites, total }: { victoires: number, nuls: number, defaites: number, total: number }) {
  if (total === 0) return <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Aucune donnée</span>
  const pctV = (victoires / total) * 100
  const pctN = (nuls / total) * 100
  const pctD = (defaites / total) * 100
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <div style={{ display: 'flex', gap: 3, height: 9, borderRadius: 99, overflow: 'hidden', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-subtle)' }}>
        <div style={{ width: `${pctV}%`, background: 'var(--color-primary)', transition: 'width 0.6s ease' }} />
        <div style={{ width: `${pctN}%`, background: 'var(--color-accent)', transition: 'width 0.6s ease' }} />
        <div style={{ width: `${pctD}%`, background: 'var(--color-red)', transition: 'width 0.6s ease' }} />
      </div>
      <div style={{ display: 'flex', gap: 12, fontSize: '0.72rem', fontWeight: 700 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--color-text-secondary)' }}>
          <span style={{ width: 8, height: 8, borderRadius: 3, background: 'var(--color-primary)' }} /> V {victoires}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--color-text-secondary)' }}>
          <span style={{ width: 8, height: 8, borderRadius: 3, background: 'var(--color-accent)' }} /> N {nuls}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--color-text-secondary)' }}>
          <span style={{ width: 8, height: 8, borderRadius: 3, background: 'var(--color-red)' }} /> D {defaites}
        </span>
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TeamAvatar({ equipe }: { equipe: any }) {
  if (equipe?.logo_url) {
    return (
      <img src={equipe.logo_url} alt={equipe.nom}
        style={{ width: 36, height: 36, borderRadius: 12, objectFit: 'cover', border: '1px solid var(--color-border-subtle)', boxShadow: '0 3px 10px rgba(0,0,0,0.2)', flexShrink: 0 }}
      />
    )
  }
  return (
    <div style={{
      width: 36, height: 36, borderRadius: 12, flexShrink: 0,
      background: `linear-gradient(135deg, ${equipe?.couleur_principale || '#0dca6b'}, ${equipe?.couleur_secondaire || '#ffc94d'})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 13, fontWeight: 800, color: 'white',
      fontFamily: 'var(--font-plus-jakarta)',
      boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
    }}>
      {equipe?.sigle || equipe?.nom?.charAt(0)}
    </div>
  )
}

export default async function MatchDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: matchRaw } = await supabase
    .from('matchs')
    .select(`*, equipe_a:equipes!matchs_equipe_a_id_fkey(*), equipe_b:equipes!matchs_equipe_b_id_fkey(*)`)
    .eq('id', id)
    .single()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const match = matchRaw as any

  if (!match) {
    return (
      <div className="page-content">
        <div className="container-app" style={{ textAlign: 'center', paddingTop: 80 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(42,255,160,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <CalendarX size={24} color="var(--color-text-muted)" />
          </div>
          <h1 style={{ marginBottom: 8 }}>Match introuvable</h1>
          <Link href="/matchs" className="btn btn-primary" style={{ textDecoration: 'none' }}>Retour aux matchs</Link>
        </div>
      </div>
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const m = match as any
  const equipeA = m.equipe_a
  const equipeB = m.equipe_b

  // Fetch joueurs des deux équipes
  const { data: joueursA } = await supabase.from('joueurs').select('*').eq('equipe_id', equipeA.id).order('buts', { ascending: false })
  const { data: joueursB } = await supabase.from('joueurs').select('*').eq('equipe_id', equipeB.id).order('buts', { ascending: false })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let monPronostic: any = null
  if (user) {
    const { data } = await supabase.from('pronostics').select('*').eq('match_id', id).eq('user_id', user.id).single()
    monPronostic = data
  }

  // Historique des confrontations (matchs terminés entre ces 2 équipes)
  const { data: h2hMatchs } = await supabase
    .from('matchs')
    .select(`id, date_match, score_a, score_b, statut, equipe_a:equipes!matchs_equipe_a_id_fkey(id, nom, sigle, couleur_principale), equipe_b:equipes!matchs_equipe_b_id_fkey(id, nom, sigle, couleur_principale)`)
    .eq('statut', 'termine')
    .neq('id', id)
    .or(`and(equipe_a_id.eq.${equipeA.id},equipe_b_id.eq.${equipeB.id}),and(equipe_a_id.eq.${equipeB.id},equipe_b_id.eq.${equipeA.id})`)
    .order('date_match', { ascending: false })
    .limit(5)

  // Derniers matchs pour equipeA
  const { data: recentMatchsA } = await supabase
    .from('matchs')
    .select(`id, date_match, score_a, score_b, statut, equipe_a_id, equipe_b_id, equipe_a:equipes!matchs_equipe_a_id_fkey(nom, sigle), equipe_b:equipes!matchs_equipe_b_id_fkey(nom, sigle)`)
    .eq('statut', 'termine')
    .or(`equipe_a_id.eq.${equipeA.id},equipe_b_id.eq.${equipeA.id}`)
    .order('date_match', { ascending: false })
    .limit(5)

  // Derniers matchs pour equipeB
  const { data: recentMatchsB } = await supabase
    .from('matchs')
    .select(`id, date_match, score_a, score_b, statut, equipe_a_id, equipe_b_id, equipe_a:equipes!matchs_equipe_a_id_fkey(nom, sigle), equipe_b:equipes!matchs_equipe_b_id_fkey(nom, sigle)`)
    .eq('statut', 'termine')
    .or(`equipe_a_id.eq.${equipeB.id},equipe_b_id.eq.${equipeB.id}`)
    .order('date_match', { ascending: false })
    .limit(5)

  // Compte des pronostics pour l'estimation IA
  const { data: rawPronoCounts } = await supabase
    .from('pronostics')
    .select('resultat_predit')
    .eq('match_id', id)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pronosticsCounts = (rawPronoCounts || []) as any[]

  const totalProno = pronosticsCounts?.length || 0
  const pctA = totalProno > 0 ? Math.round(((pronosticsCounts?.filter(p => p.resultat_predit === 'equipe_a').length || 0) / totalProno) * 100) : null
  const pctNul = totalProno > 0 ? Math.round(((pronosticsCounts?.filter(p => p.resultat_predit === 'nul').length || 0) / totalProno) * 100) : null
  const pctB = totalProno > 0 ? Math.round(((pronosticsCounts?.filter(p => p.resultat_predit === 'equipe_b').length || 0) / totalProno) * 100) : null

  const isAvenir = match.statut === 'a_venir'

  // Fermeture des pronostics : 15 minutes avant le coup d'envoi
  let clotureAt: string | null = null
  if (isAvenir && m.date_match && m.heure_match) {
    const parts = String(m.heure_match).split(':').map(Number)
    const hours = parts[0] || 0
    const minutes = parts[1] || 0
    const base = new Date(`${m.date_match}T00:00:00`)
    if (!isNaN(base.getTime())) {
      const localStart = new Date(base.getFullYear(), base.getMonth(), base.getDate(), hours, minutes, 0)
      if (!isNaN(localStart.getTime())) {
        clotureAt = new Date(localStart.getTime() - 15 * 60 * 1000).toISOString()
      }
    }
  }

  return (
    <div className="page-content">
      <div className="container-app">
        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 20, fontSize: '0.82rem' }}>
          <Link href="/" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Accueil</Link>
          <span style={{ color: 'var(--color-text-muted)' }}>›</span>
          <Link href="/matchs" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Matchs</Link>
          <span style={{ color: 'var(--color-text-muted)' }}>›</span>
          <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
            {equipeA.nom} vs {equipeB.nom}
          </span>
        </div>

        {/* Match Hero Card en temps réel */}
        <MatchHeroClient initialMatch={m} />

        {/* Données structurées SportsEvent */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SportsEvent",
              name: `${equipeA.nom} vs ${equipeB.nom}`,
              startDate: m.date_match ? `${m.date_match}T${m.heure_match || "00:00"}:00` : undefined,
              location: {
                "@type": "Place",
                name: m.stade || "Khombole",
              },
              homeTeam: { "@type": "SportsTeam", name: equipeA.nom },
              awayTeam: { "@type": "SportsTeam", name: equipeB.nom },
              eventStatus: m.statut === "termine" ? "https://schema.org/EventScheduled" : "https://schema.org/EventScheduled",
              url: `https://navestats.site/matchs/${match.id}`,
            }),
          }}
        />

        {/* Content grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }} className="detail-grid">

          {/* Pronostic Form */}
          {isAvenir && (
            <PronosticForm
              matchId={match.id}
              equipeA={equipeA}
              equipeB={equipeB}
              joueursA={joueursA || []}
              joueursB={joueursB || []}
              userId={user?.id || null}
              existingPronostic={monPronostic}
              clotureAt={clotureAt}
            />
          )}

          {/* Pronostics de la communauté — visible par tous */}
          <AIEstimation
            equipeA={equipeA}
            equipeB={equipeB}
            pctA={pctA}
            pctNul={pctNul}
            pctB={pctB}
            totalProno={totalProno}
          />

          {/* Statistiques équipes */}
          <ScoreboardPanel
            title="Forme des équipes"
            icon={<BarChart3 size={14} color="var(--color-primary)" />}
            bodyStyle={{ padding: '18px 18px' }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }} className="team-stats-grid">
              {[
                { eq: equipeA, recent: recentMatchsA },
                { eq: equipeB, recent: recentMatchsB }
              ].map(({ eq, recent }) => (
                <div key={eq.id} style={{
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: 16,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <TeamAvatar equipe={eq} />
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'var(--font-plus-jakarta)' }}>
                      {eq.nom}
                    </div>
                  </div>

                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <FormeRecente teamId={eq.id} lastMatchs={(recent || []) as any[]} />

                  <FormeBar
                    victoires={eq.victoires}
                    nuls={eq.nuls}
                    defaites={eq.defaites}
                    total={eq.matchs_joues}
                  />
                  <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                    {[
                      { label: 'MJ', value: eq.matchs_joues },
                      { label: 'Pts', value: eq.points_classement },
                      { label: 'Buts +', value: eq.buts_marques },
                      { label: 'Buts –', value: eq.buts_encaisses },
                    ].map(s => (
                      <div key={s.label} style={{
                        background: 'var(--color-surface-card)',
                        border: '1px solid var(--color-border-subtle)',
                        borderRadius: 10,
                        padding: '9px 6px',
                        textAlign: 'center',
                      }}>
                        <div className="stat-number" style={{ fontSize: '1rem', color: 'var(--color-primary)' }}>{s.value}</div>
                        <div style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)', fontWeight: 600, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScoreboardPanel>

          {/* Historique confrontations */}
          <HeadToHead
            matchs={(h2hMatchs || []) as any} // eslint-disable-line @typescript-eslint/no-explicit-any
            equipeAId={equipeA.id}
            equipeBId={equipeB.id}
            equipeANom={equipeA.nom}
            equipeBNom={equipeB.nom}
          />

          {/* Push notification */}
          {isAvenir && (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <PushNotifButton
                matchId={match.id}
                matchLabel={`${equipeA.nom} vs ${equipeB.nom}`}
              />
            </div>
          )}

          {/* Partage pronostic */}
          {monPronostic && (
            <SharePronostic
              equipeA={equipeA.nom}
              equipeB={equipeB.nom}
              pronostic={monPronostic.resultat_predit as any} // eslint-disable-line @typescript-eslint/no-explicit-any
              dateMatch={match.date_match}
            />
          )}

          {/* Commentaires */}
          <CommentSection matchId={match.id} userId={user?.id || null} />
        </div>

        <style>{`
          @media (min-width: 1024px) {
            .detail-grid { grid-template-columns: 2fr 1fr !important; }
          }
          @media (min-width: 640px) {
            .team-stats-grid { grid-template-columns: 1fr 1fr !important; }
          }
        `}</style>
      </div>
    </div>
  )
}
