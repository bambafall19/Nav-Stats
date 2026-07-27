import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const supabase = await createClient()
    const { userId } = await params

    const { data: achievements, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(achievements || [])
  } catch (error) {
    console.error('Get achievements error:', error)
    return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const supabase = await createClient()
    const { userId } = await params
    const { achievementId } = await request.json()

    const { data, error } = await supabase
      .from('user_achievements')
      .insert({
        user_id: userId,
        achievement_id: achievementId,
        earned_at: new Date().toISOString(),
      } as any)
      .select()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Create achievement error:', error)
    return NextResponse.json({ error: 'Failed to create achievement' }, { status: 500 })
  }
}
