'use client'

import Link from 'next/link'
import HeroSection from '@/components/home/HeroSection'
import MatchsDuJour from '@/components/home/MatchsDuJour'
import DerniersResultats from '@/components/home/DerniersResultats'
import Actualites from '@/components/home/Actualites'
import StatsDashboard from '@/components/home/StatsDashboard'
import ScrollReveal from '@/components/shared/ScrollReveal'
import { CalendarDays, MessageCircle, ShieldCheck, Trophy, BarChart3 } from 'lucide-react'
import type { Database } from '@/types/database.types'

type HomeMatch = Database['public']['Tables']['matchs']['Row'] & {
  equipe_a: Database['public']['Tables']['equipes']['Row']
  equipe_b: Database['public']['Tables']['equipes']['Row']
}
type HomeCadetMatch = Record<string, unknown>
type HomePronostiqueur = {
  id: string
  username: string
  points: number
  total_pronostics: number
  pronostics_corrects: number
  rang: number
  accuracy: number
  avatar_url?: string
}

type HomeStats = {
  totalPronostics: number
  totalUtilisateurs: number
  totalMatchs: number
  totalPoints: number
}

interface HomeClientProps {
  matchCount: number
  userCount: number
  isAuthenticated: boolean
  displayMatchs: HomeMatch[]
  isToday: boolean
  topPronostiqueurs: HomePronostiqueur[]
  statsGlobales: HomeStats
  displayCadets?: HomeCadetMatch[]
  cadetsToday?: boolean
}

