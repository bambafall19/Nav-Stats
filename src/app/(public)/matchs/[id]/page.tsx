import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'
import PronosticForm from '@/components/pronostics/PronosticForm'
import AIEstimation from '@/components/shared/AIEstimation'
import MatchAIAnalyst from '@/components/shared/MatchAIAnalyst'
import CommentSection from '@/components/communaute/CommentSection'
import HeadToHead from '@/components/matchs/HeadToHead'
import SharePronostic from '@/components/pronostics/SharePronostic'
import PushNotifButton from '@/components/shared/PushNotifButton'
import FormeRecente from '@/components/shared/FormeRecente'
import CountdownTimer from '@/components/shared/CountdownTimer'

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
  const m = match as any
  return {
    title: `${m.equipe_a?.nom} vs ${m.equipe_b?.nom} – NavéStats`,
    description: `Pronostiquez et analysez le match du ${m.date_match} à ${m.heure_match}`,
  }
}

function FormeBar({ victoires, nuls, defaites, total }: { victoires: number, nuls: number, defaites: number, total: number }) {
  if (total === 0) return <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Aucune donnée</span>
  const pctV = (victoires / total) * 100
  const pctN = (nuls / total) * 100
  const pctD = (defaites / total) * 100
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', gap: 2, height: 8, borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
        <div style={{ width: `${pctV}%`, background: 'var(--color-primary-light)', transition: 'width 0.6s ease' }} />
        <div style={{ width: `${pctN}%`, background: '#FBBF00', transition: 'width 0.6s ease' }} />
        <div style={{ width: `${pctD}%`, background: 'var(--color-red)', transition: 'width 0.6s ease' }} />
      </div>
      <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem', fontWeight: 600 }}>
        <span style={{ color: 'var(--color-primary)' }}>V {victoires}</span>
        <span style={{ color: '#7a5900' }}>N {nuls}</span>
        <span style={{ color: 'var(--color-red)' }}>D {defaites}</span>
      </div>
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

  const match = matchRaw as any

  if (!match) {
    return (
      <div className="page-content">
        <div className="container-app" style={{ textAlign: 'center', paddingTop: 80 }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>⚽</div>
          <h1 style={{ marginBottom: 8 }}>Match introuvable</h1>
          <Link href="/matchs" className="btn btn-primary" style={{ textDecoration: 'none' }}>Retour aux matchs</Link>
        </div>
      </div>
    )
  }

  const m = match as any
  const equipeA = m.equipe_a
  const equipeB = m.equipe_b

  // Fetch joueurs des deux équipes
  const { data: joueursA } = await supabase.from('joueurs').select('*').eq('equipe_id', equipeA.id).order('buts', { ascending: false })
  const { data: joueursB } = await supabase.from('joueurs').select('*').eq('equipe_id', equipeB.id).order('buts', { ascending: false })

  // Mon pronostic si connecté
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

  const pronosticsCounts = (rawPronoCounts || []) as any[]

  const totalProno = pronosticsCounts?.length || 0
  const pctA = totalProno > 0 ? Math.round(((pronosticsCounts?.filter(p => p.resultat_predit === 'equipe_a').length || 0) / totalProno) * 100) : null
  const pctNul = totalProno > 0 ? Math.round(((pronosticsCounts?.filter(p => p.resultat_predit === 'nul').length || 0) / totalProno) * 100) : null
  const pctB = totalProno > 0 ? Math.round(((pronosticsCounts?.filter(p => p.resultat_predit === 'equipe_b').length || 0) / totalProno) * 100) : null

  const isAvenir = match.statut === 'a_venir'
  const isDone = match.statut === 'termine'
  const isLive = match.statut === 'en_cours'

  return (
    <div className="page-content">
      <div className="container-app">
        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 24, fontSize: '0.85rem' }}>
          <Link href="/" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Accueil</Link>
          <span style={{ color: 'var(--color-text-muted)' }}>›</span>
          <Link href="/matchs" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Matchs</Link>
          <span style={{ color: 'var(--color-text-muted)' }}>›</span>
          <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
            {equipeA.nom} vs {equipeB.nom}
          </span>
        </div>

        {/* Match Hero Card */}
        <div style={{
          background: 'var(--gradient-hero)',
          borderRadius: 'var(--radius-xl)',
          padding: 'clamp(24px, 4vw, 48px)',
          marginBottom: 32,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'white\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M30 30m-8 0a8 8 0 1 0 16 0a8 8 0 1 0-16 0\'/%3E%3C/g%3E%3C/svg%3E")' }} />

          {/* Status */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            {isLive && <span className="status-live" style={{ display: 'inline-flex' }}>EN DIRECT</span>}
            {isDone && <span className="badge badge-gray" style={{ fontSize: '0.8rem' }}>Match Terminé</span>}
            {isAvenir && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'rgba(255,255,255,0.2)', borderRadius: 'var(--radius-full)', color: 'white', fontSize: '0.8rem', fontWeight: 600 }}>
                  📅 {new Date(match.date_match).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} à {match.heure_match?.slice(0,5)}
                </span>
                <CountdownTimer
                  targetDate={match.date_match}
                  targetTime={match.heure_match || '00:00'}
                />
              </div>
            )}
          </div>

          {/* Teams & Score */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center' }}>
            {/* Team A */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              {equipeA.logo_url ? (
                <img
                  src={equipeA.logo_url}
                  alt={equipeA.nom}
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 'var(--radius-lg)',
                    objectFit: 'cover',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  }}
                />
              ) : (
                <div style={{
                  width: 72, height: 72,
                  borderRadius: 'var(--radius-lg)',
                  background: `linear-gradient(135deg, ${equipeA.couleur_principale}, ${equipeA.couleur_secondaire})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', fontWeight: 900, color: 'white',
                  fontFamily: 'var(--font-outfit)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                }}>
                  {equipeA.sigle || equipeA.nom.charAt(0)}
                </div>
              )}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: 'clamp(0.9rem, 3vw, 1.2rem)', color: 'white', lineHeight: 1.2 }}>
                  {equipeA.nom}
                </div>
                {equipeA.asc_nom && (
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>{equipeA.asc_nom}</div>
                )}
              </div>
            </div>

            {/* Score / VS */}
            <div style={{ textAlign: 'center', minWidth: 100 }}>
              {isDone || isLive ? (
                <div style={{ fontFamily: 'var(--font-outfit)', fontSize: 'clamp(2.5rem, 8vw, 3.5rem)', fontWeight: 900, color: 'white', letterSpacing: '-0.04em', lineHeight: 1 }}>
                  {match.score_a} — {match.score_b}
                </div>
              ) : (
                <div>
                  <div style={{ fontFamily: 'var(--font-outfit)', fontSize: '2rem', fontWeight: 900, color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.02em' }}>VS</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>
                    📍 {match.stade}
                  </div>
                  {match.arbitre && (
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
                      🟡 Arb. {match.arbitre}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Team B */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              {equipeB.logo_url ? (
                <img
                  src={equipeB.logo_url}
                  alt={equipeB.nom}
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 'var(--radius-lg)',
                    objectFit: 'cover',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  }}
                />
              ) : (
                <div style={{
                  width: 72, height: 72,
                  borderRadius: 'var(--radius-lg)',
                  background: `linear-gradient(135deg, ${equipeB.couleur_principale}, ${equipeB.couleur_secondaire})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', fontWeight: 900, color: 'white',
                  fontFamily: 'var(--font-outfit)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                }}>
                  {equipeB.sigle || equipeB.nom.charAt(0)}
                </div>
              )}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: 'clamp(0.9rem, 3vw, 1.2rem)', color: 'white', lineHeight: 1.2 }}>
                  {equipeB.nom}
                </div>
                {equipeB.asc_nom && (
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>{equipeB.asc_nom}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }} className="detail-grid">

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

          {/* Analyste IA public — stats match + Grok */}
          <MatchAIAnalyst
            matchId={match.id}
            equipeANom={equipeA.nom}
            equipeBNom={equipeB.nom}
            statut={match.statut}
          />

          {/* Statistiques équipes */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20 }}>📊 Forme des équipes</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {[
                { eq: equipeA, recent: recentMatchsA },
                { eq: equipeB, recent: recentMatchsB }
              ].map(({ eq, recent }) => (
                <div key={eq.id}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 8, color: 'var(--color-text-primary)' }}>
                    {eq.nom}
                  </div>
                  
                  {/* Pastilles V/N/D */}
                  <FormeRecente teamId={eq.id} lastMatchs={(recent || []) as any[]} />

                  <FormeBar
                    victoires={eq.victoires}
                    nuls={eq.nuls}
                    defaites={eq.defaites}
                    total={eq.matchs_joues}
                  />
                  <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                      { label: 'MJ', value: eq.matchs_joues },
                      { label: 'Pts', value: eq.points_classement },
                      { label: '⚽', value: eq.buts_marques },
                      { label: '🥅', value: eq.buts_encaisses },
                    ].map(s => (
                      <div key={s.label} style={{
                        background: 'var(--color-surface)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '8px 10px',
                        textAlign: 'center',
                      }}>
                        <div className="stat-number" style={{ fontSize: '1.1rem' }}>{s.value}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Historique confrontations */}
          <HeadToHead
            matchs={(h2hMatchs || []) as any}
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
              pronostic={monPronostic.resultat_predit as any}
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
        `}</style>
      </div>
    </div>
  )
}
