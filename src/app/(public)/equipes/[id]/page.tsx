import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { EquipeClient } from '@/components/equipes/EquipeClient'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await supabase.from('equipes').select('nom').eq('id', id).single() as any
  return {
    title: `${data?.nom || 'Equipe'} - NavéStats`,
    description: `Statistiques et résultats de l'équipe ${data?.nom || ''} sur NavéStats.`,
  }
}

export default async function EquipePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: equipe } = await supabase.from('equipes').select('*').eq('id', id).single()

  if (!equipe) notFound()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const eq = equipe as any
  const stats = {
    name: eq.nom,
    matchsJoues: eq.matchs_joues || 0,
    victoires: eq.victoires || 0,
    nuls: eq.nuls || 0,
    defaites: eq.defaites || 0,
    butsMarques: eq.buts_marques || 0,
    butsEncaisses: eq.buts_encaisses || 0,
    points: eq.points_classement || 0,
    historique: [] 
  }

  return (
    <div className="page-content">
      <div className="container-app">
        <EquipeClient equipe={equipe} stats={stats} />
      </div>
    </div>
  )
}
