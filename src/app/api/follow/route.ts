import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { userId, followerId, action } = await request.json()

    if (action === 'follow') {
      await supabase
        .from('followers')
        .insert({
          user_id: userId,
          follower_id: followerId,
          created_at: new Date().toISOString(),
        } as any)

    } else if (action === 'unfollow') {
      await supabase
        .from('followers')
        .delete()
        .eq('user_id', userId)
        .eq('follower_id', followerId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Follow error:', error)
    return NextResponse.json({ error: 'Failed to update follow status' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    const { data: followers, error } = await supabase
      .from('followers')
      .select('follower_id, profiles(id, username, avatar_url, points)')
      .eq('user_id', userId)

    if (error) throw error

    return NextResponse.json(followers)
  } catch (error) {
    console.error('Get followers error:', error)
    return NextResponse.json({ error: 'Failed to fetch followers' }, { status: 500 })
  }
}
