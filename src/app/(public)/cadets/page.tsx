import type { Metadata } from 'next'
import { CalendarDays, Trophy, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { defaultCadetMatches, type CadetEquipe, type CadetMatch } from '@/lib/cadets'
import CadetsClient from '@/components/cadets/CadetsClient'

export const metadata: Metadata = {
  title: 'Calendrier Cadets CNP 2026 | NavéStats',
  description: 'Calendrier officiel des rencontres CNP 2026, catégorie cadette, Zone 06 de Khombole.',
  openGraph: {
    title: 'Calendrier Cadets CNP 2026',
    description: 'Toutes les rencontres cadettes CNP 2026 de la Zone 06 de Khombole.',
    url: 'https://navestats.site/cadets',
    siteName: 'NavéStats',
    type: 'website',
    locale: 'fr_FR',
  },
}

export const dynamic = 'force-dynamic'

export default async function CadetsPage() {
  const supabase = await createClient()
  const [{ data: dbCadets, error }, { data: equipes }] = await Promise.all([
    supabase
      .from('cadet_matchs')
      .select(`
        id, journee, date_match, poule, equipe_a_id, equipe_b_id, equipe_a, equipe_b, terrain, ordre,
        equipe_a_info:equipes!cadet_matchs_equipe_a_id_fkey(id, nom, sigle, logo_url, couleur_principale, couleur_secondaire, quartier, asc_nom),
        equipe_b_info:equipes!cadet_matchs_equipe_b_id_fkey(id, nom, sigle, logo_url, couleur_principale, couleur_secondaire, quartier, asc_nom)
      `)
      .order('journee')
      .order('date_match')
      .order('ordre'),
    supabase
      .from('equipes')
      .select('id, nom, sigle, logo_url, couleur_principale, couleur_secondaire, quartier, asc_nom')
      .order('nom'),
  ])

  const cadetMatches = !error && dbCadets?.length ? dbCadets as CadetMatch[] : defaultCadetMatches
  const journees = [...new Set(cadetMatches.map(match => match.journee))]
  const equipesList: CadetEquipe[] = (equipes || [])

  return (
    <div className="page-content">
      <div className="container-app">
        {/* Hero Section */}
        <div className="hero-gradient" style={{
          borderRadius: 'var(--radius-xl)',
          padding: 'clamp(16px, 4vw, 28px)',
          marginBottom: 12,
          boxShadow: 'var(--shadow-green)',
          border: '1px solid rgba(42,255,160,0.14)',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -20, width: 160, height: 160, borderRadius: '50%', background: 'rgba(42,255,160,0.08)', filter: 'blur(20px)' }} />
          <div style={{ position: 'absolute', bottom: -48, left: -24, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,201,77,0.12)', filter: 'blur(24px)' }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            {/* Badge */}
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,201,77,0.12)',
              border: '1px solid rgba(255,201,77,0.3)',
              color: 'var(--color-accent)',
              fontSize: '0.62rem', fontWeight: 800,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              padding: '5px 14px', borderRadius: 'var(--radius-full)',
              fontFamily: 'var(--font-plus-jakarta)',
              marginBottom: 10,
            }}>
              <Trophy size={12} />
              CNP 2026 · Zone 06 de Khombole
            </span>

            {/* Title */}
            <h1 style={{
              color: 'white',
              fontFamily: 'var(--font-plus-jakarta)',
              fontSize: 'clamp(1.2rem, 4.5vw, 1.8rem)',
              fontWeight: 900,
              marginBottom: 4,
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
            }}>
              Calendrier <span className="glow-text">Cadets</span>
            </h1>
            <p style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: 'clamp(0.7rem, 2vw, 0.85rem)',
              marginBottom: 14,
            }}>
              Toutes les rencontres de la catégorie cadette, jour par jour
            </p>

            {/* Stats Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 8,
              width: '100%',
              maxWidth: 520,
            }}>
              {[
                { icon: CalendarDays, value: cadetMatches.length, label: 'Matchs' },
                { icon: Trophy, value: journees.length, label: 'Journées' },
                { icon: Users, value: equipesList.length, label: 'Équipes' },
              ].map(({ icon: Icon, value, label }, i) => (
                <div key={label} style={{
                  background: 'rgba(255,255,255,0.07)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  padding: '10px 6px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  transition: 'all 0.25s ease',
                }}>
                  <Icon size={15} color={i === 1 ? 'var(--color-accent)' : 'var(--color-primary)'} />
                  <div style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)', fontWeight: 900, fontFamily: 'var(--font-plus-jakarta)', color: 'white', lineHeight: 1 }}>
                    {value}
                  </div>
                  <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.75)', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cadets Client with filters */}
        <CadetsClient
          cadetMatches={cadetMatches}
          equipesList={equipesList}
          journees={journees}
        />
      </div>
    </div>
  )
}