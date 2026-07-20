import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ClassementsClient } from '@/components/classements/ClassementsClient'

export const metadata: Metadata = {
  title: 'Classements – NavéStats',
  description: 'Classement des pronostiqueurs, équipes et ASC des Navétanes de Khombole',
}

export default async function ClassementsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let classementGeneral: any[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let classementQuartier: any[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let classementASC: any[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let equipesRanked: any[] = []
  let fetchError = false

  try {
    const supabase = await createClient()

    // Fetch classement général
    const { data: rawClassement, error: classementError } = await supabase
      .from('profiles')
      .select('*')
      .order('points', { ascending: false })
      .limit(50)

    if (classementError) {
      console.error('Classement error:', classementError)
    }

    classementGeneral = (rawClassement || []) as any[]

    // Classement par quartier
    const quartiersMap: Record<string, { points: number; membres: number }> = {}
    classementGeneral.forEach(u => {
      if (u?.quartier) {
        if (!quartiersMap[u.quartier]) quartiersMap[u.quartier] = { points: 0, membres: 0 }
        quartiersMap[u.quartier].points += u.points || 0
        quartiersMap[u.quartier].membres++
      }
    })
    classementQuartier = Object.entries(quartiersMap)
      .map(([q, v]) => ({ quartier: q, ...v }))
      .sort((a, b) => b.points - a.points)

    // Fetch équipes
    const { data: equipes, error: equipesError } = await supabase
      .from('equipes')
      .select('nom, logo_url, asc_nom, couleur_principale, couleur_secondaire, sigle')

    if (equipesError) {
      console.error('Équipes error:', equipesError)
    }

    const equipeByAsc: Record<string, any> = {}
    ;(equipes || []).forEach((eq: any) => {
      if (eq?.asc_nom && !equipeByAsc[eq.asc_nom]) equipeByAsc[eq.asc_nom] = eq
    })

    // Classement par ASC
    const ascMap: Record<string, { points: number; membres: number }> = {}
    classementGeneral.forEach(u => {
      if (u?.asc_nom) {
        if (!ascMap[u.asc_nom]) ascMap[u.asc_nom] = { points: 0, membres: 0 }
        ascMap[u.asc_nom].points += u.points || 0
        ascMap[u.asc_nom].membres++
      }
    })
    classementASC = Object.entries(ascMap)
      .map(([asc, v]) => ({ asc, ...v }))
      .sort((a, b) => b.points - a.points)

    // Fetch équipes classement
    const { data: rawEquipes, error: equipesClassementError } = await supabase
      .from('equipes')
      .select('*')
      .order('points_classement', { ascending: false })

    if (equipesClassementError) {
      console.error('Équipes classement error:', equipesClassementError)
    }

    equipesRanked = (rawEquipes || []) as any[]
  } catch (error) {
    console.error('Classements page error:', error)
    fetchError = true
  }

  if (fetchError) {
    return (
      <div className="page-content">
        <div className="container-app">
          <div style={{
            background: 'linear-gradient(135deg, #004d27 0%, #006233 50%, #008a44 100%)',
            borderRadius: 'clamp(16px, 4vw, 24px)',
            padding: 'clamp(20px, 5vw, 32px)',
            marginBottom: 'clamp(20px, 5vw, 32px)',
          }}>
            <h1 style={{ color: 'white', fontSize: 'clamp(1.3rem, 5vw, 2rem)', fontFamily: 'var(--font-outfit)', fontWeight: 900, margin: 0 }}>
              🏆 Classements
            </h1>
          </div>
          <div style={{
            background: 'var(--color-surface-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'clamp(12px, 3vw, 16px)',
            padding: 'clamp(24px, 5vw, 32px)',
            textAlign: 'center',
            color: 'var(--color-text-muted)',
          }}>
            <p>Une erreur s&apos;est produite lors du chargement des classements. Veuillez réessayer dans quelques instants.</p>
            <Link href="/" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>
              &larr; Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ClassementsClient
      classementGeneral={classementGeneral}
      classementQuartier={classementQuartier}
      classementASC={classementASC}
      equipesRanked={equipesRanked}
    />
  )
}
