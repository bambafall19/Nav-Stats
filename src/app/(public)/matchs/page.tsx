import { createClient } from '@/lib/supabase/server'
import MatchListClient from '@/components/matchs/MatchListClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Matchs & Calendrier – NavéStats',
  description: 'Tous les matchs des Navétanes de Khombole. Consultez le calendrier officiel, le tirage des poules et pronostiquez avant le coup d\'envoi.',
}

export default async function MatchsPage() {
  const supabase = await createClient()

  // Fetch all matches with team data
  const { data: rawMatchs } = await supabase
    .from('matchs')
    .select(`*, equipe_a:equipes!matchs_equipe_a_id_fkey(*), equipe_b:equipes!matchs_equipe_b_id_fkey(*)`)
    .order('date_match', { ascending: true })
    .order('heure_match', { ascending: true })

  const matchs = (rawMatchs || []) as any[]

  return (
    <div className="page-content">
      <div className="container-app">
        <div style={{ marginBottom: 32 }}>
          <h1 className="section-title" style={{ fontSize: '2.2rem', marginBottom: 4, fontFamily: 'var(--font-outfit)' }}>
            ⚽ Calendrier des Matchs
          </h1>
          <p className="section-subtitle">
            Calendrier officiel des phases de poules des Navétanes Zone 6 de Khombole
          </p>
        </div>

        <MatchListClient initialMatchs={matchs} />
      </div>
    </div>
  )
}
