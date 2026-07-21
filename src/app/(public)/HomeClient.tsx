'use client'

import HeroSection from '@/components/home/HeroSection'
import MatchsDuJour from '@/components/home/MatchsDuJour'
import DerniersResultats from '@/components/home/DerniersResultats'
import Actualites from '@/components/home/Actualites'
import TopPronostiqueurs from '@/components/home/TopPronostiqueurs'
import StatsDashboard from '@/components/home/StatsDashboard'
import ScrollReveal from '@/components/shared/ScrollReveal'

interface HomeClientProps {
  matchCount: number
  userCount: number
  isAuthenticated: boolean
  displayMatchs: any[]
  isToday: boolean
  topPronostiqueurs: any[]
  statsGlobales: any
}

export default function HomeClient({
  matchCount,
  userCount,
  isAuthenticated,
  displayMatchs,
  isToday,
  topPronostiqueurs,
  statsGlobales,
}: HomeClientProps) {
  return (
    <>
      <HeroSection matchCount={matchCount} userCount={userCount} isAuthenticated={isAuthenticated} />

      <div className="container-app" style={{ paddingTop: 32 }}>
        <ScrollReveal direction="up" delay={100}>
          <StatsDashboard
            topPronostiqueurs={topPronostiqueurs}
            topEquipes={[]}
            statsGlobales={statsGlobales}
          />
        </ScrollReveal>

        {!isAuthenticated && (
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

        {isAuthenticated && (
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
            <section id="matchs-section">
              <ScrollReveal direction="up" delay={0}>
                <MatchsDuJour matchs={displayMatchs} isToday={isToday || false} />
              </ScrollReveal>
            </section>

            <div style={{ display: 'grid', gap: 32 }} className="sidebar-grid">
              <section id="classement-section">
                <ScrollReveal direction="up" delay={80}>
                  <TopPronostiqueurs users={topPronostiqueurs || []} />
                </ScrollReveal>
              </section>

              {displayMatchs && displayMatchs.length > 0 && (
                <section id="resultats-section">
                  <ScrollReveal direction="up" delay={160}>
                    <DerniersResultats matchs={displayMatchs} />
                  </ScrollReveal>
                </section>
              )}

              <section id="actualites-section">
                <ScrollReveal direction="up" delay={240}>
                  <Actualites actualites={[]} />
                </ScrollReveal>
              </section>
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
    </>
  )
}