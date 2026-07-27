import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    // Récupérer les notifications de classement
    const { data: notifications, error } = await supabase
      .from('ranking_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) throw error

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Notifications error:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from('ranking_notifications')
      .insert({
        user_id: body.userId,
        type: body.type,
        old_rank: body.oldRank,
        new_rank: body.newRank,
        message: body.message,
        created_at: new Date().toISOString(),
      } as any)
      .select()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Create notification error:', error)
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
  }
}
