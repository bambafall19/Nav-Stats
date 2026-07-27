import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const query = request.nextUrl.searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json([])
    }

    const searchTerm = `%${query}%`

    // Rechercher les pronostiqueurs
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, points')
      .ilike('username', searchTerm)
      .limit(5)

    // Rechercher les équipes
    const { data: equipes, error: equipesError } = await supabase
      .from('equipes')
      .select('id, nom, logo_url, points_classement')
      .ilike('nom', searchTerm)
      .limit(5)

    if (usersError || equipesError) {
      throw usersError || equipesError
    }

    const results: any[] = [
      ...(users || []).map((u: any) => ({
        id: u.id,
        name: u.username,
        type: 'pronostiqueur',
        avatar: u.avatar_url,
        points: u.points,
      })),
      ...(equipes || []).map((eq: any) => ({
        id: eq.id,
        name: eq.nom,
        type: 'equipe',
        avatar: eq.logo_url,
        points: eq.points_classement,
      })),
    ]

    return NextResponse.json(results)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Failed to search' }, { status: 500 })
  }
}