export default function HomeClient({
  matchCount,
  userCount,
  isAuthenticated,
  displayMatchs,
  isToday,
  topPronostiqueurs,
  statsGlobales,
  displayCadets = [],
  cadetsToday = false,
}: HomeClientProps) {
  const quickActions = [
    { href: '/matchs', Icon: ShieldCheck, title: 'Matchs', desc: 'Pronostiquer les matchs à venir', color: '#006233' },
    { href: '/cadets', Icon: CalendarDays, title: 'Cadets', desc: cadetsToday ? `${displayCadets.length} match(s) aujourd'hui` : 'Calendrier CNP 2026', color: '#7C3AED' },
    { href: '/classements', Icon: Trophy, title: 'Classements', desc: 'Voir le classement général', color: '#D97706' },
    { href: '/statistiques', Icon: BarChart3, title: 'Statistiques', desc: 'Poules et stats des équipes', color: '#1E40AF' },
    { href: '/communaute', Icon: MessageCircle, title: 'Communauté', desc: 'Discuter avec les fans', color: '#B91C1C' },
  ]

  return (
    <div className="page-content">
      <div className="container-app">
        {/* Hero Section with slideshow */}
        <HeroSection matchCount={matchCount} userCount={userCount} isAuthenticated={isAuthenticated} />

        <div className="home-flow" style={{ paddingTop: 10, paddingBottom: 24 }}>
        
        {/* Stats Dashboard - Full width card */}
        <ScrollReveal direction="up" delay={100}>
          <div style={{ marginBottom: 16 }} className="stats-dashboard-section">
            <StatsDashboard
              topPronostiqueurs={topPronostiqueurs}
              topEquipes={[]}
              statsGlobales={statsGlobales}
            />
          </div>
        </ScrollReveal>

        {/* Comment ça marche - Feature cards */}
        <section style={{ marginBottom: 20 }} className="hide-mobile">
          <ScrollReveal direction="up" delay={0}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <h2 style={{
                fontFamily: 'var(--font-outfit)',
                fontSize: 'clamp(1.3rem, 3.5vw, 1.7rem)',
                fontWeight: 800,
                color: 'var(--color-text-primary)',
                marginBottom: 4,
              }}>
                Comment ça marche ?
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.82rem', maxWidth: 360, margin: '0 auto' }}>
                Rejoignez des milliers de pronostiqueurs et testez vos connaissances
              </p>
            </div>
          </ScrollReveal>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 12,
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
                     padding: 'clamp(16px, 3vw, 24px)',
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
                       top: 12,
                       right: 12,
                       width: 28,
                       height: 28,
                       borderRadius: '50%',
                       background: feature.bgColor,
                       color: feature.color,
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       fontWeight: 900,
                       fontSize: '0.75rem',
                       fontFamily: 'var(--font-outfit)',
                     }}>
                       {feature.step}
                     </div>

                     <div style={{
                       width: 48,
                       height: 48,
                       borderRadius: 'var(--radius-md)',
                       background: feature.bgColor,
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       fontSize: '1.5rem',
                       marginBottom: 12,
                     }}>
                       {feature.emoji}
                     </div>

                     <h3 style={{
                       fontFamily: 'var(--font-outfit)',
                       fontSize: '1.1rem',
                       fontWeight: 700,
                       color: 'var(--color-text-primary)',
                       marginBottom: 6,
                     }}>
                       {feature.title}
                     </h3>

                     <p style={{
                       color: 'var(--color-text-secondary)',
                       fontSize: '0.82rem',
                       lineHeight: 1.5,
                       margin: 0,
                     }}>
                       {feature.description}
                     </p>
                   </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Quick Actions Grid - Moved first on mobile */}
        <section className="quick-actions-section" style={{ marginBottom: 12 }}>
          <ScrollReveal direction="up" delay={0}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 8,
            }}>
              {quickActions.map((action, i) => (
                <ScrollReveal key={action.href} direction="up" delay={i * 80}>
                  <Link
                    href={action.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      background: 'var(--color-surface-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      textDecoration: 'none',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                      e.currentTarget.style.borderColor = action.color
                    }}
                    onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                      e.currentTarget.style.borderColor = 'var(--color-border)'
                    }}
                  >
                    <div className="quick-action-icon" style={{
                      width: 36,
                      height: 36,
                      borderRadius: 'var(--radius-sm)',
                      background: `${action.color}14`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <action.Icon size={18} strokeWidth={2.5} color={action.color} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{
                        fontFamily: 'var(--font-outfit)',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        color: 'var(--color-text-primary)',
                        marginBottom: 1,
                      }}>
                        {action.title}
                      </div>
                      <div style={{
                        color: 'var(--color-text-muted)',
                        fontSize: '0.7rem',
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

        {/* Actualités horizontales - Mobile only */}
        <section className="mobile-actualites" style={{ marginBottom: 12 }}>
          <ScrollReveal direction="up" delay={0}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}>
              <h2 className="section-title" style={{ fontSize: '1rem', margin: 0 }}>
                📰 Actualités
              </h2>
              <Link href="/communaute" style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--color-primary)',
                textDecoration: 'none',
              }}>
                Voir tout →
              </Link>
            </div>
            <div style={{
              display: 'flex',
              gap: 8,
              overflowX: 'auto',
              paddingBottom: 6,
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
            }} className="actualites-scroll">
              {[
                { emoji: '🏆', title: 'CNP 2026', desc: 'La compétition bat son plein !' },
                { emoji: '⚽', title: 'Matchs du jour', desc: `${matchCount} rencontres à pronostiquer` },
                { emoji: '📊', title: 'Classement', desc: `${userCount} pronostiqueurs en lice` },
                { emoji: '🔥', title: 'Top pronostiqueurs', desc: 'Qui dominera cette semaine ?' },
              ].map((news, i) => (
                <Link
                  key={i}
                  href={news.emoji === '🏆' ? '/cadets' : news.emoji === '⚽' ? '/matchs' : news.emoji === '📊' ? '/classements' : '/classements'}
                  style={{
                    flexShrink: 0,
                    width: 170,
                    padding: '12px 14px',
                    background: 'var(--color-surface-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    textDecoration: 'none',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>{news.emoji}</div>
                  <div style={{
                    fontFamily: 'var(--font-outfit)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    color: 'var(--color-text-primary)',
                    marginBottom: 2,
                  }}>
                    {news.title}
                  </div>
                  <div style={{
                    fontSize: '0.68rem',
                    color: 'var(--color-text-muted)',
                    lineHeight: 1.3,
                  }}>
                    {news.desc}
                  </div>
                </Link>
              ))}
            </div>
          </ScrollReveal>
        </section>

        {/* Main Content - Matchs + Sidebar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 12,
        }} className="main-home-grid">
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

            {/* Actualités */}
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
          .home-sidebar {
            grid-template-columns: 1fr 1fr !important;
          }
        }
          @media (max-width: 767px) {
          .home-flow {
            display: flex;
            flex-direction: column;
            gap: 0;
            padding-top: 14px !important;
            padding-bottom: 120px !important;
          }
          .main-home-grid {
            display: contents !important;
          }
          .quick-actions-section {
            order: 1;
            margin-bottom: 10px !important;
          }
          .mobile-actualites {
            order: 2;
            display: block !important;
          }
          #matchs-section {
            order: 3;
            margin-bottom: 10px !important;
          }
          .stats-dashboard-section {
            order: 4;
            margin-bottom: 10px !important;
          }
          .home-sidebar {
            display: contents !important;
          }
          #classement-section {
            order: 5;
            margin-bottom: 10px !important;
          }
          #resultats-section {
            order: 6;
            margin-bottom: 10px !important;
          }
          #actualites-section {
            order: 7;
            display: none;
          }
          .actualites-scroll::-webkit-scrollbar {
            display: none;
          }
          .hide-mobile {
            display: none !important;
          }
          .section-title {
            font-size: 1rem !important;
            line-height: 1.1 !important;
          }
          .section-subtitle {
            font-size: 0.68rem !important;
          }
          .quick-actions-section > div > div {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 6px !important;
          }
          .quick-actions-section a {
            min-height: 56px;
            flex-direction: column;
            justify-content: center;
            gap: 2px !important;
            padding: 8px 8px !important;
            text-align: center;
            border-radius: 10px !important;
          }
          .quick-actions-section a > div:first-child {
            width: 28px !important;
            height: 28px !important;
            font-size: 0.85rem !important;
          }
          .quick-actions-section a > div:last-child {
            width: 100%;
          }
          .quick-actions-section a > div:last-child > div:first-child {
            font-size: 0.68rem !important;
            margin-bottom: 0 !important;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .quick-actions-section a > div:last-child > div:last-child {
            display: none;
          }
          #matchs-section,
          #classement-section,
          #resultats-section {
            margin-bottom: 8px !important;
          }
          .home-action-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          .home-action-card {
            padding: 10px !important;
          }
        }
      `}</style>
    </div>
  )
}
