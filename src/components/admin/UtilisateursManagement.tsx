'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/shared/Toast'

export default function UtilisateursManagement() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const supabase = createClient() as any
  const { addToast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data } = await supabase.from('profiles').select('*').order('points', { ascending: false })
      setUsers(data || [])
    } catch (error) {
      addToast('Erreur lors du chargement', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleBanUser = async (userId: string, isBanned: boolean) => {
    try {
      await supabase.from('profiles').update({ is_banned: !isBanned }).eq('id', userId)
      addToast(isBanned ? 'Utilisateur débanni' : 'Utilisateur banni', 'success')
      fetchUsers()
    } catch (error) {
      addToast('Erreur', 'error')
    }
  }

  const handleResetPoints = async (userId: string) => {
    if (!confirm('Réinitialiser les points de cet utilisateur ?')) return
    try {
      await supabase.from('profiles').update({ points: 0 }).eq('id', userId)
      addToast('Points réinitialisés', 'success')
      fetchUsers()
    } catch (error) {
      addToast('Erreur', 'error')
    }
  }

  const handleAddPoints = async (userId: string, amount: number) => {
    try {
      const user = users.find(u => u.id === userId)
      await supabase.from('profiles').update({ points: (user?.points || 0) + amount }).eq('id', userId)
      addToast(`${amount} points ajoutés`, 'success')
      fetchUsers()
    } catch (error) {
      addToast('Erreur', 'error')
    }
  }

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div style={{ padding: 'clamp(16px, 3vw, 24px)' }}>
      <h1 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', marginBottom: 24 }}>
        👥 Gestion des Utilisateurs
      </h1>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        background: 'var(--color-surface-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-full)',
        marginBottom: 24,
      }}>
        <span>🔍</span>
        <input
          type="text"
          placeholder="Chercher un utilisateur..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            fontSize: '0.9rem',
            outline: 'none',
          }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Chargement...</div>
      ) : (
        <div style={{ background: 'var(--color-surface-card)', border: '1px solid var(--color-border)', borderRadius: 'clamp(12px, 3vw, 16px)', overflow: 'hidden' }}>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user, idx) => (
              <div key={user.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'clamp(12px, 2vw, 16px)',
                borderBottom: idx < filteredUsers.length - 1 ? '1px solid var(--color-border)' : 'none',
                flexWrap: 'wrap',
                gap: 12,
              }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
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
                        user.username?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                        {user.username}
                        {user.is_admin && <span style={{ marginLeft: 8, color: 'var(--color-primary)', fontWeight: 700 }}>👑</span>}
                        {user.is_banned && <span style={{ marginLeft: 8, color: 'var(--color-red)', fontWeight: 700 }}>🚫</span>}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        {user.email}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: '1rem', color: 'var(--color-primary)' }}>
                      {user.points}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      points
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => handleAddPoints(user.id, 10)}
                      title="Ajouter 10 points"
                      style={{
                        padding: '6px 10px',
                        background: 'var(--color-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                      }}
                    >
                      +10
                    </button>
                    <button
                      onClick={() => handleResetPoints(user.id)}
                      title="Réinitialiser les points"
                      style={{
                        padding: '6px 10px',
                        background: 'var(--color-red)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                      }}
                    >
                      🔄
                    </button>
                    <button
                      onClick={() => handleBanUser(user.id, user.is_banned)}
                      title={user.is_banned ? 'Débannir' : 'Bannir'}
                      style={{
                        padding: '6px 10px',
                        background: user.is_banned ? 'var(--color-primary)' : 'var(--color-red)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                      }}
                    >
                      {user.is_banned ? '✓' : '🚫'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
              Aucun utilisateur trouvé
            </div>
          )}
        </div>
      )}
    </div>
  )
}
