import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { UserProfileClient } from '@/components/profil/UserProfileClient'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await supabase.from('profiles').select('username, full_name').eq('id', id).single() as any
  return {
    title: `${data?.full_name || data?.username || 'Profil'} - NavéStats`,
    description: `Profil communautaire NavéStats de ${data?.username || 'ce pronostiqueur'}.`,
  }
}

export default async function ProfilPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', id).single()

  if (!profile) notFound()

  // Fetch followers
  const { data: followersData } = await supabase
    .from('followers')
    .select('follower_id, profiles!followers_follower_id_fkey(username, avatar_url, points)')
    .eq('following_id', id)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const followers = (followersData || []).map((f: any) => ({
    id: f.follower_id,
    name: f.profiles?.username,
    avatar: f.profiles?.avatar_url,
    points: f.profiles?.points,
  }))

  // Check if current user is following this profile
  let isFollowing = false
  if (currentUser) {
    const { data: followCheck } = await supabase
      .from('followers')
      .select('id')
      .eq('follower_id', currentUser.id)
      .eq('following_id', id)
      .single()
    
    if (followCheck) isFollowing = true
  }

  // Server Action for handling follow/unfollow
  async function handleFollowChange(userId: string, shouldFollow: boolean) {
    'use server'
    const supabaseServer = await createClient()
    const { data: { user } } = await supabaseServer.auth.getUser()
    
    if (!user) throw new Error('Non autorisé')
    
    if (shouldFollow) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await supabaseServer.from('followers').insert({
        follower_id: user.id,
        following_id: userId
      } as any)
    } else {
      await supabaseServer.from('followers')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId)
    }
  }

  return (
    <div className="page-content">
      <div className="container-app">
        <UserProfileClient
          user={profile}
          followers={followers}
          isFollowing={isFollowing}
          onFollowChange={handleFollowChange}
        />
      </div>
    </div>
  )
}
