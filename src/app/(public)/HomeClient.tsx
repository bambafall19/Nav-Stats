'use client'

import Link from 'next/link'
import HeroSection from '@/components/home/HeroSection'
import MatchsDuJour from '@/components/home/MatchsDuJour'
import DerniersResultats from '@/components/home/DerniersResultats'
import Actualites from '@/components/home/Actualites'
import StatsDashboard from '@/components/home/StatsDashboard'
import TopPronostiqueurs from '@/components/home/TopPronostiqueurs'
import MatchAleUne from '@/components/home/MatchAleUne'
import CadetsDuJour from '@/components/home/CadetsDuJour'
import Partenaires from '@/components/home/Partenaires'
import ScrollReveal from '@/components/shared/ScrollReveal'
import { CalendarDays, MessageCircle, ShieldCheck, Trophy, BarChart3 } from 'lucide-react'
import type { Database } from '@/types/database.types'

type HomeMatch = Database['public']['Tables']['matchs']['Row'] & {
  equipe_a: Database['public']['Tables']['equipes']['Row']
  equipe_b: Database['public']['Tables']['equipes']['Row']
}
type HomeCadetEquipe = Pick<Database['public']['Tables']['equipes']['Row'],
  'id' | 'nom' | 'sigle' | 'logo_url' | 'couleur_principale' | 'couleur_secondaire'>
type HomeCadetMatch = Database['public']['Tables']['cadet_matchs']['Row'] & {
  equipe_a_info?: HomeCadetEquipe | null
  equipe_b_info?: HomeCadetEquipe | null
}
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
type HomeActualite = Database['public']['Tables']['actualites']['Row']
type HomePartenaire = Database['public']['Tables']['partenaires']['Row']

type HomeStats = {
  totalPronostics: number
  totalUtilisateurs: number
  totalMatchs: number
  totalPoints: number
}

type HomeEquipe = {
  nom: string
  sigle: string | null
  logo_url: string | null
  points_classement: number
  matchs_joues: number
  couleur_principale: string | null
  couleur_secondaire: string | null
}

type MonEspaceData = {
  profile: {
    id: string
    username: string
    full_name: string | null
    avatar_url: string | null
    points: number
    rang: number | null
    quartier: string | null
    total_pronostics: number
    pronostics_corrects: number
  }
  recentPronostics: Array<{
    id: string
    est_correct: boolean | null
    score_exact: boolean
    points_gagnes: number
    resultat_predit: string
    match: {
      id: string
      statut: string
      score_a: number | null
      score_b: number | null
      equipe_a: { nom: string | null; sigle: string | null } | null
      equipe_b: { nom: string | null; sigle: string | null } | null
    } | null
  }>
  pronosticsToMake: number
}

interface HomeClientProps {
  matchCount: number
  userCount: number
  isAuthenticated: boolean
  displayMatchs: HomeMatch[]
  derniersResultats: HomeMatch[]
  isToday: boolean
  topPronostiqueurs: HomePronostiqueur[]
  statsGlobales: HomeStats
  actualites: HomeActualite[]
  topEquipes: HomeEquipe[]
  displayCadets?: HomeCadetMatch[]
  cadetsToday?: boolean
  matchAleUne?: HomeMatch | null
  partenaires?: HomePartenaire[]
}

