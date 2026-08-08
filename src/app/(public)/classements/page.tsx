import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import Link from 'next/link'
import ClassementsClientWrapper from './ClassementsClientWrapper'
import type { AggregatedRow, RankedRow } from '@/components/classements/ClassementsClient'

export const metadata: Metadata = {
  title: 'Classements – NavéStats',
  description: 'Classement des pronostiqueurs, équipes et ASC des Navétanes de Khombole',
}

export const dynamic = 'force-dynamic'

export default async function ClassementsPage() {
  let classementGeneral: RankedRow[] = []
  let classementQuartier: AggregatedRow[] = []
  let classementASC: AggregatedRow[] = []
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

    classementGeneral = (rawClassement || []) as RankedRow[]

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
  } catch (error) {
    console.error('Classements page error:', error)
    fetchError = true
  }

  if (fetchError) {
    return (
      <div className="page-content">
        <div style={{
          width: '100%',
          maxWidth: 480,
          margin: '0 auto',
          padding: '0 16px',
          boxSizing: 'border-box',
        }}>
          <div style={{
            background: 'var(--gradient-hero)',
            borderRadius: 'var(--radius-xl)',
            padding: 'clamp(20px, 5vw, 32px)',
            marginBottom: 'clamp(20px, 5vw, 32px)',
            boxShadow: 'var(--shadow-green)',
          }}>
            <h1 style={{ color: 'white', fontSize: 'clamp(1.3rem, 5vw, 2rem)', fontFamily: 'var(--font-plus-jakarta)', fontWeight: 900, margin: 0 }}>
              🏆 Classements
            </h1>
          </div>
          <div style={{
            background: 'var(--color-surface-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: 'clamp(24px, 5vw, 32px)',
            textAlign: 'center',
            color: 'var(--color-text-muted)',
            boxShadow: 'var(--shadow-card)',
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
    <div className="page-content">
      <div style={{
        width: '100%',
        maxWidth: 480,
        margin: '0 auto',
        padding: '0 16px',
        boxSizing: 'border-box',
      }}>
        <ClassementsClientWrapper
          classementGeneral={classementGeneral}
          classementQuartier={classementQuartier}
          classementASC={classementASC}
        />
      </div>
    </div>
  )
}
