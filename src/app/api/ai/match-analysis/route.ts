import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createXaiClient, XAI_MODEL } from '@/lib/ai/xai'
import { MATCH_ANALYST_SYSTEM } from '@/lib/ai/matchAnalyst'
import { checkRateLimit, clientKeyFromRequest } from '@/lib/ai/rateLimit'

export const runtime = 'nodejs'
export const maxDuration = 60

async function buildMatchContext(supabase: Awaited<ReturnType<typeof createClient>>, matchId: string) {
  const { data: matchRaw, error } = await supabase
    .from('matchs')
    .select(
      `*, equipe_a:equipes!matchs_equipe_a_id_fkey(*), equipe_b:equipes!matchs_equipe_b_id_fkey(*)`,
    )
    .eq('id', matchId)
    .single()

  if (error || !matchRaw) return null
  const match = matchRaw as any
  const equipeA = match.equipe_a
  const equipeB = match.equipe_b
  if (!equipeA || !equipeB) return null

  const [
    { data: joueursA },
    { data: joueursB },
    { data: h2h },
    { data: recentA },
    { data: recentB },
    { data: pronos },
  ] = await Promise.all([
    supabase
      .from('joueurs')
      .select('nom, prenom, poste, buts, passes_decisives, matchs_joues')
      .eq('equipe_id', equipeA.id)
      .order('buts', { ascending: false })
      .limit(6),
    supabase
      .from('joueurs')
      .select('nom, prenom, poste, buts, passes_decisives, matchs_joues')
      .eq('equipe_id', equipeB.id)
      .order('buts', { ascending: false })
      .limit(6),
    supabase
      .from('matchs')
      .select(
        'date_match, score_a, score_b, equipe_a_id, equipe_b_id, equipe_a:equipes!matchs_equipe_a_id_fkey(nom), equipe_b:equipes!matchs_equipe_b_id_fkey(nom)',
      )
      .eq('statut', 'termine')
      .neq('id', matchId)
      .or(
        `and(equipe_a_id.eq.${equipeA.id},equipe_b_id.eq.${equipeB.id}),and(equipe_a_id.eq.${equipeB.id},equipe_b_id.eq.${equipeA.id})`,
      )
      .order('date_match', { ascending: false })
      .limit(5),
    supabase
      .from('matchs')
      .select(
        'date_match, score_a, score_b, equipe_a_id, equipe_b_id, equipe_a:equipes!matchs_equipe_a_id_fkey(nom), equipe_b:equipes!matchs_equipe_b_id_fkey(nom)',
      )
      .eq('statut', 'termine')
      .or(`equipe_a_id.eq.${equipeA.id},equipe_b_id.eq.${equipeA.id}`)
      .order('date_match', { ascending: false })
      .limit(5),
    supabase
      .from('matchs')
      .select(
        'date_match, score_a, score_b, equipe_a_id, equipe_b_id, equipe_a:equipes!matchs_equipe_a_id_fkey(nom), equipe_b:equipes!matchs_equipe_b_id_fkey(nom)',
      )
      .eq('statut', 'termine')
      .or(`equipe_a_id.eq.${equipeB.id},equipe_b_id.eq.${equipeB.id}`)
      .order('date_match', { ascending: false })
      .limit(5),
    supabase.from('pronostics').select('resultat_predit').eq('match_id', matchId),
  ])

  const pronoList = (pronos || []) as { resultat_predit: string }[]
  const total = pronoList.length
  const count = (k: string) => pronoList.filter((p) => p.resultat_predit === k).length
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : null)

  const fmtTeam = (e: any) =>
    `${e.nom}${e.sigle ? ` (${e.sigle})` : ''} | ${e.points_classement ?? 0} pts | ${e.victoires}V-${e.nuls}N-${e.defaites}D | MJ ${e.matchs_joues} | BP ${e.buts_marques} BC ${e.buts_encaisses}${e.quartier ? ` | ${e.quartier}` : ''}${e.asc_nom ? ` | ASC ${e.asc_nom}` : ''}`

  const fmtMatch = (m: any) => {
    const a = m.equipe_a?.nom ?? '?'
    const b = m.equipe_b?.nom ?? '?'
    return `${m.date_match}: ${a} ${m.score_a ?? '-'}–${m.score_b ?? '-'} ${b}`
  }

  const fmtJoueur = (j: any) => {
    const name = [j.prenom, j.nom].filter(Boolean).join(' ')
    return `${name} (${j.poste || '?'}) — ${j.buts} buts, ${j.passes_decisives} passes, ${j.matchs_joues} MJ`
  }

  const lines = [
    `Match ID: ${match.id}`,
    `Statut: ${match.statut}`,
    `Date: ${match.date_match} ${String(match.heure_match || '').slice(0, 5)}`,
    `Stade: ${match.stade || '?'}`,
    `Phase: ${match.phase || '?'} · Journée: ${match.journee ?? '?'}`,
    match.arbitre ? `Arbitre: ${match.arbitre}` : null,
    match.statut === 'termine' || match.statut === 'en_cours'
      ? `Score: ${match.score_a ?? '?'} – ${match.score_b ?? '?'}`
      : 'Score: non joué',
    match.buteurs_a?.length ? `Buteurs A: ${match.buteurs_a.join(', ')}` : null,
    match.buteurs_b?.length ? `Buteurs B: ${match.buteurs_b.join(', ')}` : null,
    '',
    `### Équipe A`,
    fmtTeam(equipeA),
    '',
    `### Équipe B`,
    fmtTeam(equipeB),
    '',
    '### Joueurs A (top buteurs)',
    ...((joueursA || []) as any[]).map((j) => `- ${fmtJoueur(j)}`),
    '',
    '### Joueurs B (top buteurs)',
    ...((joueursB || []) as any[]).map((j) => `- ${fmtJoueur(j)}`),
    '',
    '### Derniers matchs A',
    ...((recentA || []) as any[]).map((m) => `- ${fmtMatch(m)}`),
    '',
    '### Derniers matchs B',
    ...((recentB || []) as any[]).map((m) => `- ${fmtMatch(m)}`),
    '',
    '### H2H (derniers)',
    ...((h2h || []) as any[]).map((m) => `- ${fmtMatch(m)}`),
    '',
    '### Pronostics communauté',
    total
      ? `Total: ${total} · ${equipeA.nom}: ${pct(count('equipe_a'))}% · Nul: ${pct(count('nul'))}% · ${equipeB.nom}: ${pct(count('equipe_b'))}%`
      : 'Aucun pronostic pour l’instant',
  ].filter((x) => x !== null) as string[]

  return {
    context: lines.join('\n'),
    meta: {
      equipeA: equipeA.nom as string,
      equipeB: equipeB.nom as string,
      statut: match.statut as string,
      date_match: match.date_match as string,
    },
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const body = await req.json().catch(() => ({}))
    const matchId = typeof body?.matchId === 'string' ? body.matchId : ''
    const question =
      typeof body?.question === 'string' ? body.question.slice(0, 500).trim() : ''

    if (!matchId || matchId.length > 80) {
      return NextResponse.json({ error: 'matchId requis' }, { status: 400 })
    }

    // Rate limit: connecté 20/heure, anonyme 6/heure
    const key = clientKeyFromRequest(req, user?.id)
    const limit = user ? 20 : 6
    const rl = checkRateLimit(`match-ai:${key}`, limit, 60 * 60 * 1000)
    if (!rl.ok) {
      return NextResponse.json(
        {
          error: `Trop de requêtes. Réessaie dans ~${rl.retryAfterSec}s.`,
          retryAfterSec: rl.retryAfterSec,
        },
        { status: 429 },
      )
    }

    // Limite par match+client (évite spam sur le même match)
    const perMatch = checkRateLimit(`match-ai:${key}:${matchId}`, user ? 8 : 3, 60 * 60 * 1000)
    if (!perMatch.ok) {
      return NextResponse.json(
        {
          error: `Limite atteinte pour ce match. Réessaie dans ~${perMatch.retryAfterSec}s.`,
          retryAfterSec: perMatch.retryAfterSec,
        },
        { status: 429 },
      )
    }

    const built = await buildMatchContext(supabase, matchId)
    if (!built) {
      return NextResponse.json({ error: 'Match introuvable' }, { status: 404 })
    }

    const userPrompt = question
      ? `Question de l'utilisateur sur ce match : ${question}\n\nRéponds de façon ciblée (120–200 mots), toujours en te basant sur les données.\n\n## Données match\n${built.context}`
      : `Analyse ce match pour les utilisateurs NavéStats.\n\n## Données match\n${built.context}`

    const client = createXaiClient()
    const response = await client.responses.create({
      model: XAI_MODEL,
      input: [
        { role: 'system', content: MATCH_ANALYST_SYSTEM },
        { role: 'user', content: userPrompt },
      ],
    })

    const analysis = response.output_text?.trim() || ''
    if (!analysis) {
      return NextResponse.json({ error: 'Réponse vide du modèle' }, { status: 502 })
    }

    return NextResponse.json({
      analysis,
      model: XAI_MODEL,
      meta: built.meta,
      authenticated: Boolean(user),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur serveur'
    const status = message.includes('XAI_API_KEY') ? 503 : 500
    console.error('[api/ai/match-analysis]', message)
    return NextResponse.json({ error: message }, { status })
  }
}
