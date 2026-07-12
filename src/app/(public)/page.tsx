import { createClient } from '@/lib/supabase/server'
import HeroSection from '@/components/home/HeroSection'
import MatchsDuJour from '@/components/home/MatchsDuJour'
import ClassementTop from '@/components/home/ClassementTop'
import DerniersResultats from '@/components/home/DerniersResultats'
import Actualites from '@/components/home/Actualites'
import TopPronostiqueurs from '@/components/home/TopPronostiqueurs'
import ScrollReveal from '@/components/shared/ScrollReveal'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'NavéStats – Pronostics Navétanes Khombole | Accueil',
  description: 'Suivez les Navétanes de Khombole en temps réel. Pronostiquiez les matchs, gagnez des points et grimpez dans le classement communautaire !',
}

export default async function HomePage() {
  const supabase = await createClient()

  const today = new Date().toISOString().split('T')[0]

  // Matchs du jour
  const { data: matchsDuJour } = await supabase
    .from('matchs')
    .select(`*, equipe_a:equipes!matchs_equipe_a_id_fkey(*), equipe_b:equipes!matchs_equipe_b_id_fkey(*)`)
    .eq('date_match', today)
    .order('heure_match')

  // Derniers résultats (5 derniers matchs terminés)
  const { data: derniersResultats } = await supabase
    .from('matchs')
    .select(`*, equipe_a:equipes!matchs_equipe_a_id_fkey(*), equipe_b:equipes!matchs_equipe_b_id_fkey(*)`)
    .eq('statut', 'termine')
    .order('date_match', { ascending: false })
    .limit(5)

  // Prochains matchs (si pas de matchs aujourd'hui)
  const { data: prochainsMatchs } = await supabase
    .from('matchs')
    .select(`*, equipe_a:equipes!matchs_equipe_a_id_fkey(*), equipe_b:equipes!matchs_equipe_b_id_fkey(*)`)
    .eq('statut', 'a_venir')
    .gte('date_match', today)
    .order('date_match')
    .limit(6)

  // Top pronostiqueurs
  const { data: topPronostiqueurs } = await supabase
    .from('profiles')
    .select('*')
    .order('points', { ascending: false })
    .limit(10)

  // Actualités
  const { data: actualites } = await supabase
    .from('actualites')
    .select('*')
    .eq('est_publie', true)
    .order('created_at', { ascending: false })
    .limit(4)

  const displayMatchs = (matchsDuJour && matchsDuJour.length > 0) ? matchsDuJour : (prochainsMatchs || [])
  const isToday = matchsDuJour && matchsDuJour.length > 0

  return (
    <div className="page-content">
      {/* Hero */}
      <HeroSection matchCount={displayMatchs.length} />

      <div className="container-app" style={{ paddingTop: 32 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 32 }}>

          {/* Main content grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 32 }}>

            {/* Matchs du jour / Prochains matchs */}
            <section id="matchs-section">
              <ScrollReveal direction="up" delay={0}>
                <MatchsDuJour matchs={displayMatchs as any} isToday={isToday || false} />
              </ScrollReveal>
            </section>

            <div style={{ display: 'grid', gap: 32 }} className="sidebar-grid">
              {/* Classement Top 10 */}
              <section id="classement-section">
                <ScrollReveal direction="up" delay={80}>
                  <TopPronostiqueurs users={topPronostiqueurs || []} />
                </ScrollReveal>
              </section>

              {/* Derniers résultats */}
              {derniersResultats && derniersResultats.length > 0 && (
                <section id="resultats-section">
                  <ScrollReveal direction="up" delay={160}>
                    <DerniersResultats matchs={derniersResultats as any} />
                  </ScrollReveal>
                </section>
              )}

              {/* Actualités */}
              {actualites && actualites.length > 0 && (
                <section id="actualites-section">
                  <ScrollReveal direction="up" delay={240}>
                    <Actualites actualites={actualites as any} />
                  </ScrollReveal>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .sidebar-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
