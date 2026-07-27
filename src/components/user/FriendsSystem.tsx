'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/shared/Toast'
import Link from 'next/link'

export function FriendsSystem({ userId }: { userId: string }) {
  const [friends, setFriends] = useState<any[]>([])
  const [friendRequests, setFriendRequests] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient() as any
  const { addToast } = useToast()

  useEffect(() => {
    fetchFriends()
  }, [userId])

  const fetchFriends = async () => {
    try {
      const { data: friendsList } = await supabase
        .from('friendships')
        .select('*, friend:profiles!friend_id(*)')
        .eq('user_id', userId)
        .eq('status', 'accepted')

      const { data: requests } = await supabase
        .from('friendships')
        .select('*, requester:profiles!user_id(*)')
        .eq('friend_id', userId)
        .eq('status', 'pending')

      setFriends(friendsList?.map((f: any) => f.friend) || [])
      setFriendRequests(requests || [])
    } catch (error) {
      addToast('Erreur lors du chargement', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', `%${query}%`)
        .neq('id', userId)
        .limit(5)

      setSearchResults(data || [])
    } catch (error) {
      addToast('Erreur de recherche', 'error')
    }
  }

  const handleAddFriend = async (friendId: string) => {
    try {
      await supabase.from('friendships').insert({
        user_id: userId,
        friend_id: friendId,
        status: 'pending',
      })
      addToast('Demande d\'amitié envoyée', 'success')
      setSearchQuery('')
      setSearchResults([])
    } catch (error) {
      addToast('Erreur', 'error')
    }
  }

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', requestId)
      addToast('Ami ajouté', 'success')
      fetchFriends()
    } catch (error) {
      addToast('Erreur', 'error')
    }
  }

  const handleRemoveFriend = async (friendId: string) => {
    try {
      await supabase
        .from('friendships')
        .delete()
        .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`)
      addToast('Ami supprimé', 'success')
      fetchFriends()
    } catch (error) {
      addToast('Erreur', 'error')
    }
  }

  if (loading) {
    return <div style={{ padding: 20, textAlign: 'center' }}>Chargement...</div>
  }

  return (
    <div style={{ padding: 'clamp(16px, 3vw, 24px)' }}>
      <h1 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', marginBottom: 24 }}>
        👥 Amis ({friends.length})
      </h1>

      {/* Search */}
      <div style={{ marginBottom: 'clamp(24px, 5vw, 32px)' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          background: 'var(--color-surface-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-full)',
          marginBottom: 12,
        }}>
          <span>🔍</span>
          <input
            type="text"
            placeholder="Chercher un utilisateur..."
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontSize: '0.9rem',
              outline: 'none',
            }}
          />
        </div>

        {searchResults.length > 0 && (
          <div style={{
            background: 'var(--color-surface-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
          }}>
            {searchResults.map((user, idx) => (
              <div key={user.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: idx < searchResults.length - 1 ? '1px solid var(--color-border)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'var(--gradient-green)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'white',
                  }}>
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      user.username.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.username}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{user.points} points</div>
                  </div>
                </div>
                <button
                  onClick={() => handleAddFriend(user.id)}
                  style={{
                    padding: '6px 12px',
                    background: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                >
                  + Ajouter
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Friend Requests */}
      {friendRequests.length > 0 && (
        <div style={{ marginBottom: 'clamp(24px, 5vw, 32px)' }}>
          <h2 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: '1rem', marginBottom: 12 }}>
            📬 Demandes d'amitié ({friendRequests.length})
          </h2>
          <div style={{
            background: 'var(--color-surface-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
          }}>
            {friendRequests.map((req, idx) => (
              <div key={req.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: idx < friendRequests.length - 1 ? '1px solid var(--color-border)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'var(--gradient-green)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'white',
                  }}>
                    {req.requester.avatar_url ? (
                      <img src={req.requester.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      req.requester.username.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{req.requester.username}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{req.requester.points} points</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleAcceptRequest(req.id)}
                    style={{
                      padding: '6px 12px',
                      background: 'var(--color-primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                    }}
                  >
                    ✓ Accepter
                  </button>
                  <button
                    onClick={() => handleRemoveFriend(req.user_id)}
                    style={{
                      padding: '6px 12px',
                      background: 'var(--color-red)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                    }}
                  >
                    ✕ Refuser
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div>
        <h2 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: '1rem', marginBottom: 12 }}>
          👫 Mes Amis
        </h2>
        {friends.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 'clamp(12px, 2vw, 16px)',
          }}>
            {friends.map(friend => (
              <Link key={friend.id} href={`/profil/${friend.id}`} style={{
                background: 'var(--color-surface-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'clamp(12px, 2vw, 16px)',
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
                textAlign: 'center',
                transition: 'all 0.2s',
              }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  background: 'var(--gradient-green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: 'white',
                }}>
                  {friend.avatar_url ? (
                    <img src={friend.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    friend.username.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>
                    {friend.username}
                  </div>
                  <div style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: '1rem', color: 'var(--color-primary)' }}>
                    {friend.points} pts
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    handleRemoveFriend(friend.id)
                  }}
                  style={{
                    padding: '6px 12px',
                    background: 'var(--color-red)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  ✕ Supprimer
                </button>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{
            background: 'var(--color-surface-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'clamp(24px, 5vw, 32px)',
            textAlign: 'center',
            color: 'var(--color-text-muted)',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>👫</div>
            <div>Aucun ami pour le moment</div>
          </div>
        )}
      </div>
    </div>
  )
}
