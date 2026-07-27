import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const supabase = await createClient()
    const { userId } = await params

    // Récupérer les statistiques personnalisées
    const { data: stats, error } = await supabase
      .from('user_statistics')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    // Récupérer les statistiques mensuelles
    const { data: monthlyStats } = await supabase
      .from('monthly_statistics')
      .select('*')
      .eq('user_id', userId)
      .order('month', { ascending: false })
      .limit(12)

    // Récupérer les statistiques hebdomadaires
    const { data: weeklyStats } = await supabase
      .from('weekly_statistics')
      .select('*')
      .eq('user_id', userId)
      .order('week', { ascending: false })
      .limit(12)

    return NextResponse.json({
      personalStats: stats,
      monthlyStats: monthlyStats || [],
      weeklyStats: weeklyStats || [],
    })
  } catch (error) {
    console.error('Get statistics error:', error)
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 })
  }
}
