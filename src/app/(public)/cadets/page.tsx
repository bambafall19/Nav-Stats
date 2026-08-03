import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { defaultCadetMatches, normalizeAscName, type CadetEquipe, type CadetMatch } from '@/lib/cadets'
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
        <div className="cadets-hero" style={{
          background: 'linear-gradient(135deg, #004d27 0%, #006233 50%, #00A651 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: 'clamp(14px, 4vw, 24px)',
          marginBottom: 12,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-green)',
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Title */}
            <h1 style={{
              color: 'white',
              fontFamily: 'var(--font-outfit)',
              fontSize: 'clamp(1.1rem, 4vw, 1.6rem)',
              fontWeight: 900,
              marginBottom: 2,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              textAlign: 'center',
            }}>
              Calendrier Cadets
            </h1>
            <p style={{
              color: 'rgba(255,255,255,0.85)',
              fontSize: 'clamp(0.7rem, 2vw, 0.85rem)',
              marginBottom: 10,
              textAlign: 'center',
            }}>
              CNP 2026 - Zone 06 de Khombole
            </p>

            {/* Stats Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 6,
            }}>
              <div style={{
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(10px)',
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(255,255,255,0.2)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '1rem', fontWeight: 900, fontFamily: 'var(--font-outfit)', color: 'white', lineHeight: 1 }}>
                  {cadetMatches.length}
                </div>
                <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.85)', fontWeight: 600, marginTop: 2 }}>
                  Matchs
                </div>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(10px)',
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(255,255,255,0.2)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '1rem', fontWeight: 900, fontFamily: 'var(--font-outfit)', color: 'white', lineHeight: 1 }}>
                  {journees.length}
                </div>
                <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.85)', fontWeight: 600, marginTop: 2 }}>
                  Journées
                </div>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(10px)',
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(255,255,255,0.2)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '1rem', fontWeight: 900, fontFamily: 'var(--font-outfit)', color: 'white', lineHeight: 1 }}>
                  {equipesList.length}
                </div>
                <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.85)', fontWeight: 600, marginTop: 2 }}>
                  Équipes
                </div>
              </div>
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