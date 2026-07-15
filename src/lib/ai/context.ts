import type { SupabaseClient } from '@supabase/supabase-js'

/** Charge un résumé live des données NavéStats pour le prompt de l'agent. */
export async function buildNavestatsContext(supabase: SupabaseClient): Promise<string> {
  const today = new Date().toISOString().split('T')[0]

  const [
    { data: equipes },
    { data: matchsAVenir },
    { data: matchsRecents },
    { data: topJoueurs },
    { data: topPronostiqueurs },
    { count: totalUsers },
    { count: totalPronos },
    { data: actualites },
  ] = await Promise.all([
    supabase
      .from('equipes')
      .select(
        'nom, sigle, quartier, asc_nom, matchs_joues, victoires, nuls, defaites, buts_marques, buts_encaisses, points_classement',
      )
      .order('points_classement', { ascending: false })
      .limit(16),
    supabase
      .from('matchs')
      .select(
        'date_match, heure_match, stade, phase, journee, statut, equipe_a:equipes!matchs_equipe_a_id_fkey(nom), equipe_b:equipes!matchs_equipe_b_id_fkey(nom)',
      )
      .eq('statut', 'a_venir')
      .order('date_match')
      .limit(8),
    supabase
      .from('matchs')
      .select(
        'date_match, score_a, score_b, stade, equipe_a:equipes!matchs_equipe_a_id_fkey(nom), equipe_b:equipes!matchs_equipe_b_id_fkey(nom)',
      )
      .eq('statut', 'termine')
      .order('date_match', { ascending: false })
      .limit(8),
    supabase
      .from('joueurs')
      .select('nom, prenom, poste, buts, passes_decisives, matchs_joues, equipe:equipes(nom)')
      .order('buts', { ascending: false })
      .limit(10),
    supabase
      .from('profiles')
      .select('username, points, total_pronostics, pronostics_corrects, quartier, asc_nom')
      .order('points', { ascending: false })
      .limit(8),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('pronostics').select('*', { count: 'exact', head: true }),
    supabase
      .from('actualites')
      .select('titre, categorie, est_publie, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const lines: string[] = [
    `Date du jour (UTC) : ${today}`,
    `Utilisateurs : ${totalUsers ?? 0} · Pronostics : ${totalPronos ?? 0}`,
    '',
    '### Classement équipes (top)',
  ]

  for (const e of (equipes || []) as any[]) {
    lines.push(
      `- ${e.nom}${e.sigle ? ` (${e.sigle})` : ''} | ${e.points_classement ?? 0} pts | ${e.victoires}V-${e.nuls}N-${e.defaites}D | BP ${e.buts_marques} BC ${e.buts_encaisses}${e.quartier ? ` | ${e.quartier}` : ''}${e.asc_nom ? ` | ASC ${e.asc_nom}` : ''}`,
    )
  }

  lines.push('', '### Prochains matchs')
  for (const m of (matchsAVenir || []) as any[]) {
    lines.push(
      `- ${m.date_match} ${String(m.heure_match || '').slice(0, 5)} | ${m.equipe_a?.nom ?? '?'} vs ${m.equipe_b?.nom ?? '?'} | ${m.stade || ''} | ${m.phase || ''} J${m.journee ?? ''}`,
    )
  }

  lines.push('', '### Derniers résultats')
  for (const m of (matchsRecents || []) as any[]) {
    lines.push(
      `- ${m.date_match} | ${m.equipe_a?.nom ?? '?'} ${m.score_a ?? '-'}–${m.score_b ?? '-'} ${m.equipe_b?.nom ?? '?'}`,
    )
  }

  lines.push('', '### Meilleurs buteurs')
  for (const j of (topJoueurs || []) as any[]) {
    const name = [j.prenom, j.nom].filter(Boolean).join(' ')
    lines.push(
      `- ${name} (${j.equipe?.nom ?? '?'}) — ${j.buts} buts, ${j.passes_decisives} passes · ${j.poste || '?'}`,
    )
  }

  lines.push('', '### Top pronostiqueurs')
  for (const u of (topPronostiqueurs || []) as any[]) {
    lines.push(
      `- @${u.username} — ${u.points} pts · ${u.pronostics_corrects}/${u.total_pronostics} corrects`,
    )
  }

  lines.push('', '### Dernières actualités')
  for (const a of (actualites || []) as any[]) {
    lines.push(
      `- [${a.categorie}] ${a.titre} (${a.est_publie ? 'publié' : 'brouillon'}) — ${a.created_at}`,
    )
  }

  return lines.join('\n')
}