export default function HomeClient({
  matchCount,
  userCount,
  isAuthenticated,
  displayMatchs,
  derniersResultats = [],
  isToday,
  topPronostiqueurs,
  statsGlobales,
  actualites = [],
  topEquipes = [],
  displayCadets = [],
  cadetsToday = false,
  matchAleUne = null,
  partenaires = [],
}: HomeClientProps) {
  return (
    <div className="page-content">
      <div className="container-app">
        <HeroSection matchCount={matchCount} userCount={userCount} isAuthenticated={isAuthenticated} />

        <div className="home-flow" style={{ paddingTop: 10, paddingBottom: 24 }}>

        {/* Quick Actions — clean icon tiles, no photos */}
        <section className="quick-actions-section home-quick" style={{ marginBottom: 20 }}>
          <ScrollReveal direction="up" delay={0}>
            <div className="actions-strip" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 12,
            }}>
              {[
                { href: '/matchs', Icon: ShieldCheck, label: 'Matchs', color: '#2affa0', bg: 'linear-gradient(135deg, rgba(42,255,160,0.10), rgba(42,255,160,0.22))' },
                { href: '/matchs?cat=cadets', Icon: CalendarDays, label: 'Cadets', color: '#ffc94d', bg: 'linear-gradient(135deg, rgba(255,201,77,0.10), rgba(255,201,77,0.20))' },
                { href: '/classements', Icon: Trophy, label: 'Classement', color: '#ffd97d', bg: 'linear-gradient(135deg, rgba(255,201,77,0.14), rgba(255,201,77,0.26))' },
                { href: '/statistiques', Icon: BarChart3, label: 'Stats', color: '#4da6ff', bg: 'linear-gradient(135deg, rgba(77,166,255,0.14), rgba(77,166,255,0.24))' },
                { href: '/communaute', Icon: MessageCircle, label: 'Chat', color: '#ff4d5a', bg: 'linear-gradient(135deg, rgba(255,77,90,0.12), rgba(255,77,90,0.22))' },
              ].map((action) => (
                <Link key={action.href} href={action.href} className="action-tile" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 9,
                  height: 96,
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--color-surface-card)',
                  border: '1px solid var(--color-border-subtle)',
                  boxShadow: 'var(--shadow-card)',
                  textDecoration: 'none',
                  color: action.color,
                  cursor: 'pointer',
                  transition: 'all var(--transition-base) var(--ease-out)',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)'; e.currentTarget.style.borderColor = 'rgba(42,255,160,0.2)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-card)'; e.currentTarget.style.borderColor = 'var(--color-border-subtle)' }}
                >
                  <div style={{
                    width: 42, height: 42, borderRadius: 13,
                    background: action.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'transform var(--transition-base) var(--ease-spring)',
                  }}>
                    <action.Icon size={19} strokeWidth={2.2} />
                  </div>
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 700,
                    fontFamily: 'var(--font-plus-jakarta)',
                    color: 'var(--color-text-secondary)',
                    letterSpacing: '-0.01em',
                  }}>
                    {action.label}
                  </span>
                </Link>
              ))}
            </div>
          </ScrollReveal>
        </section>

        {/* Match à la une */}
        {matchAleUne && (
          <section className="home-featured" style={{ marginBottom: 16 }}>
            <ScrollReveal direction="up" delay={60}>
              <MatchAleUne match={matchAleUne} />
            </ScrollReveal>
          </section>
        )}

        {/* Stats Dashboard */}
        <ScrollReveal direction="up" delay={100}>
          <div style={{ marginBottom: 16 }} className="stats-dashboard-section home-stats">
            <StatsDashboard topEquipes={topEquipes} statsGlobales={statsGlobales} />
          </div>
        </ScrollReveal>

        {/* Main Content - Matchs + Sidebar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 12,
        }} className="main-home-grid">
          <section id="matchs-section">
            <ScrollReveal direction="up" delay={0}>
              <MatchsDuJour matchs={displayMatchs} isToday={isToday || false} />
            </ScrollReveal>
          </section>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 32,
          }} className={`home-sidebar${actualites.length > 0 ? '' : ' home-sidebar-single'}`}>
            {derniersResultats && derniersResultats.length > 0 && (
              <section id="resultats-section">
                <ScrollReveal direction="up" delay={80}>
                  <DerniersResultats matchs={derniersResultats} />
                </ScrollReveal>
              </section>
            )}
            {actualites.length > 0 && (
              <section id="actualites-section">
                <ScrollReveal direction="up" delay={240}>
                  <Actualites actualites={actualites} />
                </ScrollReveal>
              </section>
            )}
          </div>
        </div>

        {/* Matchs cadets du jour */}
        {displayCadets.length > 0 && (
          <section id="cadets-section" style={{ marginTop: 28 }}>
            <ScrollReveal direction="up" delay={0}>
              <CadetsDuJour matchs={displayCadets as HomeCadetMatch[]} isToday={cadetsToday} />
            </ScrollReveal>
          </section>
        )}

        {/* Top pronostiqueurs */}
        {topPronostiqueurs.length > 0 && (
          <section id="top-pros-section" style={{ marginTop: 28 }}>
            <ScrollReveal direction="up" delay={0}>
              <TopPronostiqueurs users={topPronostiqueurs as any[]} />
            </ScrollReveal>
          </section>
        )}

        {/* Partenaires */}
        {partenaires.length > 0 && (
          <section id="partenaires-section" style={{ marginTop: 28 }}>
            <ScrollReveal direction="up" delay={0}>
              <Partenaires partenaires={partenaires} />
            </ScrollReveal>
          </section>
        )}
      </div>
    </div>

    <style>{`
      @media (min-width: 1024px) {
        .home-sidebar:not(.home-sidebar-single) { grid-template-columns: 1fr 1fr !important; }
      }
      @media (max-width: 767px) {
        .home-flow {
          display: flex; flex-direction: column; gap: 0;
          padding-top: 14px !important; padding-bottom: 120px !important;
        }
        .main-home-grid { display: contents !important; }
        .home-sidebar { display: contents !important; }

        .home-quick { order: 1; margin-bottom: 12px !important; }
        .home-featured { order: 3; margin-bottom: 12px !important; }
        .home-stats { order: 5; margin-bottom: 12px !important; }
        #matchs-section { order: 4; margin-bottom: 12px !important; }
        #cadets-section { order: 6; margin-top: 0 !important; margin-bottom: 12px !important; }
        #top-pros-section { order: 7; margin-top: 0 !important; margin-bottom: 12px !important; }
        #partenaires-section { order: 10; margin-top: 0 !important; margin-bottom: 12px !important; }
        #resultats-section { order: 8; margin-bottom: 12px !important; }
        #actualites-section { order: 9; display: none; }

        .actions-strip {
          grid-template-columns: repeat(5, 1fr) !important;
          gap: 8px !important;
        }
        .action-tile {
          height: 82px !important;
        }
      }
      @media (max-width: 480px) {
        .actions-strip {
          grid-template-columns: repeat(3, 1fr) !important;
        }
      }
    `}</style>
    </div>
  )
}
