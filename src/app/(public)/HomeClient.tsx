'use client'

import Link from 'next/link'
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
      {/* Hero Section with slideshow */}
      <HeroSection matchCount={matchCount} userCount={userCount} isAuthenticated={isAuthenticated} />

      <div className="container-app" style={{ paddingTop: 48, paddingBottom: 64 }}>
        
        {/* Stats Dashboard - Full width card */}
        <ScrollReveal direction="up" delay={100}>
          <div style={{ marginBottom: 48 }}>
            <StatsDashboard
              topPronostiqueurs={topPronostiqueurs}
              topEquipes={[]}
              statsGlobales={statsGlobales}
            />
          </div>
        </ScrollReveal>

        {/* Comment ça marche - Feature cards */}
        <section style={{ marginBottom: 56 }} className="hide-mobile">
          <ScrollReveal direction="up" delay={0}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h2 style={{
                fontFamily: 'var(--font-outfit)',
                fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
                fontWeight: 800,
                color: 'var(--color-text-primary)',
                marginBottom: 8,
              }}>
                Comment ça marche ?
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', maxWidth: 500, margin: '0 auto' }}>
                Rejoignez des milliers de pronostiqueurs et testez vos connaissances
              </p>
            </div>
          </ScrollReveal>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
          }}>
            {[
              {
                step: '1',
                title: 'Créez votre compte',
                description: 'Inscription gratuite en 30 secondes. Rejoignez la communauté des fans de football.',
                emoji: '👋',
                color: '#006233',
                bgColor: 'rgba(0,98,51,0.06)',
              },
              {
                step: '2',
                title: 'Pronostiquez',
                description: 'Choisissez vos matchs, prédisez les scores exacts et les joueurs clés.',
                emoji: '🎯',
                color: '#1E40AF',
                bgColor: 'rgba(30,64,175,0.06)',
              },
              {
                step: '3',
                title: 'Gagnez des points',
                description: 'Plus votre pronostic est précis, plus vous gagnez de points. Grimpez dans le classement.',
                emoji: '🏆',
                color: '#D97706',
                bgColor: 'rgba(217,119,6,0.06)',
              },
            ].map((feature, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 100}>
                <div style={{
                  background: 'var(--color-surface-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'clamp(24px, 4vw, 32px)',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                }}
                >
                  {/* Step badge */}
                  <div style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: feature.bgColor,
                    color: feature.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '0.85rem',
                    fontFamily: 'var(--font-outfit)',
                  }}>
                    {feature.step}
                  </div>

                  <div style={{
                    width: 64,
                    height: 64,
                    borderRadius: 'var(--radius-lg)',
                    background: feature.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    marginBottom: 20,
                  }}>
                    {feature.emoji}
                  </div>

                  <h3 style={{
                    fontFamily: 'var(--font-outfit)',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                    marginBottom: 8,
                  }}>
                    {feature.title}
                  </h3>

                  <p style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    margin: 0,
                  }}>
                    {feature.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Quick Actions Grid */}
        <section style={{ marginBottom: 48 }}>
          <ScrollReveal direction="up" delay={0}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 16,
            }}>
              {[
                { href: '/matchs', icon: '⚽', title: 'Matchs', desc: 'Pronostiquer les matchs à venir', color: '#006233' },
                { href: '/classements', icon: '🏆', title: 'Classements', desc: 'Voir le classement général', color: '#D97706' },
                { href: '/statistiques', icon: '📊', title: 'Statistiques', desc: 'Poules et stats des équipes', color: '#1E40AF' },
                { href: '/communaute', icon: '💬', title: 'Communauté', desc: 'Discuter avec les fans', color: '#B91C1C' },
              ].map((action, i) => (
                <ScrollReveal key={action.href} direction="up" delay={i * 80}>
                  <Link
                    href={action.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: 'clamp(16px, 3vw, 20px)',
                      background: 'var(--color-surface-card)',
                      border: '1.5px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      textDecoration: 'none',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'all 0.25s ease',
                    }}
                    onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                      e.currentTarget.style.transform = 'translateY(-3px)'
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                      e.currentTarget.style.borderColor = action.color
                    }}
                    onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                      e.currentTarget.style.borderColor = 'var(--color-border)'
                    }}
                  >
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: 'var(--radius-md)',
                      background: `${action.color}14`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      flexShrink: 0,
                    }}>
                      {action.icon}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{
                        fontFamily: 'var(--font-outfit)',
                        fontWeight: 700,
                        fontSize: '1rem',
                        color: 'var(--color-text-primary)',
                        marginBottom: 2,
                      }}>
                        {action.title}
                      </div>
                      <div style={{
                        color: 'var(--color-text-muted)',
                        fontSize: '0.8rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {action.desc}
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </ScrollReveal>
        </section>

        {/* Main Content - Matchs + Sidebar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 32,
        }}>
          {/* Matchs du jour section */}
          <section id="matchs-section">
            <ScrollReveal direction="up" delay={0}>
              <MatchsDuJour matchs={displayMatchs} isToday={isToday || false} />
            </ScrollReveal>
          </section>

          {/* Sidebar content */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 32,
          }} className="home-sidebar">
            {/* Derniers résultats */}
            {displayMatchs && displayMatchs.length > 0 && (
              <section id="resultats-section">
                <ScrollReveal direction="up" delay={80}>
                  <DerniersResultats matchs={displayMatchs} />
                </ScrollReveal>
              </section>
            )}

            {/* Top pronostiqueurs */}
            <section id="classement-section">
              <ScrollReveal direction="up" delay={160}>
                <TopPronostiqueurs users={topPronostiqueurs || []} />
              </ScrollReveal>
            </section>

            {/* Actualités */}
            <section id="actualites-section">
              <ScrollReveal direction="up" delay={240}>
                <Actualites actualites={[]} />
              </ScrollReveal>
            </section>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .home-sidebar {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 767px) {
          .hide-mobile {
            display: none !important;
          }
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