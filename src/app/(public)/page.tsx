import { createClient } from '@/lib/supabase/server'
import HeroSection from '@/components/home/HeroSection'
import MatchsDuJour from '@/components/home/MatchsDuJour'
import DerniersResultats from '@/components/home/DerniersResultats'
import Actualites from '@/components/home/Actualites'
import TopPronostiqueurs from '@/components/home/TopPronostiqueurs'

import ScrollReveal from '@/components/shared/ScrollReveal'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'NavéStats – Pronostics & Statistiques Navétanes Khombole 2026',
  description: 'La première plateforme communautaire de pronostics et statistiques des Navétanes de Khombole. Pronostiquez les matchs, gagnez des points et grimpez dans le classement. 17 équipes, scores en direct.',
  openGraph: {
    title: 'NavéStats – Pronostics Navétanes Khombole 2026',
    description: 'Plateforme communautaire de pronostics et statistiques. Rejoignez des milliers de pronostiqueurs !',
    url: 'https://navestats.site',
    siteName: 'NavéStats',
    images: [
      {
        url: 'https://navestats.site/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'NavéStats - Pronostics Navétanes Khombole',
      },
    ],
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NavéStats – Pronostics Navétanes Khombole',
    description: 'Rejoignez la communauté NavéStats et pronostiquez les matchs des Navétanes de Khombole',
    images: ['https://navestats.site/og-image.jpg'],
  },
}

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'NavéStats',
  description: 'Plateforme communautaire de pronostics et statistiques des Navétanes de Khombole',
  url: 'https://navestats.site',
  potentialMatch: {
    '@type': 'SportsEvent',
    name: 'Navétanes de Khombole 2026',
    sport: 'Football',
    location: {
      '@type': 'Place',
      name: 'Stade de Khombole',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Khombole',
        addressCountry: 'SN',
      },
    },
  },
  publisher: {
    '@type': 'Organization',
    name: 'NavéStats',
    url: 'https://navestats.site',
    logo: {
      '@type': 'ImageObject',
      url: 'https://navestats.site/logo.png',
    },
  },
  inLanguage: 'fr-FR',
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

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

  const { count: totalPronostiqueurs } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

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
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <HeroSection matchCount={displayMatchs.length} userCount={totalPronostiqueurs || 0} isAuthenticated={!!user} />

      <div className="container-app" style={{ paddingTop: 32 }}>

        {/* Raccourcis rapides (non connecté ou connecté) */}
        {!user && (
          <section className="home-action-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
            {[
              { href: '/matchs', icon: '🎯', label: 'Pronostiquer', detail: 'Choisir un match' },
              { href: '/statistiques', icon: '📊', label: 'Poules', detail: 'Classements ASC' },
              { href: '/classements', icon: '🏆', label: 'Top fans', detail: 'Rang général' },
              { href: '/communaute', icon: '💬', label: 'Communauté', detail: 'Discussions' },
            ].map(action => (
              <a key={action.href} href={action.href} className="home-action-card" style={{
                textDecoration: 'none',
                background: 'var(--color-surface-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 14,
                padding: 16,
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                minWidth: 0,
              }}>
                <span style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(0,98,51,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{action.icon}</span>
                <span style={{ minWidth: 0 }}>
                  <strong style={{ display: 'block', color: 'var(--color-text-primary)', fontFamily: 'var(--font-outfit)', fontSize: '0.9rem', lineHeight: 1.1 }}>{action.label}</strong>
                  <small style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>{action.detail}</small>
                </span>
              </a>
            ))}
          </section>
        )}

        {/* Raccourcis rapides connecté */}
        {user && (
          <section className="home-action-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
            {[
              { href: '/matchs', icon: '⚽', label: 'Matchs', detail: 'Pronostiquer' },
              { href: '/classements', icon: '🏆', label: 'Classements', detail: 'Voir mon rang' },
              { href: '/statistiques', icon: '📊', label: 'Poules', detail: 'Stats ASC' },
              { href: '/communaute', icon: '💬', label: 'Communauté', detail: 'Discussions' },
            ].map(action => (
              <a key={action.href} href={action.href} className="home-action-card" style={{
                textDecoration: 'none',
                background: 'var(--color-surface-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 14,
                padding: 16,
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                minWidth: 0,
              }}>
                <span style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(0,98,51,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{action.icon}</span>
                <span style={{ minWidth: 0 }}>
                  <strong style={{ display: 'block', color: 'var(--color-text-primary)', fontFamily: 'var(--font-outfit)', fontSize: '0.9rem', lineHeight: 1.1 }}>{action.label}</strong>
                  <small style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>{action.detail}</small>
                </span>
              </a>
            ))}
          </section>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 32 }}>
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
        @media (max-width: 760px) {
          .home-action-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          .home-action-card {
            padding: 12px !important;
          }
        }
      `}</style>
    </div>
  )
}
